import React from 'react'
import { useCanvas } from '../context/CanvasContext'

function Toolbar() {
  const { creatingRectangle, setCreatingRectangle } = useCanvas()

  const handleCreateRectangle = () => {
    setCreatingRectangle(!creatingRectangle)
  }

  return (
    <div className="toolbar">
      <button
        className={`toolbar-button ${creatingRectangle ? 'active' : ''}`}
        onClick={handleCreateRectangle}
      >
        Create Rectangle
      </button>
    </div>
  )
}

export default Toolbar

