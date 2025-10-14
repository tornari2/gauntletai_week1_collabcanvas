import React, { useRef, useState, useEffect, useCallback, memo } from 'react'
import { Stage, Layer, Rect } from 'react-konva'
import { v4 as uuidv4 } from 'uuid'
import { CANVAS_CONFIG, SHAPE_DEFAULTS } from '../utils/constants'
import { useCanvas } from '../context/CanvasContext'
import { useAuth } from '../context/AuthContext'

// Memoized Rectangle component for performance
const Rectangle = memo(({ shape, isSelected, userColor, onClick }) => {
  return (
    <Rect
      x={shape.x}
      y={shape.y}
      width={shape.width}
      height={shape.height}
      fill={shape.fillColor}
      stroke={isSelected ? userColor : shape.borderColor}
      strokeWidth={isSelected ? SHAPE_DEFAULTS.SELECTION_STROKE_WIDTH : SHAPE_DEFAULTS.DEFAULT_STROKE_WIDTH}
      listening={true}
      onClick={onClick}
      onTap={onClick}
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
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 })
  const [stageScale, setStageScale] = useState(1)
  const isPanning = useRef(false)
  
  // Canvas context and auth
  const { shapes, selectedShapeId, creatingRectangle, setCreatingRectangle, addShape, selectShape } = useCanvas()
  const { currentUser } = useAuth()
  
  // Rectangle creation state
  const [isDrawing, setIsDrawing] = useState(false)
  const [startPos, setStartPos] = useState(null)
  const [previewRect, setPreviewRect] = useState(null)
  const previewUpdateTimer = useRef(null)


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
    
    // Otherwise, start panning on left click or middle click
    if (e.evt.button === 0 || e.evt.button === 1) {
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
                return (
                  <Rectangle
                    key={shape.id}
                    shape={shape}
                    isSelected={shape.id === selectedShapeId}
                    userColor={currentUser?.colorHex || '#000000'}
                    onClick={() => handleShapeClick(shape.id)}
                  />
                )
              }
              return null
            })}
            
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
