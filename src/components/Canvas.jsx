import React, { useRef, useState, useEffect, useCallback, memo } from 'react'
import { Stage, Layer, Rect, Transformer } from 'react-konva'
import { v4 as uuidv4 } from 'uuid'
import { CANVAS_CONFIG, SHAPE_DEFAULTS, SYNC_CONFIG } from '../utils/constants'
import { useCanvas } from '../context/CanvasContext'
import { useAuth } from '../context/AuthContext'

// Memoized Rectangle component for performance
const Rectangle = memo(({ 
  shape, 
  isSelected, 
  userColor, 
  onClick, 
  onDragStart, 
  onDragMove, 
  onDragEnd,
  onTransformStart,
  onTransformEnd,
  shapeRef 
}) => {
  const handleClick = (e) => {
    e.cancelBubble = true // Prevent event from bubbling to stage
    onClick(e)
  }

  return (
    <Rect
      ref={shapeRef}
      x={shape.x}
      y={shape.y}
      width={shape.width}
      height={shape.height}
      fill={shape.fillColor}
      stroke={isSelected ? userColor : shape.borderColor}
      strokeWidth={isSelected ? SHAPE_DEFAULTS.SELECTION_STROKE_WIDTH : SHAPE_DEFAULTS.DEFAULT_STROKE_WIDTH}
      listening={true}
      draggable={true}
      onClick={handleClick}
      onTap={handleClick}
      onDragStart={onDragStart}
      onDragMove={onDragMove}
      onDragEnd={onDragEnd}
      onTransformStart={onTransformStart}
      onTransformEnd={onTransformEnd}
      onMouseEnter={(e) => {
        const stage = e.target.getStage()
        if (stage) {
          stage.container().style.cursor = 'move'
        }
      }}
      onMouseLeave={(e) => {
        const stage = e.target.getStage()
        if (stage) {
          stage.container().style.cursor = 'default'
        }
      }}
      perfectDrawEnabled={false}
    />
  )
})

