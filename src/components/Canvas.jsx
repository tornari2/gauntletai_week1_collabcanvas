import React, { useRef, useState, useEffect, useCallback, memo } from 'react'
import { Stage, Layer, Rect, Ellipse, Line, Arrow, Text, Transformer, Group } from 'react-konva'
import { v4 as uuidv4 } from 'uuid'
import { CANVAS_CONFIG, SHAPE_DEFAULTS, SYNC_CONFIG } from '../utils/constants'
import Z_INDEX from '../utils/zIndex'
import { useCanvas } from '../context/CanvasContext'
import { useAuth } from '../context/AuthContext'
import { usePresence } from '../context/PresenceContext'
import { useCursorSync } from '../hooks/useCursorSync'
import { getUserColorHex } from '../utils/colorGenerator'
import Cursor from './Cursor'

// Helper function to convert border style to Konva dash array
function getBorderDash(borderStyle) {
  switch (borderStyle) {
    case 'dashed':
      return [10, 5] // 10px line, 5px gap
    case 'dotted':
      return [2, 4] // 2px line, 4px gap
    case 'solid':
    default:
      return [] // Solid line (no dashing)
  }
}

// Helper function to convert hex color and opacity to rgba
function hexToRgba(hex, opacity) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${opacity})`
}

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

  // Use shape's stored strokeWidth or default
  const strokeWidth = shape.strokeWidth || SHAPE_DEFAULTS.DEFAULT_STROKE_WIDTH

  return (
    <Group
      id={`shape-${shape.id}`}
      ref={shapeRef}
      x={shape.x}
      y={shape.y}
      rotation={shape.rotation || 0}
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
    >
      {/* Actual shape */}
      <Rect
        width={shape.width}
        height={shape.height}
        fill={shape.fillColor}
        stroke={shape.borderColor}
        strokeWidth={strokeWidth}
        dash={getBorderDash(shape.borderStyle || 'solid')}
        listening={true}
        perfectDrawEnabled={false}
        strokeScaleEnabled={false}
      />
    </Group>
  )
})

// Memoized Diamond component for performance
const DiamondShape = memo(({ 
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
    e.cancelBubble = true
    onClick(e)
  }

  // Use shape's stored strokeWidth or default
  const strokeWidth = shape.strokeWidth || SHAPE_DEFAULTS.DEFAULT_STROKE_WIDTH

  // Calculate diamond points from width and height
  const points = [
    shape.width / 2, 0,                    // Top point
    shape.width, shape.height / 2,         // Right point
    shape.width / 2, shape.height,         // Bottom point
    0, shape.height / 2                    // Left point
  ]

  return (
    <Group
      id={`shape-${shape.id}`}
      ref={shapeRef}
      x={shape.x}
      y={shape.y}
      rotation={shape.rotation || 0}
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
    >
      {/* Actual shape */}
      <Line
        points={points}
        fill={shape.fillColor}
        stroke={shape.borderColor}
        strokeWidth={strokeWidth}
        dash={getBorderDash(shape.borderStyle || 'solid')}
        closed={true}
        listening={true}
        perfectDrawEnabled={false}
        strokeScaleEnabled={false}
      />
    </Group>
  )
})

// Memoized Ellipse component for performance
const EllipseShape = memo(({ 
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
    e.cancelBubble = true
    onClick(e)
  }

  // Use shape's stored strokeWidth or default
  const strokeWidth = shape.strokeWidth || SHAPE_DEFAULTS.DEFAULT_STROKE_WIDTH

  return (
    <Group
      id={`shape-${shape.id}`}
      ref={shapeRef}
      x={shape.x}
      y={shape.y}
      rotation={shape.rotation || 0}
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
    >
      {/* Actual shape */}
      <Ellipse
        radiusX={shape.radiusX}
        radiusY={shape.radiusY}
        fill={shape.fillColor}
        stroke={shape.borderColor}
        dash={getBorderDash(shape.borderStyle || 'solid')}
        strokeWidth={strokeWidth}
        listening={true}
        perfectDrawEnabled={false}
        strokeScaleEnabled={false}
      />
    </Group>
  )
})

// Memoized Line component for performance (formerly Arrow)
const ArrowShape = memo(({ 
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
    e.cancelBubble = true
    onClick(e)
  }

  // Use shape's stored strokeWidth or default
  const strokeWidth = shape.strokeWidth || SHAPE_DEFAULTS.DEFAULT_STROKE_WIDTH

  return (
    <Group
      id={`shape-${shape.id}`}
      ref={shapeRef}
      x={shape.x}
      y={shape.y}
      rotation={shape.rotation || 0}
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
    >
      {/* Actual shape */}
      <Arrow
        points={shape.points}
        stroke={shape.borderColor}
        fill={shape.borderColor}
        strokeWidth={strokeWidth}
        dash={getBorderDash(shape.borderStyle || 'solid')}
        hitStrokeWidth={20}
        listening={true}
        perfectDrawEnabled={false}
        strokeScaleEnabled={false}
        pointerLength={strokeWidth * 5}
        pointerWidth={strokeWidth * 5}
      />
    </Group>
  )
})

// Memoized Text component for performance
const TextShape = memo(({ 
  shape, 
  isSelected, 
  userColor,
  isEditing,
  onClick, 
  onDragStart, 
  onDragMove, 
  onDragEnd,
  onTransformStart,
  onTransformEnd,
  onDoubleClick,
  shapeRef 
}) => {
  const handleClick = (e) => {
    e.cancelBubble = true
    onClick(e)
  }

  const handleDoubleClick = (e) => {
    e.cancelBubble = true
    onDoubleClick(e)
  }

  // Convert font size from string to pixels
  const getFontSizePixels = (sizeStr) => {
    if (typeof sizeStr === 'number') return sizeStr // Legacy numeric font sizes
    switch (sizeStr) {
      case 'small': return 18
      case 'medium': return 24
      case 'large': return 32
      default: return 24
    }
  }

  const fontSizePixels = getFontSizePixels(shape.fontSize || 'medium')
  const shapeFontWeight = shape.fontWeight || 'normal'
  const shapeFontStyle = shape.fontStyle || 'normal'
  const shapeTextDecoration = shape.textDecoration || 'none'
  const shapeFontFamily = shape.fontFamily || 'Arial'
  
  // Combine fontStyle and fontWeight for Konva
  // Konva's fontStyle accepts strings like "normal", "italic", "bold", "italic bold"
  let combinedFontStyle = ''
  if (shapeFontStyle === 'italic') {
    combinedFontStyle = shapeFontWeight === 'bold' ? 'italic bold' : 'italic'
  } else {
    combinedFontStyle = shapeFontWeight === 'bold' ? 'bold' : 'normal'
  }

  return (
    <Group
      id={`shape-${shape.id}`}
      ref={shapeRef}
      x={shape.x}
      y={shape.y}
      rotation={shape.rotation || 0}
      scaleX={shape.scaleX || 1}
      scaleY={shape.scaleY || 1}
      draggable={true}
      onClick={handleClick}
      onTap={handleClick}
      onDblClick={handleDoubleClick}
      onDblTap={handleDoubleClick}
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
    >
      {/* Show text at full opacity always - no dashed box when editing */}
      {!shape.text || shape.text.trim() === '' ? (
        // Only show dashed box if NOT currently editing
        !isEditing && (
          <Rect
            width={100}
            height={fontSizePixels + 10}
            stroke={shape.fillColor}
            strokeWidth={2}
            dash={[5, 5]}
            listening={true}
            perfectDrawEnabled={false}
          />
        )
      ) : (
        <Text
          text={shape.text}
          fontSize={fontSizePixels}
          fontFamily={shapeFontFamily}
          fontStyle={combinedFontStyle}
          textDecoration={shapeTextDecoration}
          fill={shape.fillColor}
          listening={true}
          perfectDrawEnabled={false}
        />
      )}
    </Group>
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
  const lastCursorPos = useRef({ x: 0, y: 0 }) // Track cursor position for duplication
  
  // Canvas context and auth
  const { 
    shapes, 
    selectedShapeId,
    selectedShapeIds,
    creatingRectangle, 
    setCreatingRectangle,
    creatingDiamond,
    setCreatingDiamond,
    creatingCircle,
    setCreatingCircle,
    creatingArrow,
    setCreatingArrow,
    fillColor,
    fillOpacity,
    borderThickness,
    borderStyle,
    fontSize,
    fontWeight,
    fontStyle,
    textDecoration,
    fontFamily,
    getNewShapeZIndex,
    addShape, 
    selectShape, 
    selectShapes,
    deleteShape,
    deleteShapes, 
    updateShape,
    updateShapes
  } = useCanvas()
  const { currentUser, userProfile } = useAuth()
  
  // Presence and cursor tracking
  const { cursors } = usePresence()
  const { syncCursorPosition } = useCursorSync()
  
  // Get user color with fallback to generated color based on email
  const userColor = userProfile?.colorHex || 
    (currentUser?.email ? getUserColorHex(currentUser.email) : '#000000')
  
  // Helper function to detect if a shape is within selection box
  const isShapeInSelectionBox = useCallback((shape, box) => {
    if (!box) return false
    
    const boxLeft = box.x
    const boxRight = box.x + box.width
    const boxTop = box.y
    const boxBottom = box.y + box.height
    
    if (shape.type === 'rectangle') {
      const shapeLeft = shape.x
      const shapeRight = shape.x + shape.width
      const shapeTop = shape.y
      const shapeBottom = shape.y + shape.height
      
      // Check if rectangles overlap
      return !(shapeRight < boxLeft || shapeLeft > boxRight || shapeBottom < boxTop || shapeTop > boxBottom)
    } else if (shape.type === 'diamond') {
      // Check if diamond's bounding box overlaps with selection box
      const shapeLeft = shape.x
      const shapeRight = shape.x + shape.width
      const shapeTop = shape.y
      const shapeBottom = shape.y + shape.height
      
      return !(shapeRight < boxLeft || shapeLeft > boxRight || shapeBottom < boxTop || shapeTop > boxBottom)
    } else if (shape.type === 'circle') {
      // Check if ellipse overlaps with box (use bounding box of ellipse)
      const shapeLeft = shape.x - shape.radiusX
      const shapeRight = shape.x + shape.radiusX
      const shapeTop = shape.y - shape.radiusY
      const shapeBottom = shape.y + shape.radiusY
      
      return !(shapeRight < boxLeft || shapeLeft > boxRight || shapeBottom < boxTop || shapeTop > boxBottom)
    } else if (shape.type === 'arrow') {
      // Check if any point of the line is within box
      const [x1, y1, x2, y2] = shape.points
      const point1In = x1 >= boxLeft && x1 <= boxRight && y1 >= boxTop && y1 <= boxBottom
      const point2In = x2 >= boxLeft && x2 <= boxRight && y2 >= boxTop && y2 <= boxBottom
      return point1In || point2In
    } else if (shape.type === 'text') {
      // For text, just check if the text position is within the box
      // This is simple but works for most cases
      return shape.x >= boxLeft && shape.x <= boxRight && shape.y >= boxTop && shape.y <= boxBottom
    }
    
    return false
  }, [])
  
  // Rectangle creation state
  const [isDrawing, setIsDrawing] = useState(false)
  const [startPos, setStartPos] = useState(null)
  const [previewRect, setPreviewRect] = useState(null)
  const previewUpdateTimer = useRef(null)
  
  // Multi-select box state
  const [selectionBox, setSelectionBox] = useState(null)
  const isSelectingRef = useRef(false)
  
  // Text editing state
  const [editingTextId, setEditingTextId] = useState(null)
  const [textInput, setTextInput] = useState('')
  const [textPosition, setTextPosition] = useState({ x: 0, y: 0 })
  const textInputRef = useRef(null)
  
  // Clipboard state for copy/paste
  const [clipboard, setClipboard] = useState(null)
  
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

    // Prevent default wheel behavior (browser zoom)
    const preventDefaultWheel = (e) => {
      e.preventDefault()
    }

    // TEMPORARILY ALLOW CONTEXT MENU FOR DEBUGGING
    // Will add back after sync is working

    container.addEventListener('wheel', preventDefaultWheel, { passive: false })

    return () => {
      container.removeEventListener('wheel', preventDefaultWheel)
    }
  }, [])

  // Handle keyboard events for shape deletion, duplication, copy, and paste
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Delete or Backspace key - handle both single and multi-select
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedShapeIds.length > 0) {
          e.preventDefault()
          deleteShapes(selectedShapeIds)
        } else if (selectedShapeId) {
          e.preventDefault()
          deleteShape(selectedShapeId)
        }
      }
      
      // Ctrl+C or Cmd+C for copy - handle both single and multi-select
      if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        if (selectedShapeIds.length > 0) {
          e.preventDefault()
          
          // Copy all selected shapes
          const selectedShapes = selectedShapeIds
            .map(id => shapes.find(s => s.id === id))
            .filter(s => s !== undefined)
          
          if (selectedShapes.length > 0) {
            // Calculate centroid for reference
            const centroidX = selectedShapes.reduce((sum, s) => sum + s.x, 0) / selectedShapes.length
            const centroidY = selectedShapes.reduce((sum, s) => sum + s.y, 0) / selectedShapes.length
            
            // Store shapes with their relative positions from centroid
            const shapesData = selectedShapes.map(shape => {
              const { id, createdAt, updatedAt, lastModifiedBy, ...shapeData } = shape
              return {
                ...shapeData,
                relativeX: shape.x - centroidX,
                relativeY: shape.y - centroidY
              }
            })
            
            setClipboard({ shapes: shapesData, centroidX, centroidY })
          }
        } else if (selectedShapeId) {
          e.preventDefault()
          
          // Copy single shape
          const shapeToCopy = shapes.find(s => s.id === selectedShapeId)
          if (shapeToCopy) {
            const { id, createdAt, updatedAt, lastModifiedBy, ...shapeData } = shapeToCopy
            setClipboard({ shapes: [{ ...shapeData, relativeX: 0, relativeY: 0 }], centroidX: shapeToCopy.x, centroidY: shapeToCopy.y })
          }
        }
      }
      
      // Ctrl+X or Cmd+X for cut - handle both single and multi-select
      if ((e.ctrlKey || e.metaKey) && e.key === 'x') {
        if (selectedShapeIds.length > 0) {
          e.preventDefault()
          
          // Copy all selected shapes to clipboard
          const selectedShapes = selectedShapeIds
            .map(id => shapes.find(s => s.id === id))
            .filter(s => s !== undefined)
          
          if (selectedShapes.length > 0) {
            // Calculate centroid for reference
            const centroidX = selectedShapes.reduce((sum, s) => sum + s.x, 0) / selectedShapes.length
            const centroidY = selectedShapes.reduce((sum, s) => sum + s.y, 0) / selectedShapes.length
            
            // Store shapes with their relative positions from centroid
            const shapesData = selectedShapes.map(shape => {
              const { id, createdAt, updatedAt, lastModifiedBy, ...shapeData } = shape
              return {
                ...shapeData,
                relativeX: shape.x - centroidX,
                relativeY: shape.y - centroidY
              }
            })
            
            setClipboard({ shapes: shapesData, centroidX, centroidY })
            
            // Delete the original shapes
            deleteShapes(selectedShapeIds)
          }
        } else if (selectedShapeId) {
          e.preventDefault()
          
          // Copy single shape to clipboard
          const shapeToCut = shapes.find(s => s.id === selectedShapeId)
          if (shapeToCut) {
            const { id, createdAt, updatedAt, lastModifiedBy, ...shapeData } = shapeToCut
            setClipboard({ shapes: [{ ...shapeData, relativeX: 0, relativeY: 0 }], centroidX: shapeToCut.x, centroidY: shapeToCut.y })
            
            // Delete the original shape
            deleteShape(selectedShapeId)
          }
        }
      }
      
      // Ctrl+V or Cmd+V for paste
      if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        if (clipboard && clipboard.shapes.length > 0) {
          e.preventDefault()
          
          // Paste shapes at cursor position
          const newShapeIds = []
          
          clipboard.shapes.forEach(shapeData => {
            const newId = uuidv4()
            const { relativeX, relativeY, ...cleanShapeData } = shapeData
            
            const pastedShape = {
              ...cleanShapeData,
              id: newId,
              x: lastCursorPos.current.x + relativeX,
              y: lastCursorPos.current.y + relativeY,
              createdAt: Date.now(),
              updatedAt: Date.now(),
              lastModifiedBy: currentUser?.uid || 'unknown'
            }
            
            addShape(pastedShape)
            newShapeIds.push(newId)
          })
          
          // Select the new pasted shapes
          if (newShapeIds.length > 0) {
            if (newShapeIds.length === 1) {
              selectShape(newShapeIds[0])
            } else {
              selectShapes(newShapeIds)
            }
          }
        }
      }
      
      // Ctrl+D or Cmd+D for duplication - handle both single and multi-select
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        if (selectedShapeIds.length > 0) {
          e.preventDefault()
          
          // Calculate centroid of selected shapes
          const selectedShapes = selectedShapeIds
            .map(id => shapes.find(s => s.id === id))
            .filter(s => s !== undefined)
          
          if (selectedShapes.length === 0) return
          
          const centroidX = selectedShapes.reduce((sum, s) => sum + s.x, 0) / selectedShapes.length
          const centroidY = selectedShapes.reduce((sum, s) => sum + s.y, 0) / selectedShapes.length
          
          // Calculate offset from centroid to cursor
          const offsetX = lastCursorPos.current.x - centroidX
          const offsetY = lastCursorPos.current.y - centroidY
          
          // Duplicate all selected shapes with offset
          const newShapeIds = []
          selectedShapeIds.forEach(shapeId => {
            const shapeToDuplicate = shapes.find(s => s.id === shapeId)
            if (shapeToDuplicate) {
              const newId = uuidv4()
              const duplicate = {
                ...shapeToDuplicate,
                id: newId,
                x: shapeToDuplicate.x + offsetX,
                y: shapeToDuplicate.y + offsetY,
                createdAt: Date.now(),
                updatedAt: Date.now(),
                lastModifiedBy: currentUser?.uid || 'unknown'
              }
              addShape(duplicate)
              newShapeIds.push(newId)
            }
          })
          
          // Select the new duplicates
          if (newShapeIds.length > 0) {
            selectShapes(newShapeIds)
          }
        } else if (selectedShapeId) {
          e.preventDefault()
          
          // Single shape duplication
          const shapeToDuplicate = shapes.find(s => s.id === selectedShapeId)
          if (shapeToDuplicate) {
            const duplicate = {
              ...shapeToDuplicate,
              id: uuidv4(),
              x: lastCursorPos.current.x,
              y: lastCursorPos.current.y,
              createdAt: Date.now(),
              updatedAt: Date.now(),
              lastModifiedBy: currentUser?.uid || 'unknown'
            }
            
            addShape(duplicate)
            selectShape(duplicate.id)
          }
        }
      }
      
      // Arrow keys for panning the canvas
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault()
        const stage = stageRef.current
        if (!stage) return
        
        const panAmount = 50 // pixels to pan
        const currentX = stage.x()
        const currentY = stage.y()
        
        switch (e.key) {
          case 'ArrowUp':
            stage.y(currentY + panAmount)
            break
          case 'ArrowDown':
            stage.y(currentY - panAmount)
            break
          case 'ArrowLeft':
            stage.x(currentX + panAmount)
            break
          case 'ArrowRight':
            stage.x(currentX - panAmount)
            break
        }
        
        stage.batchDraw()
      }
      
      // Number keys 1-4 for shape mode selection
      if (e.key === '1') {
        e.preventDefault()
        setCreatingRectangle(true)
        setCreatingDiamond(false)
        setCreatingCircle(false)
        setCreatingArrow(false)
      } else if (e.key === '2') {
        e.preventDefault()
        setCreatingRectangle(false)
        setCreatingDiamond(true)
        setCreatingCircle(false)
        setCreatingArrow(false)
      } else if (e.key === '3') {
        e.preventDefault()
        setCreatingRectangle(false)
        setCreatingDiamond(false)
        setCreatingCircle(true)
        setCreatingArrow(false)
      } else if (e.key === '4') {
        e.preventDefault()
        setCreatingRectangle(false)
        setCreatingDiamond(false)
        setCreatingCircle(false)
        setCreatingArrow(true)
      }
    }

    // Attach to document so it works when canvas is focused
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [selectedShapeId, selectedShapeIds, shapes, deleteShape, deleteShapes, addShape, selectShape, selectShapes, currentUser, clipboard, setCreatingRectangle, setCreatingDiamond, setCreatingCircle, setCreatingArrow])

  // Track cursor position and sync to Firestore
  useEffect(() => {
    const container = containerRef.current
    if (!container || !currentUser) return

    const handleMouseMove = (e) => {
      // Get mouse position relative to viewport
      const rect = container.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      // Sync cursor position (throttled in useCursorSync)
      syncCursorPosition(x, y)
    }

    container.addEventListener('mousemove', handleMouseMove)

    return () => {
      container.removeEventListener('mousemove', handleMouseMove)
    }
  }, [currentUser, syncCursorPosition])

  // Clear preview shapes when creation mode is turned off
  useEffect(() => {
    if (!creatingRectangle && !creatingDiamond && !creatingCircle && !creatingArrow) {
      setIsDrawing(false)
      setStartPos(null)
      setPreviewRect(null)
    }
  }, [creatingRectangle, creatingDiamond, creatingCircle, creatingArrow])

  // Move cursor to end when editing starts
  useEffect(() => {
    if (editingTextId && textInputRef.current) {
      const input = textInputRef.current
      // Force immediate focus and cursor positioning
      input.focus()
      // Move cursor to end
      const length = input.value.length
      input.setSelectionRange(length, length)
    }
  }, [editingTextId]) // Only run when editing starts, not on every keystroke

  // Attach transformer to selected shape(s) (but not when editing text)
  useEffect(() => {
    const transformer = transformerRef.current
    if (!transformer) return
    
    // Don't show transformer when editing text
    if (editingTextId) {
      transformer.nodes([])
      transformer.getLayer().batchDraw()
      return
    }
    
    // Handle multi-select
    if (selectedShapeIds.length > 0) {
      const stage = stageRef.current
      if (!stage) return
      
      const layer = stage.findOne('Layer')
      if (!layer) return
      
      // Find all nodes for the selected shapes
      const selectedNodes = selectedShapeIds
        .map(id => layer.findOne(`#shape-${id}`))
        .filter(node => node !== null && node !== undefined)
      
      if (selectedNodes.length > 0) {
        transformer.nodes(selectedNodes)
        transformer.getLayer().batchDraw()
        transformer.forceUpdate()
      }
    }
    // Handle single select
    else if (selectedShapeId) {
      const selectedNode = selectedShapeRef.current
      if (selectedNode) {
        transformer.nodes([selectedNode])
        transformer.getLayer().batchDraw()
        transformer.forceUpdate()
      }
    }
    // No selection
    else {
      transformer.nodes([])
      transformer.getLayer().batchDraw()
    }
  }, [selectedShapeId, selectedShapeIds, shapes, editingTextId])

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
    
    // Get the transformed group node
    const groupNode = e.target
    const scaleX = groupNode.scaleX()
    const scaleY = groupNode.scaleY()
    const rotation = groupNode.rotation()
    const shape = shapes.find(s => s.id === shapeId)
    
    if (!shape) return
    
    const updates = {
      x: groupNode.x(),
      y: groupNode.y(),
      rotation: rotation,
      updatedAt: Date.now(),
      lastModifiedBy: currentUser?.uid || 'unknown'
    }
    
    // Get the actual shape child from within the group (last child is the actual shape)
    const shapeNode = groupNode.children[groupNode.children.length - 1]
    
    // Handle different shape types
    if (shape.type === 'rectangle') {
      // Calculate new dimensions based on scale
      const newWidth = Math.max(SHAPE_DEFAULTS.MIN_SHAPE_SIZE, shapeNode.width() * scaleX)
      const newHeight = Math.max(SHAPE_DEFAULTS.MIN_SHAPE_SIZE, shapeNode.height() * scaleY)
      
      // Reset scale to 1 after applying to width/height
      groupNode.scaleX(1)
      groupNode.scaleY(1)
      
      updates.width = newWidth
      updates.height = newHeight
    } else if (shape.type === 'diamond') {
      // For diamonds, scale width and height like rectangles
      const newWidth = Math.max(SHAPE_DEFAULTS.MIN_SHAPE_SIZE, shape.width * scaleX)
      const newHeight = Math.max(SHAPE_DEFAULTS.MIN_SHAPE_SIZE, shape.height * scaleY)
      
      // Reset scale to 1 after applying to width/height
      groupNode.scaleX(1)
      groupNode.scaleY(1)
      
      updates.width = newWidth
      updates.height = newHeight
    } else if (shape.type === 'circle') {
      // For ellipses, scale radiusX and radiusY independently
      const newRadiusX = Math.max(SHAPE_DEFAULTS.MIN_CIRCLE_RADIUS, shapeNode.radiusX() * scaleX)
      const newRadiusY = Math.max(SHAPE_DEFAULTS.MIN_CIRCLE_RADIUS, shapeNode.radiusY() * scaleY)
      
      // Reset scale to 1 after applying to radii
      groupNode.scaleX(1)
      groupNode.scaleY(1)
      
      updates.radiusX = newRadiusX
      updates.radiusY = newRadiusY
    } else if (shape.type === 'arrow') {
      // For arrows, scale the points
      const points = shapeNode.points()
      const scaledPoints = [
        points[0] * scaleX,
        points[1] * scaleY,
        points[2] * scaleX,
        points[3] * scaleY
      ]
      
      // Reset scale to 1 after applying to points
      groupNode.scaleX(1)
      groupNode.scaleY(1)
      
      updates.points = scaledPoints
    } else if (shape.type === 'text') {
      // For text, preserve the scale values (don't reset to 1)
      updates.scaleX = scaleX
      updates.scaleY = scaleY
    }
    
    // Update shape with new dimensions and rotation
    updateShape(shapeId, updates)
  }, [updateShape, currentUser, shapes])

  // Pan functionality: Enable dragging the entire stage
  const handleMouseDown = useCallback((e) => {
    const stage = stageRef.current
    if (!stage) return

    // If Shift is held and clicking on empty canvas, start selection box
    if (e.evt.shiftKey && e.evt.button === 0) {
      const clickedOnEmpty = e.target === stage
      if (!clickedOnEmpty) {
        return
      }
      
      const pos = stage.getPointerPosition()
      if (!pos) return
      
      const canvasPos = {
        x: (pos.x - stage.x()) / stage.scaleX(),
        y: (pos.y - stage.y()) / stage.scaleY()
      }
      
      isSelectingRef.current = true
      setStartPos(canvasPos)
      setSelectionBox(null)
      return
    }

    // If creating any shape mode, start drawing (only on empty canvas)
    if ((creatingRectangle || creatingDiamond || creatingCircle || creatingArrow) && e.evt.button === 0) {
      // Only start drawing if clicked on empty canvas, not on an existing shape
      const clickedOnEmpty = e.target === stage
      if (!clickedOnEmpty) {
        return
      }
      
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
  }, [creatingRectangle, creatingDiamond, creatingCircle, creatingArrow])

  const handleMouseUp = useCallback(() => {
    const stage = stageRef.current
    
    // If we were selecting, finalize selection
    if (isSelectingRef.current && startPos && stage) {
      const pos = stage.getPointerPosition()
      if (pos) {
        const canvasPos = {
          x: (pos.x - stage.x()) / stage.scaleX(),
          y: (pos.y - stage.y()) / stage.scaleY()
        }
        
        const box = {
          x: Math.min(startPos.x, canvasPos.x),
          y: Math.min(startPos.y, canvasPos.y),
          width: Math.abs(canvasPos.x - startPos.x),
          height: Math.abs(canvasPos.y - startPos.y)
        }
        
        // Find shapes within selection box
        const selectedIds = shapes
          .filter(shape => isShapeInSelectionBox(shape, box))
          .map(shape => shape.id)
        
        // Select all shapes within the box
        if (selectedIds.length > 0) {
          selectShapes(selectedIds)
          // Deactivate all creation modes when multi-selecting
          setCreatingRectangle(false)
          setCreatingDiamond(false)
          setCreatingCircle(false)
          setCreatingArrow(false)
        } else {
          // Clear selection if no shapes found
          selectShapes([])
        }
      }
      
      // Reset selection state
      // Delay clearing isSelectingRef to prevent handleStageClick from clearing the selection
      setTimeout(() => {
        isSelectingRef.current = false
      }, 0)
      setStartPos(null)
      setSelectionBox(null)
      return
    }
    
    // If we were drawing a shape, create it
    if (isDrawing && startPos && stage) {
      const pos = stage.getPointerPosition()
      if (pos) {
        const canvasPos = {
          x: (pos.x - stage.x()) / stage.scaleX(),
          y: (pos.y - stage.y()) / stage.scaleY()
        }
        
        const customFillColor = hexToRgba(fillColor, fillOpacity)
        
        // For arrows, enforce minimum 10% opacity to prevent invisible arrows
        const arrowOpacity = Math.max(fillOpacity, 0.1)
        const arrowFillColor = hexToRgba(fillColor, arrowOpacity)
        
        if (creatingRectangle) {
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
              rotation: 0,
              fillColor: customFillColor,
              borderColor: SHAPE_DEFAULTS.DEFAULT_STROKE_COLOR,
              strokeWidth: borderThickness,
              borderStyle: borderStyle,
              zIndex: getNewShapeZIndex(),
              ownerId: currentUser?.uid || 'unknown',
              createdAt: Date.now(),
              updatedAt: Date.now(),
              lastModifiedBy: currentUser?.uid || 'unknown'
            }
            
            addShape(rectangle)
          }
          // Keep creation mode active for multiple shapes
        } else if (creatingDiamond) {
          // Calculate dimensions
          const width = Math.abs(canvasPos.x - startPos.x)
          const height = Math.abs(canvasPos.y - startPos.y)
          
          // Only create if minimum size
          if (width >= SHAPE_DEFAULTS.MIN_SHAPE_SIZE && height >= SHAPE_DEFAULTS.MIN_SHAPE_SIZE) {
            const diamond = {
              id: uuidv4(),
              type: 'diamond',
              x: Math.min(startPos.x, canvasPos.x),
              y: Math.min(startPos.y, canvasPos.y),
              width,
              height,
              rotation: 0,
              fillColor: customFillColor,
              borderColor: SHAPE_DEFAULTS.DEFAULT_STROKE_COLOR,
              strokeWidth: borderThickness,
              borderStyle: borderStyle,
              zIndex: getNewShapeZIndex(),
              ownerId: currentUser?.uid || 'unknown',
              createdAt: Date.now(),
              updatedAt: Date.now(),
              lastModifiedBy: currentUser?.uid || 'unknown'
            }
            
            addShape(diamond)
          }
          // Keep creation mode active for multiple shapes
        } else if (creatingCircle) {
          // Calculate radiusX and radiusY from center to drag point
          const radiusX = Math.abs(canvasPos.x - startPos.x)
          const radiusY = Math.abs(canvasPos.y - startPos.y)
          
          // Only create if minimum size
          if (radiusX >= SHAPE_DEFAULTS.MIN_CIRCLE_RADIUS && radiusY >= SHAPE_DEFAULTS.MIN_CIRCLE_RADIUS) {
            const ellipse = {
              id: uuidv4(),
              type: 'circle',
              x: startPos.x,
              y: startPos.y,
              radiusX,
              radiusY,
              rotation: 0,
              fillColor: customFillColor,
              borderColor: SHAPE_DEFAULTS.DEFAULT_STROKE_COLOR,
              strokeWidth: borderThickness,
              borderStyle: borderStyle,
              zIndex: getNewShapeZIndex(),
              ownerId: currentUser?.uid || 'unknown',
              createdAt: Date.now(),
              updatedAt: Date.now(),
              lastModifiedBy: currentUser?.uid || 'unknown'
            }
            
            addShape(ellipse)
          }
          // Keep creation mode active for multiple shapes
        } else if (creatingArrow) {
          // Calculate distance for minimum arrow length
          const distance = Math.sqrt(
            Math.pow(canvasPos.x - startPos.x, 2) + 
            Math.pow(canvasPos.y - startPos.y, 2)
          )
          
          // Only create if minimum length
          if (distance >= SHAPE_DEFAULTS.MIN_SHAPE_SIZE) {
            const arrow = {
              id: uuidv4(),
              type: 'arrow',
              x: 0,
              y: 0,
              points: [startPos.x, startPos.y, canvasPos.x, canvasPos.y],
              rotation: 0,
              fillColor: arrowFillColor,
              borderColor: arrowFillColor,
              strokeWidth: borderThickness,
              borderStyle: borderStyle,
              zIndex: Date.now(),
              ownerId: currentUser?.uid || 'unknown',
              createdAt: Date.now(),
              updatedAt: Date.now(),
              lastModifiedBy: currentUser?.uid || 'unknown'
            }
            
            addShape(arrow)
          }
          // Keep creation mode active for multiple shapes
        }
      }
      
      // Reset drawing state
      setIsDrawing(false)
      setStartPos(null)
      setPreviewRect(null)
    }
    
    isPanning.current = false
  }, [isDrawing, startPos, addShape, currentUser, creatingRectangle, creatingDiamond, creatingCircle, creatingArrow, shapes, isShapeInSelectionBox, selectShapes, fillColor, fillOpacity, borderThickness, borderStyle])

  const handleMouseMove = useCallback((e) => {
    const stage = stageRef.current
    if (!stage) return
    
    // Always track cursor position in canvas coordinates for duplication
    const pos = stage.getPointerPosition()
    if (pos) {
      const canvasPos = {
        x: (pos.x - stage.x()) / stage.scaleX(),
        y: (pos.y - stage.y()) / stage.scaleY()
      }
      lastCursorPos.current = canvasPos
    }
    
    // If selecting, update selection box
    if (isSelectingRef.current && startPos) {
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
          
          const box = {
            x: Math.min(startPos.x, canvasPos.x),
            y: Math.min(startPos.y, canvasPos.y),
            width: Math.abs(canvasPos.x - startPos.x),
            height: Math.abs(canvasPos.y - startPos.y)
          }
          setSelectionBox(box)
        }
      })
      return
    }
    
    // If drawing any shape, update preview (throttled with RAF)
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
          
          if (creatingRectangle) {
            setPreviewRect({
              x: Math.min(startPos.x, canvasPos.x),
              y: Math.min(startPos.y, canvasPos.y),
              width: Math.abs(canvasPos.x - startPos.x),
              height: Math.abs(canvasPos.y - startPos.y)
            })
          } else if (creatingDiamond) {
            setPreviewRect({
              x: Math.min(startPos.x, canvasPos.x),
              y: Math.min(startPos.y, canvasPos.y),
              width: Math.abs(canvasPos.x - startPos.x),
              height: Math.abs(canvasPos.y - startPos.y)
            })
          } else if (creatingCircle) {
            const radiusX = Math.abs(canvasPos.x - startPos.x)
            const radiusY = Math.abs(canvasPos.y - startPos.y)
            setPreviewRect({
              radiusX,
              radiusY
            })
          } else if (creatingArrow) {
            setPreviewRect({
              endX: canvasPos.x,
              endY: canvasPos.y
            })
          }
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
  }, [isDrawing, startPos, creatingRectangle, creatingDiamond, creatingCircle, creatingArrow])

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
  const handleShapeClick = useCallback((shapeId, e) => {
    // Clear any drawing state
    setIsDrawing(false)
    setStartPos(null)
    setPreviewRect(null)
    // Deactivate all creation modes
    setCreatingRectangle(false)
    setCreatingDiamond(false)
    setCreatingCircle(false)
    setCreatingArrow(false)
    
    // If Shift is held, add/remove from multi-selection
    if (e.evt.shiftKey) {
      if (selectedShapeIds.includes(shapeId)) {
        // Remove from selection
        const newSelection = selectedShapeIds.filter(id => id !== shapeId)
        selectShapes(newSelection)
      } else {
        // Add to selection
        const newSelection = [...selectedShapeIds, shapeId]
        // Include currently selected shape if any
        if (selectedShapeId && !newSelection.includes(selectedShapeId)) {
          newSelection.push(selectedShapeId)
        }
        selectShapes(newSelection)
      }
    } else {
      // Normal click - select only this shape
      selectShape(shapeId)
    }
  }, [selectShape, selectShapes, selectedShapeId, selectedShapeIds, setCreatingRectangle, setCreatingDiamond, setCreatingCircle, setCreatingArrow])

  // Handle stage click for deselection (click on empty canvas)
  const handleStageClick = useCallback((e) => {
    // Don't clear selection if we just finished a selection box operation
    if (isSelectingRef.current) {
      return
    }
    
    // Check if we clicked on the stage itself (not a shape)
    const clickedOnEmpty = e.target === e.target.getStage()
    if (clickedOnEmpty) {
      selectShape(null)
    }
  }, [selectShape])

  // Handle stage double-click to create text
  const handleStageDoubleClick = useCallback((e) => {
    const stage = stageRef.current
    if (!stage) return
    
    // Only create text if double-clicked on empty canvas
    const clickedOnEmpty = e.target === stage
    if (clickedOnEmpty) {
      const pos = stage.getPointerPosition()
      if (!pos) return
      
      // Convert to canvas coordinates
      const canvasPos = {
        x: (pos.x - stage.x()) / stage.scaleX(),
        y: (pos.y - stage.y()) / stage.scaleY()
      }
      
      // Create new text at cursor position
      const hexToRgba = (hex, opacity) => {
        const r = parseInt(hex.slice(1, 3), 16)
        const g = parseInt(hex.slice(3, 5), 16)
        const b = parseInt(hex.slice(5, 7), 16)
        return `rgba(${r}, ${g}, ${b}, ${opacity})`
      }
      
      // Enforce minimum 10% opacity for text to prevent invisible text
      const textOpacity = Math.max(fillOpacity, 0.1)
      
      const newText = {
        id: uuidv4(),
        type: 'text',
        x: canvasPos.x,
        y: canvasPos.y,
        text: '',
        fontSize: fontSize,
        fontWeight: fontWeight,
        fontStyle: fontStyle,
        textDecoration: textDecoration,
        fontFamily: fontFamily,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        fillColor: hexToRgba(fillColor, textOpacity),
        zIndex: getNewShapeZIndex(),
        ownerId: currentUser?.uid || 'unknown',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        lastModifiedBy: currentUser?.uid || 'unknown'
      }
      
      addShape(newText)
      selectShape(newText.id)
      
      // Start editing immediately
      setEditingTextId(newText.id)
      setTextInput('')
      // Convert canvas position to screen coordinates for input
      const screenX = canvasPos.x * stage.scaleX() + stage.x()
      const screenY = canvasPos.y * stage.scaleY() + stage.y()
      setTextPosition({ x: screenX, y: screenY })
    }
  }, [addShape, selectShape, currentUser, fillColor, fillOpacity, fontSize, fontWeight, fontStyle, textDecoration, fontFamily])

  return (
    <div 
      ref={containerRef} 
      className="canvas-container"
    >
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
          onDblClick={handleStageDoubleClick}
          onDblTap={handleStageDoubleClick}
          style={{ backgroundColor: '#ffffff' }}
        >
          <Layer>
            {/* Render all shapes */}
            {shapes.map((shape) => {
              const isSelected = shape.id === selectedShapeId || selectedShapeIds.includes(shape.id)
              
              if (shape.type === 'rectangle') {
                return (
                  <Rectangle
                    key={shape.id}
                    shape={shape}
                    isSelected={isSelected}
                    userColor={userColor}
                    onClick={(e) => handleShapeClick(shape.id, e)}
                    onDragStart={() => handleShapeDragStart(shape.id)}
                    onDragMove={(e) => handleShapeDragMove(shape.id, e)}
                    onDragEnd={(e) => handleShapeDragEnd(shape.id, e)}
                    onTransformStart={() => handleShapeTransformStart()}
                    onTransformEnd={(e) => handleShapeTransformEnd(shape.id, e)}
                    shapeRef={isSelected ? selectedShapeRef : null}
                  />
                )
              } else if (shape.type === 'diamond') {
                return (
                  <DiamondShape
                    key={shape.id}
                    shape={shape}
                    isSelected={isSelected}
                    userColor={userColor}
                    onClick={(e) => handleShapeClick(shape.id, e)}
                    onDragStart={() => handleShapeDragStart(shape.id)}
                    onDragMove={(e) => handleShapeDragMove(shape.id, e)}
                    onDragEnd={(e) => handleShapeDragEnd(shape.id, e)}
                    onTransformStart={() => handleShapeTransformStart()}
                    onTransformEnd={(e) => handleShapeTransformEnd(shape.id, e)}
                    shapeRef={isSelected ? selectedShapeRef : null}
                  />
                )
              } else if (shape.type === 'circle') {
                return (
                  <EllipseShape
                    key={shape.id}
                    shape={shape}
                    isSelected={isSelected}
                    userColor={userColor}
                    onClick={(e) => handleShapeClick(shape.id, e)}
                    onDragStart={() => handleShapeDragStart(shape.id)}
                    onDragMove={(e) => handleShapeDragMove(shape.id, e)}
                    onDragEnd={(e) => handleShapeDragEnd(shape.id, e)}
                    onTransformStart={() => handleShapeTransformStart()}
                    onTransformEnd={(e) => handleShapeTransformEnd(shape.id, e)}
                    shapeRef={isSelected ? selectedShapeRef : null}
                  />
                )
              } else if (shape.type === 'arrow') {
                return (
                  <ArrowShape
                    key={shape.id}
                    shape={shape}
                    isSelected={isSelected}
                    userColor={userColor}
                    onClick={(e) => handleShapeClick(shape.id, e)}
                    onDragStart={() => handleShapeDragStart(shape.id)}
                    onDragMove={(e) => handleShapeDragMove(shape.id, e)}
                    onDragEnd={(e) => handleShapeDragEnd(shape.id, e)}
                    onTransformStart={() => handleShapeTransformStart()}
                    onTransformEnd={(e) => handleShapeTransformEnd(shape.id, e)}
                    shapeRef={isSelected ? selectedShapeRef : null}
                  />
                )
              } else if (shape.type === 'text') {
                const isEditing = editingTextId === shape.id
                return (
                  <TextShape
                    key={shape.id}
                    shape={shape}
                    isSelected={isSelected}
                    userColor={userColor}
                    isEditing={isEditing}
                    onClick={(e) => handleShapeClick(shape.id, e)}
                    onDragStart={() => handleShapeDragStart(shape.id)}
                    onDragMove={(e) => handleShapeDragMove(shape.id, e)}
                    onDragEnd={(e) => handleShapeDragEnd(shape.id, e)}
                    onTransformStart={() => handleShapeTransformStart()}
                    onTransformEnd={(e) => handleShapeTransformEnd(shape.id, e)}
                    onDoubleClick={() => {
                      setEditingTextId(shape.id)
                      setTextInput(shape.text)
                      const stage = stageRef.current
                      if (stage) {
                        // Convert shape position to screen coordinates
                        const screenX = shape.x * stage.scaleX() + stage.x()
                        const screenY = shape.y * stage.scaleY() + stage.y()
                        setTextPosition({ x: screenX, y: screenY })
                      }
                    }}
                    shapeRef={isSelected ? selectedShapeRef : null}
                  />
                )
              }
              
              return null
            })}
            
            {/* Transformer for resizing and rotating selected shape */}
            <Transformer
              ref={transformerRef}
              rotateEnabled={true}
              enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right', 'middle-left', 'middle-right', 'top-center', 'bottom-center']}
              borderStroke={userColor}
              borderStrokeWidth={3}
              anchorStroke={userColor}
              anchorFill={userColor}
              anchorSize={8}
              boundBoxFunc={(oldBox, newBox) => {
                // Enforce minimum size during transform
                if (newBox.width < SHAPE_DEFAULTS.MIN_SHAPE_SIZE || newBox.height < SHAPE_DEFAULTS.MIN_SHAPE_SIZE) {
                  return oldBox
                }
                return newBox
              }}
            />
            
            {/* Preview shapes while drawing */}
            {previewRect && creatingRectangle && (() => {
              return (
                <Rect
                  x={previewRect.x}
                  y={previewRect.y}
                  width={previewRect.width}
                  height={previewRect.height}
                  fill={hexToRgba(fillColor, fillOpacity)}
                  stroke={SHAPE_DEFAULTS.DEFAULT_STROKE_COLOR}
                  strokeWidth={borderThickness}
                  dash={getBorderDash(borderStyle)}
                  listening={false}
                  perfectDrawEnabled={false}
                  strokeScaleEnabled={false}
                />
              )
            })()}
            {previewRect && creatingDiamond && (() => {
              // Calculate diamond points for preview
              const points = [
                previewRect.x + previewRect.width / 2, previewRect.y,                    // Top point
                previewRect.x + previewRect.width, previewRect.y + previewRect.height / 2,         // Right point
                previewRect.x + previewRect.width / 2, previewRect.y + previewRect.height,         // Bottom point
                previewRect.x, previewRect.y + previewRect.height / 2                    // Left point
              ]
              return (
                <Line
                  points={points}
                  fill={hexToRgba(fillColor, fillOpacity)}
                  stroke={SHAPE_DEFAULTS.DEFAULT_STROKE_COLOR}
                  strokeWidth={borderThickness}
                  dash={getBorderDash(borderStyle)}
                  closed={true}
                  listening={false}
                  perfectDrawEnabled={false}
                  strokeScaleEnabled={false}
                />
              )
            })()}
            {previewRect && creatingCircle && (() => {
              return (
                <Ellipse
                  x={startPos?.x || 0}
                  y={startPos?.y || 0}
                  radiusX={previewRect.radiusX || 0}
                  radiusY={previewRect.radiusY || 0}
                  fill={hexToRgba(fillColor, fillOpacity)}
                  stroke={SHAPE_DEFAULTS.DEFAULT_STROKE_COLOR}
                  strokeWidth={borderThickness}
                  dash={getBorderDash(borderStyle)}
                  listening={false}
                  perfectDrawEnabled={false}
                  strokeScaleEnabled={false}
                />
              )
            })()}
            {previewRect && creatingArrow && startPos && (() => {
              // Enforce minimum 10% opacity for arrow preview
              const arrowOpacity = Math.max(fillOpacity, 0.1)
              const arrowColor = hexToRgba(fillColor, arrowOpacity)
              return (
                <Arrow
                  points={[
                    startPos.x,
                    startPos.y,
                    previewRect.endX || startPos.x,
                    previewRect.endY || startPos.y
                  ]}
                  stroke={arrowColor}
                  fill={arrowColor}
                  strokeWidth={borderThickness}
                  dash={getBorderDash(borderStyle)}
                  listening={false}
                  perfectDrawEnabled={false}
                  strokeScaleEnabled={false}
                  pointerLength={borderThickness * 5}
                  pointerWidth={borderThickness * 5}
                />
              )
            })()}
            
            {/* Multi-select selection box */}
            {selectionBox && (
              <Rect
                x={selectionBox.x}
                y={selectionBox.y}
                width={selectionBox.width}
                height={selectionBox.height}
                stroke={userColor}
                strokeWidth={3}
                dash={[5, 5]}
                fill={userColor}
                fillEnabled={true}
                opacity={0.15}
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
      
      {/* Render remote cursors (exclude current user) */}
      {Object.entries(cursors).map(([userId, cursor]) => {
        // Don't render current user's cursor
        if (userId === currentUser?.uid) return null
        
        return (
          <Cursor
            key={userId}
            x={cursor.x}
            y={cursor.y}
            displayName={cursor.displayName}
            colorHex={cursor.colorHex}
          />
        )
      })}
      
      {/* Text editing input overlay - invisible, just for capturing keystrokes */}
      {editingTextId && (
        <input
          ref={textInputRef}
          type="text"
          value={textInput}
          onChange={(e) => {
            const newValue = e.target.value
            setTextInput(newValue)
            // Update the text shape in real-time as user types
            updateShape(editingTextId, { text: newValue })
          }}
          onBlur={(e) => {
            // Capture the current value and editing ID to avoid stale closure
            const currentValue = e.target.value
            const shapeId = editingTextId
            
            // Use setTimeout to ensure state has updated before processing
            setTimeout(() => {
              // Save text when losing focus
              if (currentValue.trim()) {
                updateShape(shapeId, { text: currentValue })
              } else {
                // If empty, delete the text shape
                deleteShape(shapeId)
              }
              setEditingTextId(null)
              // Deselect the shape to prevent transformer from appearing
              selectShape(null)
            }, 0)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              // Save text on Enter
              const currentValue = e.target.value
              if (currentValue.trim()) {
                updateShape(editingTextId, { text: currentValue })
              } else {
                deleteShape(editingTextId)
              }
              setEditingTextId(null)
              // Deselect the shape to prevent transformer from appearing
              selectShape(null)
            } else if (e.key === 'Escape') {
              e.preventDefault()
              // Cancel editing on Escape - delete if it was empty initially
              const shape = shapes.find(s => s.id === editingTextId)
              if (!shape || !shape.text || shape.text.trim() === '') {
                deleteShape(editingTextId)
              }
              setEditingTextId(null)
              // Deselect the shape to prevent transformer from appearing
              selectShape(null)
            }
          }}
          autoFocus
          style={{
            position: 'absolute',
            left: `${textPosition.x}px`,
            top: `${textPosition.y}px`,
            fontSize: '24px',
            fontFamily: 'Arial',
            border: 'none',
            padding: '0',
            outline: 'none',
            backgroundColor: 'transparent',
            color: 'transparent',
            caretColor: 'black',
            zIndex: Z_INDEX.TEXT_INPUT,
            minWidth: '500px',
            cursor: 'text',
            pointerEvents: 'auto'
          }}
        />
      )}
    </div>
  )
}

export default Canvas
