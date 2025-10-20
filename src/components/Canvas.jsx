import React, { useRef, useState, useEffect, useCallback, memo } from 'react'
import { Stage, Layer, Rect, Ellipse, Line, Arrow, Text, Transformer, Group } from 'react-konva'
import { v4 as uuidv4 } from 'uuid'
import { CANVAS_CONFIG, SHAPE_DEFAULTS, SYNC_CONFIG } from '../utils/constants'
import Z_INDEX from '../utils/zIndex'
import { useCanvas } from '../context/CanvasContext'
import { useAuth } from '../context/AuthContext'
import { usePresence } from '../context/PresenceContext'
import { useCanvasViewport } from '../context/CanvasViewportContext'
import { useCursorSync } from '../hooks/useCursorSync'
import { useShapePreviewSync } from '../hooks/useShapePreviewSync'
import { usePresenceManager } from '../hooks/usePresence'
import { useTransformSync } from '../hooks/useTransformSync'
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
  shapeRef,
  opacity = 1.0,
  isDraggable = true
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
      draggable={isDraggable}
      opacity={opacity}
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
  shapeRef,
  opacity = 1.0,
  isDraggable = true
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
      draggable={isDraggable}
      opacity={opacity}
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
  shapeRef,
  isDraggable = true
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
      draggable={isDraggable}
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
  shapeRef,
  isDraggable = true
}) => {
  const handleClick = (e) => {
    e.cancelBubble = true
    onClick(e)
  }

  // Use shape's stored strokeWidth or default
  const strokeWidth = shape.strokeWidth || SHAPE_DEFAULTS.DEFAULT_STROKE_WIDTH

  // Calculate bounding box for the arrow to help Transformer
  const [x1, y1, x2, y2] = shape.points
  const minX = Math.min(x1, x2)
  const maxX = Math.max(x1, x2)
  const minY = Math.min(y1, y2)
  const maxY = Math.max(y1, y2)
  const width = maxX - minX
  const height = maxY - minY

  return (
    <Group
      id={`shape-${shape.id}`}
      ref={shapeRef}
      x={shape.x}
      y={shape.y}
      rotation={shape.rotation || 0}
      draggable={isDraggable}
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
      {/* Invisible rect to help Transformer calculate bounds */}
      <Rect
        x={minX}
        y={minY}
        width={Math.max(width, 1)}
        height={Math.max(height, 1)}
        fill="transparent"
        listening={false}
      />
      
      {/* Actual arrow shape */}
      <Arrow
        points={shape.points}
        stroke={shape.borderColor}
        fill={shape.borderColor}
        strokeWidth={strokeWidth}
        dash={getBorderDash(shape.borderStyle || 'solid')}
        hitStrokeWidth={20}
        listening={true}
        perfectDrawEnabled={false}
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
  shapeRef,
  isDraggable = true
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
      draggable={isDraggable}
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
  const transformerRef = useRef(null)
  const selectedShapeRef = useRef(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 })
  const [stageScale, setStageScale] = useState(1)
  const isPanning = useRef(false)
  const lastCursorPos = useRef({ x: 0, y: 0 }) // Track cursor position for duplication
  const lastScreenMousePos = useRef({ x: 0, y: 0 }) // Track screen mouse position for pan updates
  
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
    stageRef,
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
  const { cursors, shapePreviews, pendingShapes, remoteSelections, remoteTransforms } = usePresence()
  const { syncCursorPosition } = useCursorSync()
  const { syncShapePreview, clearShapePreview } = useShapePreviewSync()
  const { syncTransform, clearTransform } = useTransformSync()
  
  // Viewport state for CustomizationPanel
  const { updateZoom, updateCursorPosition } = useCanvasViewport()

  // Helper function to update cursor position in canvas coordinates
  const updateCursorFromScreenPos = useCallback(() => {
    const stage = stageRef.current
    if (!stage) return
    
    const screenX = lastScreenMousePos.current.x
    const screenY = lastScreenMousePos.current.y
    
    // Convert screen position to canvas coordinates
    const canvasPos = {
      x: (screenX - stage.x()) / stage.scaleX(),
      y: (screenY - stage.y()) / stage.scaleY()
    }
    
    lastCursorPos.current = canvasPos
    updateCursorPosition(canvasPos.x, canvasPos.y)
  }, [updateCursorPosition])

  // Helper function to check if a shape is locked by another user
  const isShapeLockedByOtherUser = useCallback((shapeId) => {
    // Check if any other user has this shape selected
    for (const [userId, selection] of Object.entries(remoteSelections)) {
      if (userId !== currentUser?.uid && selection.shapeIds?.includes(shapeId)) {
        return true
      }
    }
    return false
  }, [remoteSelections, currentUser])

  // Helper function to check if any shape in a list is locked
  const areAnyShapesLocked = useCallback((shapeIds) => {
    return shapeIds.some(id => isShapeLockedByOtherUser(id))
  }, [isShapeLockedByOtherUser])
  const { broadcastShape, broadcastSelection } = usePresenceManager()
  
  // Track shapes that are currently or recently being transformed to prevent flicker
  const [lastTransformStates, setLastTransformStates] = useState({}) // Store last known transform state
  
  useEffect(() => {
    const newLastStates = {}
    
    Object.entries(remoteTransforms).forEach(([userId, transform]) => {
      if (userId === currentUser?.uid) return
      
      transform.shapeIds.forEach(shapeId => {
        // Add to recently transformed set
        recentlyTransformedShapes.current.add(shapeId)
        
        // Store the current transform state with a snapshot of the shape
        // This prevents issues with stale shape data during the buffer period
        const shape = shapes.find(s => s.id === shapeId)
        if (shape) {
          newLastStates[shapeId] = {
            userId,
            transform,
            shapeSnapshot: { ...shape } // Store complete shape snapshot
          }
        }
        
        // Clear any existing cleanup timer for this shape
        if (transformCleanupTimers.current.has(shapeId)) {
          clearTimeout(transformCleanupTimers.current.get(shapeId))
        }
      })
    })
    
    // For any shape that's no longer actively being transformed, schedule cleanup after a delay
    recentlyTransformedShapes.current.forEach(shapeId => {
      const isStillTransforming = Object.entries(remoteTransforms).some(([userId, transform]) => {
        return userId !== currentUser?.uid && transform.shapeIds.includes(shapeId)
      })
      
      if (!isStillTransforming) {
        // Wait until the shape has been updated by Firestore, or 500ms max (fallback)
        const timer = setTimeout(() => {
          recentlyTransformedShapes.current.delete(shapeId)
          transformCleanupTimers.current.delete(shapeId)
          setLastTransformStates(prev => {
            const updated = { ...prev }
            delete updated[shapeId]
            return updated
          })
        }, 500) // Increased to 500ms for more reliable sync
        
        transformCleanupTimers.current.set(shapeId, timer)
      }
    })
    
    setLastTransformStates(prev => ({ ...prev, ...newLastStates }))
  }, [remoteTransforms, currentUser])
  
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
      // Arrow points are relative to shape.x and shape.y, so convert to absolute coordinates
      const [x1, y1, x2, y2] = shape.points
      const absX1 = shape.x + x1
      const absY1 = shape.y + y1
      const absX2 = shape.x + x2
      const absY2 = shape.y + y2
      
      // Check if any point of the arrow is within the box
      const point1In = absX1 >= boxLeft && absX1 <= boxRight && absY1 >= boxTop && absY1 <= boxBottom
      const point2In = absX2 >= boxLeft && absX2 <= boxRight && absY2 >= boxTop && absY2 <= boxBottom
      
      // Also check if the arrow's bounding box overlaps with the selection box
      const arrowLeft = Math.min(absX1, absX2)
      const arrowRight = Math.max(absX1, absX2)
      const arrowTop = Math.min(absY1, absY2)
      const arrowBottom = Math.max(absY1, absY2)
      
      const boundingBoxOverlaps = !(arrowRight < boxLeft || arrowLeft > boxRight || arrowBottom < boxTop || arrowTop > boxBottom)
      
      return point1In || point2In || boundingBoxOverlaps
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
  const recentlyTransformedShapes = useRef(new Set()) // Track shapes that were recently transformed
  const transformCleanupTimers = useRef(new Map()) // Timers to clean up the set
  
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
  const groupDragStart = useRef(null) // Store initial mouse position for group drag
  const groupDragInitialPositions = useRef({}) // Store initial positions of shapes in group


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
      // Ignore keyboard shortcuts if user is typing in an input, textarea, or contenteditable element
      if (e.target.tagName === 'INPUT' || 
          e.target.tagName === 'TEXTAREA' || 
          e.target.isContentEditable) {
        return;
      }
      
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
        
        // Update cursor position after panning
        updateCursorFromScreenPos()
      }
      
      // Number keys 1-4 for shape mode selection (toggle on/off)
      if (e.key === '1') {
        e.preventDefault()
        // Toggle: if already creating rectangles, turn it off
        if (creatingRectangle) {
          setCreatingRectangle(false)
        } else {
          setCreatingRectangle(true)
          setCreatingDiamond(false)
          setCreatingCircle(false)
          setCreatingArrow(false)
        }
      } else if (e.key === '2') {
        e.preventDefault()
        // Toggle: if already creating diamonds, turn it off
        if (creatingDiamond) {
          setCreatingDiamond(false)
        } else {
          setCreatingRectangle(false)
          setCreatingDiamond(true)
          setCreatingCircle(false)
          setCreatingArrow(false)
        }
      } else if (e.key === '3') {
        e.preventDefault()
        // Toggle: if already creating circles, turn it off
        if (creatingCircle) {
          setCreatingCircle(false)
        } else {
          setCreatingRectangle(false)
          setCreatingDiamond(false)
          setCreatingCircle(true)
          setCreatingArrow(false)
        }
      } else if (e.key === '4') {
        e.preventDefault()
        // Toggle: if already creating arrows, turn it off
        if (creatingArrow) {
          setCreatingArrow(false)
        } else {
          setCreatingRectangle(false)
          setCreatingDiamond(false)
          setCreatingCircle(false)
          setCreatingArrow(true)
        }
      }
    }

    // Attach to document so it works when canvas is focused
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [selectedShapeId, selectedShapeIds, shapes, deleteShape, deleteShapes, addShape, selectShape, selectShapes, currentUser, clipboard, setCreatingRectangle, setCreatingDiamond, setCreatingCircle, setCreatingArrow, creatingRectangle, creatingDiamond, creatingCircle, creatingArrow, updateCursorFromScreenPos])

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

  // Broadcast selection changes to other users
  useEffect(() => {
    // Combine single and multi selections
    const allSelected = selectedShapeId 
      ? [selectedShapeId, ...selectedShapeIds.filter(id => id !== selectedShapeId)]
      : selectedShapeIds
    
    broadcastSelection(allSelected)
  }, [selectedShapeId, selectedShapeIds, broadcastSelection])

  // Clear preview shapes when creation mode is turned off
  useEffect(() => {
    if (!creatingRectangle && !creatingDiamond && !creatingCircle && !creatingArrow) {
      setIsDrawing(false)
      setStartPos(null)
      setPreviewRect(null)
      clearShapePreview()
    }
  }, [creatingRectangle, creatingDiamond, creatingCircle, creatingArrow, clearShapePreview])

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
      transformer.getLayer()?.batchDraw()
      return
    }
    
    // Handle multi-select - single bounding box around all shapes
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
        // Force the transformer to recalculate bounds
        const layer = transformer.getLayer()
        if (layer) {
          layer.batchDraw()
        }
        transformer.forceUpdate()
      }
    }
    // Handle single select
    else if (selectedShapeId) {
      const selectedNode = selectedShapeRef.current
      if (selectedNode) {
        transformer.nodes([selectedNode])
        const layer = transformer.getLayer()
        if (layer) {
          layer.batchDraw()
        }
        transformer.forceUpdate()
      }
    }
    // No selection
    else {
      transformer.nodes([])
      transformer.getLayer()?.batchDraw()
    }
  }, [selectedShapeId, selectedShapeIds, shapes, editingTextId])

  // Drag handlers for shapes
  const handleShapeDragStart = useCallback((shapeId) => {
    // Check if this shape is locked by another user
    if (isShapeLockedByOtherUser(shapeId)) {
      return false // Prevent drag
    }
    
    isDragging.current = true
    
    // Only select the shape if it's not already part of a multi-selection
    // This preserves multi-selection when dragging one of the selected shapes
    if (!selectedShapeIds.includes(shapeId) && selectedShapeId !== shapeId) {
      selectShape(shapeId)
    }
    
    // Disable panning while dragging shape
    isPanning.current = false
  }, [selectShape, isShapeLockedByOtherUser, selectedShapeIds, selectedShapeId])

  const handleShapeDragMove = useCallback((shapeId, e) => {
    if (!isDragging.current) return
    
    const stage = stageRef.current
    if (!stage) return
    
    const node = e.target
    const newX = node.x()
    const newY = node.y()
    
    // Get the list of shapes to move (either multi-select or single)
    const shapesToMove = selectedShapeIds.length > 0 ? selectedShapeIds : [shapeId]
    
    // Find the dragged shape's original position to calculate delta
    const draggedShape = shapes.find(s => s.id === shapeId)
    if (!draggedShape) return
    
    const deltaX = newX - draggedShape.x
    const deltaY = newY - draggedShape.y
    
    // Update visual positions of all other selected shapes immediately for smooth dragging
    if (shapesToMove.length > 1) {
      const layer = stage.findOne('Layer')
      if (layer) {
        shapesToMove.forEach(id => {
          if (id !== shapeId) { // Don't move the dragged shape again
            const shape = shapes.find(s => s.id === id)
            const shapeNode = layer.findOne(`#shape-${id}`)
            if (shape && shapeNode) {
              shapeNode.x(shape.x + deltaX)
              shapeNode.y(shape.y + deltaY)
            }
          }
        })
        layer.batchDraw()
      }
    }
    
    // Broadcast transform in real-time for instant sync
    syncTransform({
      shapeIds: shapesToMove,
      type: 'drag',
      x: newX,
      y: newY,
      deltaX,
      deltaY,
    })
    
    // Throttle Firestore updates to avoid overwhelming the system
    if (dragUpdateTimer.current) {
      clearTimeout(dragUpdateTimer.current)
    }
    
    dragUpdateTimer.current = setTimeout(() => {
      // Update all selected shapes with their new positions
      shapesToMove.forEach(id => {
        const shape = shapes.find(s => s.id === id)
        if (shape) {
          updateShape(id, {
            x: shape.x + deltaX,
            y: shape.y + deltaY,
            updatedAt: Date.now(),
            lastModifiedBy: currentUser?.uid || 'unknown'
          })
        }
      })
    }, SYNC_CONFIG.SHAPE_UPDATE_THROTTLE_MS)
  }, [updateShape, currentUser, syncTransform, selectedShapeIds, shapes])

  const handleShapeDragEnd = useCallback((shapeId, e) => {
    isDragging.current = false
    
    // Clear transform broadcast
    clearTransform()
    
    // Clear any pending throttled update
    if (dragUpdateTimer.current) {
      clearTimeout(dragUpdateTimer.current)
    }
    
    // Get the list of shapes to move (either multi-select or single)
    const shapesToMove = selectedShapeIds.length > 0 ? selectedShapeIds : [shapeId]
    
    // Find the dragged shape to calculate delta
    const draggedShape = shapes.find(s => s.id === shapeId)
    if (!draggedShape) return
    
    const node = e.target
    const newX = node.x()
    const newY = node.y()
    const deltaX = newX - draggedShape.x
    const deltaY = newY - draggedShape.y
    
    // Final update for all selected shapes with exact positions
    shapesToMove.forEach(id => {
      const shape = shapes.find(s => s.id === id)
      if (shape) {
        updateShape(id, {
          x: shape.x + deltaX,
          y: shape.y + deltaY,
          updatedAt: Date.now(),
          lastModifiedBy: currentUser?.uid || 'unknown'
        })
      }
    })
  }, [updateShape, currentUser, clearTransform, selectedShapeIds, shapes])

  // Transformer drag handlers (for dragging by clicking in white space within multi-select box)
  const handleTransformerDragStart = useCallback(() => {
    // Check if any selected shapes are locked by other users
    if (areAnyShapesLocked(selectedShapeIds)) {
      return false // Prevent transformer drag
    }
    
    isDragging.current = true
    isPanning.current = false
  }, [selectedShapeIds, areAnyShapesLocked])

  const handleTransformerDragMove = useCallback((e) => {
    if (!isDragging.current || selectedShapeIds.length === 0) return
    
    const stage = stageRef.current
    const layer = stage?.findOne('Layer')
    if (!layer) return
    
    // For transformer drag, we need to calculate delta from the first selected shape
    const firstShapeId = selectedShapeIds[0]
    const firstShape = shapes.find(s => s.id === firstShapeId)
    if (!firstShape) return
    
    const firstGroupNode = layer.findOne(`#shape-${firstShapeId}`)
    if (!firstGroupNode) return
    
    const deltaX = firstGroupNode.x() - firstShape.x
    const deltaY = firstGroupNode.y() - firstShape.y
    
    // Broadcast transform in real-time for instant sync (on every move event)
    syncTransform({
      shapeIds: selectedShapeIds,
      type: 'drag',
      x: firstGroupNode.x(),
      y: firstGroupNode.y(),
      deltaX,
      deltaY,
    })
    
    // Throttle Firestore updates to avoid overwhelming the system
    if (dragUpdateTimer.current) {
      clearTimeout(dragUpdateTimer.current)
    }
    
    dragUpdateTimer.current = setTimeout(() => {
      // Recalculate delta at the time of Firestore update
      const currentFirstGroupNode = layer.findOne(`#shape-${firstShapeId}`)
      if (currentFirstGroupNode) {
        const currentDeltaX = currentFirstGroupNode.x() - firstShape.x
        const currentDeltaY = currentFirstGroupNode.y() - firstShape.y
        
        selectedShapeIds.forEach(id => {
          const shape = shapes.find(s => s.id === id)
          if (shape) {
            updateShape(id, {
              x: shape.x + currentDeltaX,
              y: shape.y + currentDeltaY,
              updatedAt: Date.now(),
              lastModifiedBy: currentUser?.uid || 'unknown'
            })
          }
        })
      }
    }, SYNC_CONFIG.SHAPE_UPDATE_THROTTLE_MS)
  }, [syncTransform, updateShape, currentUser, selectedShapeIds, shapes])

  const handleTransformerDragEnd = useCallback(() => {
    isDragging.current = false
    
    // Clear transform broadcast
    clearTransform()
    
    // Clear any pending throttled update
    if (dragUpdateTimer.current) {
      clearTimeout(dragUpdateTimer.current)
    }
    
    if (selectedShapeIds.length === 0) return
    
    const stage = stageRef.current
    const layer = stage?.findOne('Layer')
    if (!layer) return
    
    // Calculate final delta from the first selected shape
    const firstShapeId = selectedShapeIds[0]
    const firstShape = shapes.find(s => s.id === firstShapeId)
    if (!firstShape) return
    
    const firstGroupNode = layer.findOne(`#shape-${firstShapeId}`)
    if (!firstGroupNode) return
    
    const deltaX = firstGroupNode.x() - firstShape.x
    const deltaY = firstGroupNode.y() - firstShape.y
    
    // Final update for all selected shapes
    selectedShapeIds.forEach(id => {
      const shape = shapes.find(s => s.id === id)
      if (shape) {
        updateShape(id, {
          x: shape.x + deltaX,
          y: shape.y + deltaY,
          updatedAt: Date.now(),
          lastModifiedBy: currentUser?.uid || 'unknown'
        })
      }
    })
  }, [updateShape, currentUser, clearTransform, selectedShapeIds, shapes])

  // Transform handlers for shapes (resize)
  const handleShapeTransformStart = useCallback(() => {
    // Check if any selected shapes are locked by other users
    const shapesToCheck = selectedShapeIds.length > 0 ? selectedShapeIds : (selectedShapeId ? [selectedShapeId] : [])
    if (areAnyShapesLocked(shapesToCheck)) {
      return false // Prevent transform
    }
    
    isTransforming.current = true
  }, [selectedShapeId, selectedShapeIds, areAnyShapesLocked])

  const handleShapeTransformEnd = useCallback((shapeId, e) => {
    isTransforming.current = false
    
    // Clear any pending throttled update
    if (transformUpdateTimer.current) {
      clearTimeout(transformUpdateTimer.current)
    }
    
    // For multi-select, get all selected shapes
    const shapesToTransform = selectedShapeIds.length > 0 ? selectedShapeIds : [shapeId]
    const stage = stageRef.current
    
    if (!stage) {
      clearTransform()
      return
    }
    
    const layer = stage.findOne('Layer')
    if (!layer) {
      clearTransform()
      return
    }
    
    // PHASE 1: Collect all updates without modifying nodes
    // This ensures we read consistent state before making changes
    const allUpdates = []
    const nodesToUpdate = []
    
    shapesToTransform.forEach(id => {
      const shape = shapes.find(s => s.id === id)
      if (!shape) return
      
      // Find the group node for this shape
      const groupNode = layer.findOne(`#shape-${id}`)
      if (!groupNode) return
      
      // Read the scale and position from the group node
      const scaleX = groupNode.scaleX()
      const scaleY = groupNode.scaleY()
      const rotation = groupNode.rotation()
      
      const updates = {
        id,
        x: groupNode.x(),
        y: groupNode.y(),
        rotation: rotation,
        updatedAt: Date.now(),
        lastModifiedBy: currentUser?.uid || 'unknown'
      }
      
      // Get the actual shape child from within the group (last child is the actual shape)
      const shapeNode = groupNode.children[groupNode.children.length - 1]
      
      // Only process if there's actually a scale applied
      if (Math.abs(scaleX - 1) > 0.001 || Math.abs(scaleY - 1) > 0.001) {
        // Handle different shape types
        if (shape.type === 'rectangle') {
          const newWidth = Math.max(SHAPE_DEFAULTS.MIN_SHAPE_SIZE, shapeNode.width() * scaleX)
          const newHeight = Math.max(SHAPE_DEFAULTS.MIN_SHAPE_SIZE, shapeNode.height() * scaleY)
          
          updates.width = newWidth
          updates.height = newHeight
          nodesToUpdate.push({ groupNode, shapeNode, type: 'rectangle', width: newWidth, height: newHeight })
        } else if (shape.type === 'diamond') {
          const newWidth = Math.max(SHAPE_DEFAULTS.MIN_SHAPE_SIZE, shape.width * scaleX)
          const newHeight = Math.max(SHAPE_DEFAULTS.MIN_SHAPE_SIZE, shape.height * scaleY)
          
          updates.width = newWidth
          updates.height = newHeight
          nodesToUpdate.push({ groupNode, type: 'diamond' })
        } else if (shape.type === 'circle') {
          const newRadiusX = Math.max(SHAPE_DEFAULTS.MIN_CIRCLE_RADIUS, shapeNode.radiusX() * scaleX)
          const newRadiusY = Math.max(SHAPE_DEFAULTS.MIN_CIRCLE_RADIUS, shapeNode.radiusY() * scaleY)
          
          updates.radiusX = newRadiusX
          updates.radiusY = newRadiusY
          nodesToUpdate.push({ groupNode, shapeNode, type: 'circle', radiusX: newRadiusX, radiusY: newRadiusY })
        } else if (shape.type === 'arrow') {
          const points = shapeNode.points()
          const scaledPoints = [
            points[0] * scaleX,
            points[1] * scaleY,
            points[2] * scaleX,
            points[3] * scaleY
          ]
          
          updates.points = scaledPoints
          nodesToUpdate.push({ groupNode, shapeNode, type: 'arrow', points: scaledPoints })
        } else if (shape.type === 'text') {
          // For text, we need to store the scale but reset the group scale
          // to prevent compounding on subsequent transforms
          updates.scaleX = scaleX
          updates.scaleY = scaleY
          nodesToUpdate.push({ groupNode, type: 'text', scaleX, scaleY })
        }
      }
      
      allUpdates.push(updates)
    })
    
    // PHASE 2: Apply all dimension changes and reset scales in a single batch
    // This prevents visual flicker and incorrect bounding box calculations
    nodesToUpdate.forEach(({ groupNode, shapeNode, type, width, height, radiusX, radiusY, points, scaleX, scaleY }) => {
      // Apply new dimensions directly to the shape node
      if (type === 'rectangle' && shapeNode) {
        // Reset group scale first
        groupNode.scaleX(1)
        groupNode.scaleY(1)
        shapeNode.width(width)
        shapeNode.height(height)
      } else if (type === 'circle' && shapeNode) {
        // Reset group scale first
        groupNode.scaleX(1)
        groupNode.scaleY(1)
        shapeNode.radiusX(radiusX)
        shapeNode.radiusY(radiusY)
      } else if (type === 'arrow' && shapeNode) {
        // Reset group scale first
        groupNode.scaleX(1)
        groupNode.scaleY(1)
        shapeNode.points(points)
      } else if (type === 'text') {
        // For text, reset the group scale to 1 to prevent compounding
        groupNode.scaleX(1)
        groupNode.scaleY(1)
      }
      // Note: diamond doesn't need shape node updates, just scale reset
      if (type === 'diamond') {
        groupNode.scaleX(1)
        groupNode.scaleY(1)
      }
    })
    
    // Force a complete redraw of the layer
    layer.batchDraw()
    
    // PHASE 3: Force transformer to recalculate its bounding box
    const transformer = transformerRef.current
    if (transformer) {
      // Detach and reattach nodes to force complete recalculation
      const selectedNodes = shapesToTransform
        .map(id => layer.findOne(`#shape-${id}`))
        .filter(node => node)
      
      transformer.nodes([])
      transformer.nodes(selectedNodes)
      transformer.forceUpdate()
      transformer.getLayer()?.batchDraw()
    }
    
    // PHASE 4: Update Firestore with new dimensions
    allUpdates.forEach(({ id, ...updates }) => {
      updateShape(id, updates)
    })
    
    // Clear transform immediately - the 200ms cleanup timer will keep the ghost visible
    clearTransform()
  }, [updateShape, currentUser, shapes, clearTransform, selectedShapeIds])

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

    // Check if clicking within transformer bounds (white space in multi-select)
    // This allows dragging the group by clicking anywhere in the bounding box
    const clickedOnStage = e.target === stage
    if (clickedOnStage && selectedShapeIds.length > 0 && e.evt.button === 0) {
      const transformer = transformerRef.current
      if (transformer) {
        const pointerPos = stage.getPointerPosition()
        if (pointerPos) {
          // Convert to canvas coordinates
          const canvasPos = {
            x: (pointerPos.x - stage.x()) / stage.scaleX(),
            y: (pointerPos.y - stage.y()) / stage.scaleY()
          }
          
          // Get transformer's bounding box
          const box = transformer.getClientRect({ skipTransform: false, relativeTo: stage })
          
          // Convert box to canvas coordinates
          const boxInCanvas = {
            x: (box.x - stage.x()) / stage.scaleX(),
            y: (box.y - stage.y()) / stage.scaleY(),
            width: box.width / stage.scaleX(),
            height: box.height / stage.scaleY()
          }
          
          // Check if click is within transformer bounds
          const isWithinTransformer = 
            canvasPos.x >= boxInCanvas.x &&
            canvasPos.x <= boxInCanvas.x + boxInCanvas.width &&
            canvasPos.y >= boxInCanvas.y &&
            canvasPos.y <= boxInCanvas.y + boxInCanvas.height
          
          if (isWithinTransformer) {
            // Start group drag
            isDragging.current = true
            isPanning.current = false
            groupDragStart.current = canvasPos
            
            // Store initial positions of all selected shapes
            const layer = stage.findOne('Layer')
            const initialPositions = {}
            selectedShapeIds.forEach(id => {
              const groupNode = layer?.findOne(`#shape-${id}`)
              if (groupNode) {
                initialPositions[id] = {
                  x: groupNode.x(),
                  y: groupNode.y()
                }
              }
            })
            groupDragInitialPositions.current = initialPositions
            return
          }
        }
      }
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
    const clickedOnCanvas = e.target === stage
    if (clickedOnCanvas && (e.evt.button === 0 || e.evt.button === 1)) {
      isPanning.current = true
    }
  }, [creatingRectangle, creatingDiamond, creatingCircle, creatingArrow, selectedShapeIds])

  const handleMouseUp = useCallback(() => {
    const stage = stageRef.current
    
    // Clear selection box if it's still showing
    if (selectionBox) {
      setSelectionBox(null)
    }
    
    // If we were dragging multi-select group from white space, finalize
    if (isDragging.current && selectedShapeIds.length > 0 && groupDragStart.current) {
      const layer = stage?.findOne('Layer')
      
      // Clear transform broadcast
      clearTransform()
      
      // Update all shapes in Firestore with their final positions
      selectedShapeIds.forEach(id => {
        const groupNode = layer?.findOne(`#shape-${id}`)
        if (groupNode) {
          updateShape(id, {
            x: groupNode.x(),
            y: groupNode.y(),
            updatedAt: Date.now(),
            lastModifiedBy: currentUser?.uid || 'unknown'
          })
        }
      })
      
      // Reset drag state
      isDragging.current = false
      groupDragStart.current = null
      groupDragInitialPositions.current = {}
      return
    }
    
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
        const shapesInBox = shapes.filter(shape => isShapeInSelectionBox(shape, box))
        
        // Filter out shapes that are locked by other users
        const availableShapes = shapesInBox.filter(shape => !isShapeLockedByOtherUser(shape.id))
        const selectedIds = availableShapes.map(shape => shape.id)
        
        // Check if there were locked shapes in the box
        const hadLockedShapes = shapesInBox.length > availableShapes.length
        
        // If there were locked shapes in the box, abort the selection entirely
        if (hadLockedShapes) {
          // Don't select anything - another user owns shapes in this box
          selectShapes([])
        } else if (selectedIds.length > 0) {
          // Select all available shapes within the box
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
            broadcastShape(rectangle) // Instant broadcast via RTDB
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
            broadcastShape(diamond) // Instant broadcast via RTDB
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
            broadcastShape(ellipse) // Instant broadcast via RTDB
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
            broadcastShape(arrow) // Instant broadcast via RTDB
          }
          // Keep creation mode active for multiple shapes
        }
      }
      
      // Reset drawing state
      setIsDrawing(false)
      setStartPos(null)
      setPreviewRect(null)
      clearShapePreview()
    }
    
    isPanning.current = false
  }, [isDrawing, startPos, addShape, currentUser, creatingRectangle, creatingDiamond, creatingCircle, creatingArrow, shapes, isShapeInSelectionBox, selectShapes, fillColor, fillOpacity, borderThickness, borderStyle, clearShapePreview, broadcastShape, isShapeLockedByOtherUser, updateShape, clearTransform, selectedShapeIds, selectionBox])

  const handleMouseMove = useCallback((e) => {
    const stage = stageRef.current
    if (!stage) return
    
    // Always track cursor position in canvas coordinates for duplication
    const pos = stage.getPointerPosition()
    if (pos) {
      // Store screen position for pan updates
      lastScreenMousePos.current = { x: pos.x, y: pos.y }
      
      const canvasPos = {
        x: (pos.x - stage.x()) / stage.scaleX(),
        y: (pos.y - stage.y()) / stage.scaleY()
      }
      lastCursorPos.current = canvasPos
      
      // Update viewport context for CustomizationPanel
      updateCursorPosition(canvasPos.x, canvasPos.y)
    }
    
    // If dragging multi-select group from white space, update positions
    if (isDragging.current && selectedShapeIds.length > 0 && !isSelectingRef.current && !isDrawing && groupDragStart.current) {
      const layer = stage.findOne('Layer')
      if (!layer) return
      
      const currentPos = pos
      if (!currentPos) return
      
      const canvasPos = {
        x: (currentPos.x - stage.x()) / stage.scaleX(),
        y: (currentPos.y - stage.y()) / stage.scaleY()
      }
      
      // Calculate delta from initial drag position
      const deltaX = canvasPos.x - groupDragStart.current.x
      const deltaY = canvasPos.y - groupDragStart.current.y
      
      // Move all selected shapes
      selectedShapeIds.forEach(id => {
        const groupNode = layer.findOne(`#shape-${id}`)
        const initialPos = groupDragInitialPositions.current[id]
        if (groupNode && initialPos) {
          groupNode.x(initialPos.x + deltaX)
          groupNode.y(initialPos.y + deltaY)
        }
      })
      
      layer.batchDraw()
      
      // Get first shape for broadcast reference
      const firstShapeId = selectedShapeIds[0]
      const firstShape = shapes.find(s => s.id === firstShapeId)
      const firstGroupNode = layer.findOne(`#shape-${firstShapeId}`)
      
      if (firstShape && firstGroupNode) {
        const broadcastDeltaX = firstGroupNode.x() - firstShape.x
        const broadcastDeltaY = firstGroupNode.y() - firstShape.y
        
        // Broadcast transform in real-time for instant sync
        syncTransform({
          shapeIds: selectedShapeIds,
          type: 'drag',
          x: firstGroupNode.x(),
          y: firstGroupNode.y(),
          deltaX: broadcastDeltaX,
          deltaY: broadcastDeltaY,
        })
      }
      return
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
            const preview = {
              type: 'rectangle',
              x: Math.min(startPos.x, canvasPos.x),
              y: Math.min(startPos.y, canvasPos.y),
              width: Math.abs(canvasPos.x - startPos.x),
              height: Math.abs(canvasPos.y - startPos.y),
              fillColor: hexToRgba(fillColor, fillOpacity),
              borderColor: SHAPE_DEFAULTS.DEFAULT_STROKE_COLOR,
              strokeWidth: borderThickness,
              borderStyle: borderStyle,
            }
            setPreviewRect(preview)
            syncShapePreview(preview)
          } else if (creatingDiamond) {
            const preview = {
              type: 'diamond',
              x: Math.min(startPos.x, canvasPos.x),
              y: Math.min(startPos.y, canvasPos.y),
              width: Math.abs(canvasPos.x - startPos.x),
              height: Math.abs(canvasPos.y - startPos.y),
              fillColor: hexToRgba(fillColor, fillOpacity),
              borderColor: SHAPE_DEFAULTS.DEFAULT_STROKE_COLOR,
              strokeWidth: borderThickness,
              borderStyle: borderStyle,
            }
            setPreviewRect(preview)
            syncShapePreview(preview)
          } else if (creatingCircle) {
            const radiusX = Math.abs(canvasPos.x - startPos.x)
            const radiusY = Math.abs(canvasPos.y - startPos.y)
            const preview = {
              type: 'circle',
              x: startPos.x,
              y: startPos.y,
              radiusX,
              radiusY,
              fillColor: hexToRgba(fillColor, fillOpacity),
              borderColor: SHAPE_DEFAULTS.DEFAULT_STROKE_COLOR,
              strokeWidth: borderThickness,
              borderStyle: borderStyle,
            }
            setPreviewRect(preview)
            syncShapePreview(preview)
          } else if (creatingArrow) {
            const arrowOpacity = Math.max(fillOpacity, 0.1)
            const arrowFillColor = hexToRgba(fillColor, arrowOpacity)
            const preview = {
              type: 'arrow',
              startX: startPos.x,
              startY: startPos.y,
              endX: canvasPos.x,
              endY: canvasPos.y,
              fillColor: arrowFillColor,
              borderColor: arrowFillColor,
              strokeWidth: borderThickness,
              borderStyle: borderStyle,
            }
            setPreviewRect(preview)
            syncShapePreview(preview)
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
      
      // Recalculate cursor position in canvas coordinates after panning
      updateCursorFromScreenPos()
    }
  }, [isDrawing, startPos, creatingRectangle, creatingDiamond, creatingCircle, creatingArrow, fillColor, fillOpacity, borderThickness, borderStyle, syncShapePreview, shapes, selectedShapeIds, syncTransform, updateCursorPosition, updateCursorFromScreenPos])

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
    
    // Update viewport context for CustomizationPanel
    updateZoom(newScale)
  }, [updateZoom])

  // Handle shape click for selection
  const handleShapeClick = useCallback((shapeId, e) => {
    // Check if this shape is locked by another user
    if (isShapeLockedByOtherUser(shapeId)) {
      // Don't allow selection of locked shapes
      return
    }
    
    // Clear any drawing state and selection box
    setIsDrawing(false)
    setStartPos(null)
    setPreviewRect(null)
    setSelectionBox(null)
    isSelectingRef.current = false
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
        // Add to selection - but only include shapes that aren't locked
        const newSelection = [...selectedShapeIds, shapeId].filter(id => !isShapeLockedByOtherUser(id))
        // Include currently selected shape if any (and not locked)
        if (selectedShapeId && !newSelection.includes(selectedShapeId) && !isShapeLockedByOtherUser(selectedShapeId)) {
          newSelection.push(selectedShapeId)
        }
        selectShapes(newSelection)
      }
    } else {
      // Normal click - select only this shape
      selectShape(shapeId)
    }
  }, [selectShape, selectShapes, selectedShapeId, selectedShapeIds, setCreatingRectangle, setCreatingDiamond, setCreatingCircle, setCreatingArrow, isShapeLockedByOtherUser])

  // Handle stage click for deselection (click on empty canvas)
  const handleStageClick = useCallback((e) => {
    // Don't clear selection if we just finished a selection box operation
    if (isSelectingRef.current) {
      return
    }
    
    // Check if we clicked on the stage itself (not a shape)
    const clickedOnEmpty = e.target === e.target.getStage()
    if (clickedOnEmpty) {
      // Don't clear selection if we clicked within the transformer's bounding box
      const transformer = transformerRef.current
      if (transformer && selectedShapeIds.length > 0) {
        const stage = e.target.getStage()
        const pointerPos = stage.getPointerPosition()
        if (pointerPos) {
          // Convert to canvas coordinates
          const canvasPos = {
            x: (pointerPos.x - stage.x()) / stage.scaleX(),
            y: (pointerPos.y - stage.y()) / stage.scaleY()
          }
          
          // Get transformer's bounding box in canvas coordinates
          const box = transformer.getClientRect({ skipTransform: false, relativeTo: stage })
          
          // Convert box to canvas coordinates
          const boxInCanvas = {
            x: (box.x - stage.x()) / stage.scaleX(),
            y: (box.y - stage.y()) / stage.scaleY(),
            width: box.width / stage.scaleX(),
            height: box.height / stage.scaleY()
          }
          
          // Check if click is within transformer bounds
          const isWithinTransformer = 
            canvasPos.x >= boxInCanvas.x &&
            canvasPos.x <= boxInCanvas.x + boxInCanvas.width &&
            canvasPos.y >= boxInCanvas.y &&
            canvasPos.y <= boxInCanvas.y + boxInCanvas.height
          
          if (isWithinTransformer) {
            // Don't clear selection - clicked within transformer bounds
            return
          }
        }
      }
      
      selectShape(null)
    }
  }, [selectShape, selectedShapeIds])

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
            {/* Render pending shapes from other users (instant broadcast via RTDB) */}
            {Object.entries(pendingShapes).map(([userId, pendingShape]) => {
              // Don't render current user's pending shapes (they're in regular shapes)
              if (userId === currentUser?.uid) return null
              
              // Don't render if shape already exists in Firestore
              if (shapes.some(s => s.id === pendingShape.id)) return null
              
              // Render as a non-interactive ghost shape with slight transparency
              const ghostOpacity = 0.7
              
              if (pendingShape.type === 'rectangle') {
                return (
                  <Rect
                    key={`pending-${pendingShape.id}`}
                    x={pendingShape.x}
                    y={pendingShape.y}
                    width={pendingShape.width}
                    height={pendingShape.height}
                    fill={pendingShape.fillColor}
                    stroke={pendingShape.borderColor}
                    strokeWidth={pendingShape.strokeWidth}
                    dash={getBorderDash(pendingShape.borderStyle)}
                    rotation={pendingShape.rotation || 0}
                    opacity={ghostOpacity}
                    listening={false}
                    perfectDrawEnabled={false}
                  />
                )
              } else if (pendingShape.type === 'diamond') {
                const halfWidth = pendingShape.width / 2
                const halfHeight = pendingShape.height / 2
                const points = [
                  pendingShape.x + halfWidth, pendingShape.y,
                  pendingShape.x + pendingShape.width, pendingShape.y + halfHeight,
                  pendingShape.x + halfWidth, pendingShape.y + pendingShape.height,
                  pendingShape.x, pendingShape.y + halfHeight
                ]
                return (
                  <Line
                    key={`pending-${pendingShape.id}`}
                    points={points}
                    fill={pendingShape.fillColor}
                    stroke={pendingShape.borderColor}
                    strokeWidth={pendingShape.strokeWidth}
                    dash={getBorderDash(pendingShape.borderStyle)}
                    closed={true}
                    rotation={pendingShape.rotation || 0}
                    opacity={ghostOpacity}
                    listening={false}
                    perfectDrawEnabled={false}
                  />
                )
              } else if (pendingShape.type === 'circle') {
                return (
                  <Ellipse
                    key={`pending-${pendingShape.id}`}
                    x={pendingShape.x}
                    y={pendingShape.y}
                    radiusX={pendingShape.radiusX}
                    radiusY={pendingShape.radiusY}
                    fill={pendingShape.fillColor}
                    stroke={pendingShape.borderColor}
                    strokeWidth={pendingShape.strokeWidth}
                    dash={getBorderDash(pendingShape.borderStyle)}
                    rotation={pendingShape.rotation || 0}
                    opacity={ghostOpacity}
                    listening={false}
                    perfectDrawEnabled={false}
                  />
                )
              } else if (pendingShape.type === 'arrow') {
                return (
                  <Arrow
                    key={`pending-${pendingShape.id}`}
                    points={pendingShape.points}
                    stroke={pendingShape.borderColor}
                    fill={pendingShape.fillColor}
                    strokeWidth={pendingShape.strokeWidth}
                    dash={getBorderDash(pendingShape.borderStyle)}
                    rotation={pendingShape.rotation || 0}
                    opacity={ghostOpacity}
                    listening={false}
                    perfectDrawEnabled={false}
                    pointerLength={pendingShape.strokeWidth * 5}
                    pointerWidth={pendingShape.strokeWidth * 5}
                  />
                )
              }
              
              return null
            })}
            
            {/* Render all shapes */}
            {shapes.map((shape) => {
              const isSelected = shape.id === selectedShapeId || selectedShapeIds.includes(shape.id)
              
              // Check if this shape is being actively transformed by another user
              // AND if a ghost will actually be rendered for it
              const activeTransform = Object.entries(remoteTransforms).find(([userId, transform]) => {
                return userId !== currentUser?.uid && transform.shapeIds.includes(shape.id)
              })
              
              // Only hide if transform exists AND ghost will be rendered
              // Ghost is NOT rendered for multi-select rotate/resize
              const isBeingTransformedWithGhost = activeTransform && 
                !(activeTransform[1].type === 'transform' && activeTransform[1].shapeIds.length > 1)
              
              // Check if there's a ghost shape being shown for this (from lastTransformStates)
              // IMPORTANT: Only hide if a ghost is ACTUALLY being rendered
              // For multi-select transforms, we skip ghost rendering, so don't hide the real shape
              const lastState = lastTransformStates[shape.id]
              const hasGhostShape = lastState && !(lastState.transform.type === 'transform' && lastState.transform.shapeIds.length > 1)
              
              // Only hide the real shape if a ghost is actually being rendered
              // This prevents flicker when the transform ends but before Firestore updates
              if (isBeingTransformedWithGhost || hasGhostShape) {
                return null
              }
              
              const renderOpacity = 1.0
              // Check if this shape is locked by another user
              const isLocked = isShapeLockedByOtherUser(shape.id)
              
              if (shape.type === 'rectangle') {
                return (
                  <Rectangle
                    key={shape.id}
                    shape={shape}
                    isSelected={isSelected}
                    userColor={userColor}
                    opacity={renderOpacity}
                    isDraggable={!isLocked}
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
                    opacity={renderOpacity}
                    isDraggable={!isLocked}
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
                    isDraggable={!isLocked}
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
                    isDraggable={!isLocked}
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
                    isDraggable={!isLocked}
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
            
            {/* Transformer for resizing and rotating selected shape(s) */}
            <Transformer
              ref={transformerRef}
              draggable={true}
              rotateEnabled={true}
              enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right', 'middle-left', 'middle-right', 'top-center', 'bottom-center']}
              borderStroke={userColor}
              borderStrokeWidth={3}
              anchorStroke={userColor}
              anchorFill={userColor}
              anchorSize={8}
              ignoreStroke={false}
              useSingleNodeRotation={false}
              flipEnabled={false}
              onDragStart={handleTransformerDragStart}
              onDragMove={handleTransformerDragMove}
              onDragEnd={handleTransformerDragEnd}
              boundBoxFunc={(oldBox, newBox) => {
                // Enforce minimum size during transform
                if (newBox.width < SHAPE_DEFAULTS.MIN_SHAPE_SIZE || newBox.height < SHAPE_DEFAULTS.MIN_SHAPE_SIZE) {
                  return oldBox
                }
                return newBox
              }}
              onTransform={(e) => {
                // Broadcast transform in real-time
                const node = e.target
                syncTransform({
                  shapeIds: selectedShapeIds.length > 0 ? selectedShapeIds : (selectedShapeId ? [selectedShapeId] : []),
                  type: 'transform',
                  x: node.x(),
                  y: node.y(),
                  rotation: node.rotation(),
                  scaleX: node.scaleX(),
                  scaleY: node.scaleY(),
                })
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
            
            {/* Remote users' shape previews (shapes being drawn by others) */}
            {Object.entries(shapePreviews).map(([userId, preview]) => {
              // Don't render current user's preview (already shown above)
              if (userId === currentUser?.uid) return null
              
              // Render preview with semi-transparent overlay
              const overlayOpacity = 0.5
              
              if (preview.type === 'rectangle') {
                return (
                  <Rect
                    key={`preview-${userId}`}
                    x={preview.x}
                    y={preview.y}
                    width={preview.width}
                    height={preview.height}
                    fill={preview.fillColor}
                    stroke={preview.borderColor}
                    strokeWidth={preview.strokeWidth}
                    dash={getBorderDash(preview.borderStyle)}
                    opacity={overlayOpacity}
                    listening={false}
                    perfectDrawEnabled={false}
                    strokeScaleEnabled={false}
                  />
                )
              } else if (preview.type === 'diamond') {
                const points = [
                  preview.x + preview.width / 2, preview.y,
                  preview.x + preview.width, preview.y + preview.height / 2,
                  preview.x + preview.width / 2, preview.y + preview.height,
                  preview.x, preview.y + preview.height / 2
                ]
                return (
                  <Line
                    key={`preview-${userId}`}
                    points={points}
                    fill={preview.fillColor}
                    stroke={preview.borderColor}
                    strokeWidth={preview.strokeWidth}
                    dash={getBorderDash(preview.borderStyle)}
                    closed={true}
                    opacity={overlayOpacity}
                    listening={false}
                    perfectDrawEnabled={false}
                    strokeScaleEnabled={false}
                  />
                )
              } else if (preview.type === 'circle') {
                return (
                  <Ellipse
                    key={`preview-${userId}`}
                    x={preview.x}
                    y={preview.y}
                    radiusX={preview.radiusX || 0}
                    radiusY={preview.radiusY || 0}
                    fill={preview.fillColor}
                    stroke={preview.borderColor}
                    strokeWidth={preview.strokeWidth}
                    dash={getBorderDash(preview.borderStyle)}
                    opacity={overlayOpacity}
                    listening={false}
                    perfectDrawEnabled={false}
                    strokeScaleEnabled={false}
                  />
                )
              } else if (preview.type === 'arrow') {
                return (
                  <Arrow
                    key={`preview-${userId}`}
                    points={[
                      preview.startX,
                      preview.startY,
                      preview.endX,
                      preview.endY
                    ]}
                    stroke={preview.borderColor}
                    fill={preview.fillColor}
                    strokeWidth={preview.strokeWidth}
                    dash={getBorderDash(preview.borderStyle)}
                    opacity={overlayOpacity}
                    listening={false}
                    perfectDrawEnabled={false}
                    strokeScaleEnabled={false}
                    pointerLength={preview.strokeWidth * 5}
                    pointerWidth={preview.strokeWidth * 5}
                  />
                )
              }
              
              return null
            })}
            
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
            
            {/* Remote user transformations (shapes being moved/rotated by others) */}
            {/* Include both active transforms AND recently finished transforms (to prevent flicker) */}
            {Object.entries({ ...remoteTransforms, ...Object.fromEntries(
              Object.entries(lastTransformStates).filter(([shapeId]) => 
                !Object.values(remoteTransforms).some(t => t.shapeIds?.includes(shapeId))
              ).map(([shapeId, state]) => [state.userId, state.transform])
            ) }).map(([userId, transform]) => {
              // Don't show current user's transforms
              if (userId === currentUser?.uid) return null
              if (!transform || !transform.shapeIds) return null
              
              // For multi-select transforms (rotate/scale), don't show ghost shapes
              // The math for properly transforming each shape relative to the group is complex
              // and can cause visual issues. Only show ghosts for drag operations or single shapes.
              if (transform.type === 'transform' && transform.shapeIds.length > 1) {
                return null
              }
              
              // Render ghost shapes at their transformed positions
              return transform.shapeIds.map(shapeId => {
                // Try to use the snapshot first (more accurate during buffer period)
                // Otherwise fall back to current shape data
                const lastState = lastTransformStates[shapeId]
                const shape = lastState?.shapeSnapshot || shapes.find(s => s.id === shapeId)
                if (!shape) return null
                
                const ghostOpacity = 0.5
                
                // Apply transform based on type
                let transformedProps = {}
                let finalDimensions = {}
                
                if (transform.type === 'drag') {
                  // For drag, keep original rotation but apply delta to shape's position
                  // This allows multi-select to work correctly - each shape moves by the same delta
                  const deltaX = transform.deltaX || 0
                  const deltaY = transform.deltaY || 0
                  
                  transformedProps = {
                    x: shape.x + deltaX,
                    y: shape.y + deltaY,
                    rotation: shape.rotation || 0, // Preserve original rotation during drag
                  }
                } else if (transform.type === 'transform') {
                  // For transform (rotate/scale) - only single shapes at this point
                  const scaleX = transform.scaleX || 1
                  const scaleY = transform.scaleY || 1
                  
                  transformedProps = {
                    x: transform.x,
                    y: transform.y,
                    rotation: transform.rotation || 0,
                  }
                  
                  // Calculate final dimensions with scale applied
                  if (shape.type === 'rectangle' || shape.type === 'diamond') {
                    finalDimensions = {
                      width: shape.width * scaleX,
                      height: shape.height * scaleY,
                    }
                  } else if (shape.type === 'circle') {
                    finalDimensions = {
                      radiusX: shape.radiusX * scaleX,
                      radiusY: shape.radiusY * scaleY,
                    }
                  } else if (shape.type === 'arrow') {
                    finalDimensions = {
                      points: [
                        shape.points[0] * scaleX,
                        shape.points[1] * scaleY,
                        shape.points[2] * scaleX,
                        shape.points[3] * scaleY,
                      ]
                    }
                  }
                }
                
                // Render based on shape type
                if (shape.type === 'rectangle') {
                  return (
                    <Rect
                      key={`transform-${userId}-${shapeId}`}
                      {...transformedProps}
                      width={finalDimensions.width || shape.width}
                      height={finalDimensions.height || shape.height}
                      fill={shape.fillColor}
                      stroke={transform.colorHex}
                      strokeWidth={shape.strokeWidth + 2}
                      dash={getBorderDash(shape.borderStyle)}
                      opacity={ghostOpacity}
                      listening={false}
                      perfectDrawEnabled={false}
                    />
                  )
                } else if (shape.type === 'diamond') {
                  const width = finalDimensions.width || shape.width
                  const height = finalDimensions.height || shape.height
                  const halfWidth = width / 2
                  const halfHeight = height / 2
                  const points = [
                    halfWidth, 0,
                    width, halfHeight,
                    halfWidth, height,
                    0, halfHeight
                  ]
                  return (
                    <Line
                      key={`transform-${userId}-${shapeId}`}
                      {...transformedProps}
                      points={points}
                      fill={shape.fillColor}
                      stroke={transform.colorHex}
                      strokeWidth={shape.strokeWidth + 2}
                      dash={getBorderDash(shape.borderStyle)}
                      closed={true}
                      opacity={ghostOpacity}
                      listening={false}
                      perfectDrawEnabled={false}
                    />
                  )
                } else if (shape.type === 'circle') {
                  return (
                    <Ellipse
                      key={`transform-${userId}-${shapeId}`}
                      {...transformedProps}
                      x={transformedProps.x || shape.x}
                      y={transformedProps.y || shape.y}
                      radiusX={finalDimensions.radiusX || shape.radiusX}
                      radiusY={finalDimensions.radiusY || shape.radiusY}
                      fill={shape.fillColor}
                      stroke={transform.colorHex}
                      strokeWidth={shape.strokeWidth + 2}
                      dash={getBorderDash(shape.borderStyle)}
                      opacity={ghostOpacity}
                      listening={false}
                      perfectDrawEnabled={false}
                    />
                  )
                } else if (shape.type === 'arrow') {
                  return (
                    <Arrow
                      key={`transform-${userId}-${shapeId}`}
                      {...transformedProps}
                      points={finalDimensions.points || shape.points}
                      stroke={transform.colorHex}
                      fill={transform.colorHex}
                      strokeWidth={shape.strokeWidth + 2}
                      dash={getBorderDash(shape.borderStyle)}
                      opacity={ghostOpacity}
                      listening={false}
                      perfectDrawEnabled={false}
                      pointerLength={shape.strokeWidth * 5}
                      pointerWidth={shape.strokeWidth * 5}
                    />
                  )
                } else if (shape.type === 'text') {
                  // Convert font size to pixels if it's a string
                  const getFontSizePixels = (sizeStr) => {
                    if (typeof sizeStr === 'number') return sizeStr
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
                  
                  // Combine fontStyle and fontWeight for Konva
                  let combinedFontStyle = ''
                  if (shapeFontStyle === 'italic') {
                    combinedFontStyle = shapeFontWeight === 'bold' ? 'italic bold' : 'italic'
                  } else {
                    combinedFontStyle = shapeFontWeight === 'bold' ? 'bold' : 'normal'
                  }
                  
                  return (
                    <Text
                      key={`transform-${userId}-${shapeId}`}
                      {...transformedProps}
                      scaleX={shape.scaleX || 1}
                      scaleY={shape.scaleY || 1}
                      text={shape.text}
                      fontSize={fontSizePixels}
                      fontFamily={shape.fontFamily || 'Arial'}
                      fontStyle={combinedFontStyle}
                      textDecoration={shape.textDecoration || 'none'}
                      fill={shape.fillColor}
                      stroke={transform.colorHex}
                      strokeWidth={1}
                      opacity={ghostOpacity}
                      listening={false}
                      perfectDrawEnabled={false}
                    />
                  )
                }
                
                return null
              })
            })}
            
            {/* Remote user selections (show what other users have selected) */}
            {Object.entries(remoteSelections).map(([userId, selection]) => {
              // Don't show current user's selection (already shown via Transformer)
              if (userId === currentUser?.uid) return null
              
              // Check if this user has an active transform (if so, don't show bounding box - ghost is shown instead)
              const hasActiveTransform = remoteTransforms[userId]
              
              // Get all selected shapes for this user
              const selectedShapes = selection.shapeIds
                .map(shapeId => shapes.find(s => s.id === shapeId))
                .filter(shape => {
                  if (!shape) return false
                  
                  // Don't include if being actively transformed
                  if (hasActiveTransform && hasActiveTransform.shapeIds.includes(shape.id)) {
                    return false
                  }
                  
                  // Don't include if there's a ghost shape being shown (during buffer period)
                  if (lastTransformStates[shape.id] !== undefined) {
                    return false
                  }
                  
                  // Don't include if current user is transforming it
                  const isBeingTransformedByMe = (
                    (selectedShapeId === shape.id || selectedShapeIds.includes(shape.id)) &&
                    (isDragging.current || isTransforming.current)
                  )
                  if (isBeingTransformedByMe) {
                    return false
                  }
                  
                  return true
                })
              
              if (selectedShapes.length === 0) return null
              
              // Calculate unified bounding box for all selected shapes
              const padding = 5
              
              // Helper function to get shape bounds in world coordinates
              const getShapeBounds = (shape) => {
                if (shape.type === 'rectangle') {
                  // For rotated rectangles, calculate corners and get AABB
                  const rotation = (shape.rotation || 0) * Math.PI / 180
                  const corners = [
                    { x: shape.x, y: shape.y },
                    { x: shape.x + shape.width, y: shape.y },
                    { x: shape.x + shape.width, y: shape.y + shape.height },
                    { x: shape.x, y: shape.y + shape.height }
                  ]
                  
                  // Rotate corners around top-left
                  const rotatedCorners = corners.map(corner => ({
                    x: shape.x + (corner.x - shape.x) * Math.cos(rotation) - (corner.y - shape.y) * Math.sin(rotation),
                    y: shape.y + (corner.x - shape.x) * Math.sin(rotation) + (corner.y - shape.y) * Math.cos(rotation)
                  }))
                  
                  const xs = rotatedCorners.map(c => c.x)
                  const ys = rotatedCorners.map(c => c.y)
                  
                  return {
                    minX: Math.min(...xs),
                    maxX: Math.max(...xs),
                    minY: Math.min(...ys),
                    maxY: Math.max(...ys)
                  }
                } else if (shape.type === 'diamond') {
                  // Similar to rectangle
                  const rotation = (shape.rotation || 0) * Math.PI / 180
                  const corners = [
                    { x: shape.x + shape.width / 2, y: shape.y },
                    { x: shape.x + shape.width, y: shape.y + shape.height / 2 },
                    { x: shape.x + shape.width / 2, y: shape.y + shape.height },
                    { x: shape.x, y: shape.y + shape.height / 2 }
                  ]
                  
                  const rotatedCorners = corners.map(corner => ({
                    x: shape.x + (corner.x - shape.x) * Math.cos(rotation) - (corner.y - shape.y) * Math.sin(rotation),
                    y: shape.y + (corner.x - shape.x) * Math.sin(rotation) + (corner.y - shape.y) * Math.cos(rotation)
                  }))
                  
                  const xs = rotatedCorners.map(c => c.x)
                  const ys = rotatedCorners.map(c => c.y)
                  
                  return {
                    minX: Math.min(...xs),
                    maxX: Math.max(...xs),
                    minY: Math.min(...ys),
                    maxY: Math.max(...ys)
                  }
                } else if (shape.type === 'circle') {
                  // For circles, approximate with axis-aligned bounds
                  return {
                    minX: shape.x - shape.radiusX,
                    maxX: shape.x + shape.radiusX,
                    minY: shape.y - shape.radiusY,
                    maxY: shape.y + shape.radiusY
                  }
                } else if (shape.type === 'arrow') {
                  // Arrow points are relative to shape.x and shape.y, so convert to absolute coordinates
                  const [x1, y1, x2, y2] = shape.points
                  const absX1 = shape.x + x1
                  const absY1 = shape.y + y1
                  const absX2 = shape.x + x2
                  const absY2 = shape.y + y2
                  
                  return {
                    minX: Math.min(absX1, absX2),
                    maxX: Math.max(absX1, absX2),
                    minY: Math.min(absY1, absY2),
                    maxY: Math.max(absY1, absY2)
                  }
                } else if (shape.type === 'text') {
                  // Convert font size to pixels if it's a string
                  const getFontSizePixels = (sizeStr) => {
                    if (typeof sizeStr === 'number') return sizeStr
                    switch (sizeStr) {
                      case 'small': return 18
                      case 'medium': return 24
                      case 'large': return 32
                      default: return 24
                    }
                  }
                  
                  const fontSize = getFontSizePixels(shape.fontSize) || 24
                  const scaleX = shape.scaleX || 1
                  const scaleY = shape.scaleY || 1
                  const textLength = (shape.text || '').length
                  const width = Math.max(textLength * fontSize * 0.6 * scaleX, 50)
                  const height = fontSize * 1.2 * scaleY
                  
                  // For rotated text, calculate corners
                  const rotation = (shape.rotation || 0) * Math.PI / 180
                  const corners = [
                    { x: shape.x, y: shape.y },
                    { x: shape.x + width, y: shape.y },
                    { x: shape.x + width, y: shape.y + height },
                    { x: shape.x, y: shape.y + height }
                  ]
                  
                  const rotatedCorners = corners.map(corner => ({
                    x: shape.x + (corner.x - shape.x) * Math.cos(rotation) - (corner.y - shape.y) * Math.sin(rotation),
                    y: shape.y + (corner.x - shape.x) * Math.sin(rotation) + (corner.y - shape.y) * Math.cos(rotation)
                  }))
                  
                  const xs = rotatedCorners.map(c => c.x)
                  const ys = rotatedCorners.map(c => c.y)
                  
                  return {
                    minX: Math.min(...xs),
                    maxX: Math.max(...xs),
                    minY: Math.min(...ys),
                    maxY: Math.max(...ys)
                  }
                }
                
                return { minX: 0, maxX: 0, minY: 0, maxY: 0 }
              }
              
              // Calculate overall bounding box
              const allBounds = selectedShapes.map(getShapeBounds)
              const minX = Math.min(...allBounds.map(b => b.minX))
              const maxX = Math.max(...allBounds.map(b => b.maxX))
              const minY = Math.min(...allBounds.map(b => b.minY))
              const maxY = Math.max(...allBounds.map(b => b.maxY))
              
              return (
                <Rect
                  key={`remote-selection-${userId}`}
                  x={minX - padding}
                  y={minY - padding}
                  width={maxX - minX + padding * 2}
                  height={maxY - minY + padding * 2}
                  stroke={selection.colorHex}
                  strokeWidth={3}
                  dash={[8, 4]}
                  listening={false}
                  perfectDrawEnabled={false}
                />
              )
            })}
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
      {editingTextId && (() => {
        // Get the text shape being edited to match its styling
        const editingShape = shapes.find(s => s.id === editingTextId)
        const stage = stageRef.current
        
        // Calculate font size in pixels
        const getFontSizePixels = (size) => {
          switch (size) {
            case 'small': return 16
            case 'medium': return 24
            case 'large': return 32
            default: return 24
          }
        }
        
        // Get base font size and scale it by the canvas zoom level
        const baseFontSize = editingShape ? getFontSizePixels(editingShape.fontSize) : 24
        const currentScale = stage ? stage.scaleX() : 1
        const inputFontSize = baseFontSize * currentScale
        
        const inputFontFamily = editingShape?.fontFamily || 'Arial'
        const inputFontWeight = editingShape?.fontWeight || 'normal'
        const inputFontStyle = editingShape?.fontStyle || 'normal'
        const inputTextDecoration = editingShape?.textDecoration || 'none'
        
        return (
          <input
            ref={textInputRef}
            type="text"
            value={textInput}
            spellCheck={false}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
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
              fontSize: `${inputFontSize}px`,
              fontFamily: inputFontFamily,
              fontWeight: inputFontWeight,
              fontStyle: inputFontStyle,
              textDecoration: inputTextDecoration,
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
        )
      })()}
    </div>
  )
}

export default Canvas
