import React from 'react'
import { useCanvas } from '../context/CanvasContext'

// SVG Icon Components
const RectangleIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="6" width="16" height="12" stroke="currentColor" strokeWidth="2" fill="none" rx="1"/>
  </svg>
)

const DiamondIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 5 L21 12 L12 19 L3 12 Z" stroke="currentColor" strokeWidth="2" fill="none" strokeLinejoin="round"/>
  </svg>
)

const EllipseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="12" cy="12" rx="9" ry="6" stroke="currentColor" strokeWidth="2" fill="none"/>
  </svg>
)

const ArrowIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <line x1="4" y1="18" x2="20" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <polyline points="14,6 20,6 20,12" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const TrashIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <polyline points="3 6 5 6 21 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="10" y1="11" x2="10" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <line x1="14" y1="11" x2="14" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
)

function Toolbar() {
  const { 
    shapes,
    creatingRectangle, 
    setCreatingRectangle,
    creatingDiamond,
    setCreatingDiamond,
    creatingCircle,
    setCreatingCircle,
    creatingArrow,
    setCreatingArrow,
    deleteShapes
  } = useCanvas()

  const handleCreateRectangle = () => {
    setCreatingRectangle(!creatingRectangle)
    setCreatingDiamond(false)
    setCreatingCircle(false)
    setCreatingArrow(false)
  }

  const handleCreateDiamond = () => {
    setCreatingDiamond(!creatingDiamond)
    setCreatingRectangle(false)
    setCreatingCircle(false)
    setCreatingArrow(false)
  }

  const handleCreateCircle = () => {
    setCreatingCircle(!creatingCircle)
    setCreatingRectangle(false)
    setCreatingDiamond(false)
    setCreatingArrow(false)
  }

  const handleCreateArrow = () => {
    setCreatingArrow(!creatingArrow)
    setCreatingRectangle(false)
    setCreatingDiamond(false)
    setCreatingCircle(false)
  }

  const handleClearCanvas = () => {
    if (shapes.length === 0) return
    
    const confirmed = window.confirm(
      `Delete all ${shapes.length} shape${shapes.length === 1 ? '' : 's'}?`
    )
    
    if (confirmed) {
      const allShapeIds = shapes.map(shape => shape.id)
      deleteShapes(allShapeIds)
    }
  }

  return (
    <div className="toolbar">
      <button
        className={`toolbar-button ${creatingRectangle ? 'active' : ''}`}
        onClick={handleCreateRectangle}
        title="Create Rectangle"
      >
        <RectangleIcon />
      </button>
      <button
        className={`toolbar-button ${creatingDiamond ? 'active' : ''}`}
        onClick={handleCreateDiamond}
        title="Create Diamond"
      >
        <DiamondIcon />
      </button>
      <button
        className={`toolbar-button ${creatingCircle ? 'active' : ''}`}
        onClick={handleCreateCircle}
        title="Create Ellipse"
      >
        <EllipseIcon />
      </button>
      <button
        className={`toolbar-button ${creatingArrow ? 'active' : ''}`}
        onClick={handleCreateArrow}
        title="Create Arrow"
      >
        <ArrowIcon />
      </button>
      <div className="toolbar-separator"></div>
      <button
        className="toolbar-button clear-canvas-button"
        onClick={handleClearCanvas}
        title="Clear Canvas"
        disabled={shapes.length === 0}
      >
        <TrashIcon />
      </button>
    </div>
  )
}

export default Toolbar

