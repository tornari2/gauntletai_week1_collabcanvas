import React, { useRef, useState, useEffect, useCallback } from 'react'
import { Stage, Layer } from 'react-konva'
import { CANVAS_CONFIG } from '../utils/constants'

function Canvas() {
  const containerRef = useRef(null)
  const stageRef = useRef(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 })
  const [stageScale, setStageScale] = useState(1)
  const isPanning = useRef(false)


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
    // Start panning on left click or middle click
    if (e.evt.button === 0 || e.evt.button === 1) {
      isPanning.current = true
    }
  }, [])

  const handleMouseUp = useCallback(() => {
    isPanning.current = false
  }, [])

  const handleMouseMove = useCallback((e) => {
    if (!isPanning.current) return
    
    // Update stage position based on mouse movement
    const stage = stageRef.current
    if (stage) {
      const newPos = {
        x: stage.x() + e.evt.movementX,
        y: stage.y() + e.evt.movementY
      }
      setStagePos(newPos)
    }
  }, [])

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

    setStageScale(newScale)
    setStagePos(newPos)
  }, [])

  return (
    <div ref={containerRef} className="canvas-container">
      {dimensions.width > 0 && dimensions.height > 0 ? (
        <Stage
          ref={stageRef}
          width={dimensions.width}
          height={dimensions.height}
          x={stagePos.x}
          y={stagePos.y}
          scaleX={stageScale}
          scaleY={stageScale}
          draggable={false}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          onWheel={handleWheel}
          style={{ backgroundColor: '#ffffff' }}
        >
          <Layer>
            {/* Shapes will be rendered here in future PRs */}
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