function Canvas() {
  const containerRef = useRef(null)
  const stageRef = useRef(null)
  const transformerRef = useRef(null)
  const selectedShapeRef = useRef(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 })
  const [stageScale, setStageScale] = useState(1)
  const isPanning = useRef(false)
  
  // Canvas context and auth
  const { shapes, selectedShapeId, creatingRectangle, setCreatingRectangle, addShape, selectShape, deleteShape, updateShape } = useCanvas()
  const { currentUser, userProfile } = useAuth()
  
  // Rectangle creation state
  const [isDrawing, setIsDrawing] = useState(false)
  const [startPos, setStartPos] = useState(null)
  const [previewRect, setPreviewRect] = useState(null)
  const previewUpdateTimer = useRef(null)
  
  // Drag/transform throttling
  const dragUpdateTimer = useRef(null)
  const transformUpdateTimer = useRef(null)
  const isDragging = useRef(false)
  const isTransforming = useRef(false)


  // Calculate canvas dimensions on mount and resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth
        const height = containerRef.current.offsetHeight
        
        // Only update if we have valid dimensions
        if (width > 0 && height > 0) {
          setDimensions({ width, height })
        }
      }
    }

    // Use requestAnimationFrame to ensure container is rendered
    const rafId = requestAnimationFrame(() => {
      updateDimensions()
    })

    // Also set up resize listener
    window.addEventListener('resize', updateDimensions)

    // Cleanup
    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', updateDimensions)
    }
  }, [])

  // Prevent default browser pan/zoom behavior
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Prevent context menu on right click
    const preventContextMenu = (e) => {
      e.preventDefault()
    }

    // Prevent default wheel behavior (browser zoom)
    const preventDefaultWheel = (e) => {
      e.preventDefault()
    }

    container.addEventListener('contextmenu', preventContextMenu)
    container.addEventListener('wheel', preventDefaultWheel, { passive: false })

    return () => {
      container.removeEventListener('contextmenu', preventContextMenu)
      container.removeEventListener('wheel', preventDefaultWheel)
    }
  }, [])

  // Handle keyboard events for shape deletion
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Delete or Backspace key
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedShapeId) {
        e.preventDefault() // Prevent default browser back navigation on Backspace
        deleteShape(selectedShapeId)
      }
    }

    // Attach to document so it works when canvas is focused
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [selectedShapeId, deleteShape])

  // Clear preview rectangle when creation mode is turned off
  useEffect(() => {
    if (!creatingRectangle) {
      setIsDrawing(false)
      setStartPos(null)
      setPreviewRect(null)
    }
  }, [creatingRectangle])

  // Attach transformer to selected shape
  useEffect(() => {
    const transformer = transformerRef.current
    const selectedNode = selectedShapeRef.current
    
    if (transformer && selectedShapeId && selectedNode) {
      // Attach transformer to the selected shape
      transformer.nodes([selectedNode])
      transformer.getLayer().batchDraw()
    } else if (transformer) {
      // Detach transformer if no selection
      transformer.nodes([])
      transformer.getLayer().batchDraw()
    }
  }, [selectedShapeId])

  // Drag handlers for shapes
  const handleShapeDragStart = useCallback((shapeId) => {
    isDragging.current = true
    // Select the shape being dragged
    selectShape(shapeId)
    // Disable panning while dragging shape
    isPanning.current = false
  }, [selectShape])

  const handleShapeDragMove = useCallback((shapeId, e) => {
    if (!isDragging.current) return
    
    // Throttle updates to avoid overwhelming the system
    if (dragUpdateTimer.current) {
      clearTimeout(dragUpdateTimer.current)
    }
    
    dragUpdateTimer.current = setTimeout(() => {
      const node = e.target
      updateShape(shapeId, {
        x: node.x(),
        y: node.y(),
        updatedAt: Date.now(),
        lastModifiedBy: currentUser?.uid || 'unknown'
      })
    }, SYNC_CONFIG.SHAPE_UPDATE_THROTTLE_MS)
  }, [updateShape, currentUser])

  const handleShapeDragEnd = useCallback((shapeId, e) => {
    isDragging.current = false
    
    // Clear any pending throttled update
    if (dragUpdateTimer.current) {
      clearTimeout(dragUpdateTimer.current)
    }
    
    // Final update with exact position
    const node = e.target
    updateShape(shapeId, {
      x: node.x(),
      y: node.y(),
      updatedAt: Date.now(),
      lastModifiedBy: currentUser?.uid || 'unknown'
    })
  }, [updateShape, currentUser])

  // Transform handlers for shapes (resize)
  const handleShapeTransformStart = useCallback(() => {
    isTransforming.current = true
  }, [])

  const handleShapeTransformEnd = useCallback((shapeId, e) => {
    isTransforming.current = false
    
    // Clear any pending throttled update
    if (transformUpdateTimer.current) {
      clearTimeout(transformUpdateTimer.current)
    }
    
    // Get the transformed node
    const node = e.target
    const scaleX = node.scaleX()
    const scaleY = node.scaleY()
    
    // Calculate new dimensions based on scale
    const newWidth = Math.max(SHAPE_DEFAULTS.MIN_SHAPE_SIZE, node.width() * scaleX)
    const newHeight = Math.max(SHAPE_DEFAULTS.MIN_SHAPE_SIZE, node.height() * scaleY)
    
    // Reset scale to 1 after applying to width/height
    node.scaleX(1)
    node.scaleY(1)
    
    // Update shape with new dimensions
    updateShape(shapeId, {
      x: node.x(),
      y: node.y(),
      width: newWidth,
      height: newHeight,
      updatedAt: Date.now(),
      lastModifiedBy: currentUser?.uid || 'unknown'
    })
  }, [updateShape, currentUser])

  // Pan functionality: Enable dragging the entire stage
  const handleMouseDown = useCallback((e) => {
    const stage = stageRef.current
    if (!stage) return

    // If creating rectangle mode, start drawing
    if (creatingRectangle && e.evt.button === 0) {
      const pos = stage.getPointerPosition()
      if (!pos) return
      
      // Convert to canvas coordinates
      const canvasPos = {
        x: (pos.x - stage.x()) / stage.scaleX(),
        y: (pos.y - stage.y()) / stage.scaleY()
      }
      
      setIsDrawing(true)
      setStartPos(canvasPos)
      setPreviewRect(null)
      return
    }
    
    // Don't start panning if we're dragging a shape or transforming
    if (isDragging.current || isTransforming.current) {
      return
    }
    
    // Start panning on left click or middle click (only on empty canvas)
    const clickedOnEmpty = e.target === stage
    if (clickedOnEmpty && (e.evt.button === 0 || e.evt.button === 1)) {
      isPanning.current = true
    }
  }, [creatingRectangle])

  const handleMouseUp = useCallback(() => {
    const stage = stageRef.current
    
    // If we were drawing a rectangle, create it
    if (isDrawing && startPos && stage) {
      const pos = stage.getPointerPosition()
      if (pos) {
        const canvasPos = {
          x: (pos.x - stage.x()) / stage.scaleX(),
          y: (pos.y - stage.y()) / stage.scaleY()
        }
        
        // Calculate dimensions
        const width = Math.abs(canvasPos.x - startPos.x)
        const height = Math.abs(canvasPos.y - startPos.y)
        
        // Only create if minimum size
        if (width >= SHAPE_DEFAULTS.MIN_SHAPE_SIZE && height >= SHAPE_DEFAULTS.MIN_SHAPE_SIZE) {
          const rectangle = {
            id: uuidv4(),
            type: 'rectangle',
            x: Math.min(startPos.x, canvasPos.x),
            y: Math.min(startPos.y, canvasPos.y),
            width,
            height,
            fillColor: SHAPE_DEFAULTS.DEFAULT_FILL_COLOR,
            borderColor: SHAPE_DEFAULTS.DEFAULT_STROKE_COLOR,
            ownerId: currentUser?.uid || 'unknown',
            createdAt: Date.now(),
            updatedAt: Date.now(),
            lastModifiedBy: currentUser?.uid || 'unknown'
          }
          
          addShape(rectangle)
        }
      }
      
      // Reset drawing state and exit creation mode
      setIsDrawing(false)
      setStartPos(null)
      setPreviewRect(null)
      setCreatingRectangle(false)
    }
    
    isPanning.current = false
  }, [isDrawing, startPos, addShape, currentUser, setCreatingRectangle])

  const handleMouseMove = useCallback((e) => {
    const stage = stageRef.current
    if (!stage) return
    
    // If drawing rectangle, update preview (throttled with RAF)
    if (isDrawing && startPos) {
      if (previewUpdateTimer.current) {
        cancelAnimationFrame(previewUpdateTimer.current)
      }
      
      previewUpdateTimer.current = requestAnimationFrame(() => {
        const pos = stage.getPointerPosition()
        if (pos) {
          const canvasPos = {
            x: (pos.x - stage.x()) / stage.scaleX(),
            y: (pos.y - stage.y()) / stage.scaleY()
          }
          
          setPreviewRect({
            x: Math.min(startPos.x, canvasPos.x),
            y: Math.min(startPos.y, canvasPos.y),
            width: Math.abs(canvasPos.x - startPos.x),
            height: Math.abs(canvasPos.y - startPos.y)
          })
        }
      })
      return
    }
    
    // Panning: directly update stage position without React state
    if (isPanning.current) {
      stage.x(stage.x() + e.evt.movementX)
      stage.y(stage.y() + e.evt.movementY)
      stage.batchDraw()
    }
  }, [isDrawing, startPos])

  // Zoom functionality: Mouse wheel zooms toward cursor position
  const handleWheel = useCallback((e) => {
    e.evt.preventDefault()
    
    const stage = stageRef.current
    if (!stage) return

    const scaleBy = 1.05
    const oldScale = stage.scaleX()

    // Get pointer position (mouse cursor)
    const pointer = stage.getPointerPosition()
    if (!pointer) return

    // Calculate mouse position relative to stage
    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale
    }

    // Calculate new scale
    const direction = e.evt.deltaY > 0 ? -1 : 1
    let newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy

    // Apply zoom limits
    newScale = Math.max(CANVAS_CONFIG.MIN_ZOOM, Math.min(CANVAS_CONFIG.MAX_ZOOM, newScale))

    // Calculate new position to zoom toward cursor
    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale
    }

    // Directly update stage properties without React state
    stage.scaleX(newScale)
    stage.scaleY(newScale)
    stage.x(newPos.x)
    stage.y(newPos.y)
    stage.batchDraw()
  }, [])

  // Handle shape click for selection
  const handleShapeClick = useCallback((shapeId) => {
    // Clear any drawing state
    setIsDrawing(false)
    setStartPos(null)
    setPreviewRect(null)
    // Select the shape
    selectShape(shapeId)
  }, [selectShape])

  // Handle stage click for deselection (click on empty canvas)
  const handleStageClick = useCallback((e) => {
    // Check if we clicked on the stage itself (not a shape)
    const clickedOnEmpty = e.target === e.target.getStage()
    if (clickedOnEmpty) {
      selectShape(null)
    }
  }, [selectShape])

  return (
    <div ref={containerRef} className="canvas-container">
      {dimensions.width > 0 && dimensions.height > 0 ? (
        <Stage
          ref={stageRef}
          width={dimensions.width}
          height={dimensions.height}
          draggable={false}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          onWheel={handleWheel}
          onClick={handleStageClick}
          onTap={handleStageClick}
          style={{ backgroundColor: '#ffffff' }}
        >
          <Layer>
            {/* Render all shapes */}
            {shapes.map((shape) => {
              if (shape.type === 'rectangle') {
                const isSelected = shape.id === selectedShapeId
                return (
                  <Rectangle
                    key={shape.id}
                    shape={shape}
                    isSelected={isSelected}
                    userColor={userProfile?.colorHex || '#000000'}
                    onClick={() => handleShapeClick(shape.id)}
                    onDragStart={() => handleShapeDragStart(shape.id)}
                    onDragMove={(e) => handleShapeDragMove(shape.id, e)}
                    onDragEnd={(e) => handleShapeDragEnd(shape.id, e)}
                    onTransformStart={() => handleShapeTransformStart()}
                    onTransformEnd={(e) => handleShapeTransformEnd(shape.id, e)}
                    shapeRef={isSelected ? selectedShapeRef : null}
                  />
                )
              }
              return null
            })}
            
            {/* Transformer for resizing selected shape */}
            <Transformer
              ref={transformerRef}
              boundBoxFunc={(oldBox, newBox) => {
                // Enforce minimum size during transform
                if (newBox.width < SHAPE_DEFAULTS.MIN_SHAPE_SIZE || newBox.height < SHAPE_DEFAULTS.MIN_SHAPE_SIZE) {
                  return oldBox
                }
                return newBox
              }}
            />
            
            {/* Preview rectangle while drawing */}
            {previewRect && (
              <Rect
                x={previewRect.x}
                y={previewRect.y}
                width={previewRect.width}
                height={previewRect.height}
                fill={SHAPE_DEFAULTS.DEFAULT_FILL_COLOR}
                stroke={SHAPE_DEFAULTS.DEFAULT_STROKE_COLOR}
                strokeWidth={SHAPE_DEFAULTS.DEFAULT_STROKE_WIDTH}
                dash={[5, 5]}
                opacity={0.7}
                listening={false}
                perfectDrawEnabled={false}
              />
            )}
          </Layer>
        </Stage>
      ) : (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          color: '#666'
        }}>
          Initializing canvas...
        </div>
      )}
    </div>
  )
}

export default Canvas
