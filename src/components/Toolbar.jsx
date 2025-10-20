import React from 'react'
import { useCanvas } from '../context/CanvasContext'
import { useAI } from '../context/AIContext'
import { useLegend } from '../context/LegendContext'
import '../styles/Legend.css'

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
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <polyline points="3 6 5 6 21 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="10" y1="11" x2="10" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <line x1="14" y1="11" x2="14" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
)

const LegendIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="12" y1="17" x2="12.01" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
)

const DownloadIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <polyline points="7 10 12 15 17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
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
    deleteShapes,
    stageRef
  } = useCanvas()
  
  const { togglePanel, isPanelOpen } = useAI()
  const { isLegendOpen, openLegend, closeLegend } = useLegend()

  // Helper to toggle shape creation mode and deactivate others
  const toggleShapeMode = (setter, currentState) => {
    setCreatingRectangle(false)
    setCreatingDiamond(false)
    setCreatingCircle(false)
    setCreatingArrow(false)
    setter(!currentState)
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

  const handleExportCanvas = () => {
    if (!stageRef.current) return
    
    const confirmed = window.confirm('Would you like to save the canvas as a PNG?')
    
    if (!confirmed) return
    
    try {
      // Get the stage and export as data URL
      const stage = stageRef.current
      const dataURL = stage.toDataURL({ pixelRatio: 2 }) // 2x resolution for better quality
      
      // Create a download link
      const link = document.createElement('a')
      link.download = `canvas-${Date.now()}.png`
      link.href = dataURL
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Error exporting canvas:', error)
      alert('Failed to export canvas. Please try again.')
    }
  }

  return (
    <>
      <div className="toolbar">
        {/* Center: Shape tools */}
        <div className="toolbar-center">
          <button
            className="toolbar-button export-button"
            onClick={handleExportCanvas}
            title="Export as PNG"
            disabled={shapes.length === 0}
          >
            <DownloadIcon />
          </button>
          <button
            className="toolbar-button legend-button"
            onMouseEnter={openLegend}
            onMouseLeave={closeLegend}
            title="Keyboard Shortcuts"
          >
            <LegendIcon />
          </button>
        <div className="toolbar-separator"></div>
        <button
          className={`toolbar-button ${creatingRectangle ? 'active' : ''}`}
          onClick={() => toggleShapeMode(setCreatingRectangle, creatingRectangle)}
          title="Create Rectangle"
        >
          <RectangleIcon />
        </button>
        <button
          className={`toolbar-button ${creatingDiamond ? 'active' : ''}`}
          onClick={() => toggleShapeMode(setCreatingDiamond, creatingDiamond)}
          title="Create Diamond"
        >
          <DiamondIcon />
        </button>
        <button
          className={`toolbar-button ${creatingCircle ? 'active' : ''}`}
          onClick={() => toggleShapeMode(setCreatingCircle, creatingCircle)}
          title="Create Ellipse"
        >
          <EllipseIcon />
        </button>
        <button
          className={`toolbar-button ${creatingArrow ? 'active' : ''}`}
          onClick={() => toggleShapeMode(setCreatingArrow, creatingArrow)}
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

      {/* Right side: AI Assistant */}
      <div className="toolbar-right">
        <button
          className={`toolbar-button ai-assistant-button ${isPanelOpen ? 'active' : ''}`}
          onClick={togglePanel}
          title={isPanelOpen ? 'Close AI Assistant' : 'Open AI Assistant'}
        >
          <span className="ai-icon">🤖</span>
        </button>
      </div>
    </div>

    {/* Legend Tooltip */}
    {isLegendOpen && (
      <div className="legend-tooltip-container" onMouseEnter={openLegend} onMouseLeave={closeLegend}>
        <div className="legend-tooltip">
          <h3>Keyboard Shortcuts</h3>
          
          <div className="legend-section">
            <h4>Navigation</h4>
            <div className="legend-item">
              <kbd>↑ ↓ ← →</kbd>
              <span>Pan canvas</span>
            </div>
          </div>

          <div className="legend-section">
            <h4>Shape Creation</h4>
            <div className="legend-item">
              <kbd>1</kbd>
              <span>Rectangle</span>
            </div>
            <div className="legend-item">
              <kbd>2</kbd>
              <span>Diamond</span>
            </div>
            <div className="legend-item">
              <kbd>3</kbd>
              <span>Circle/Ellipse</span>
            </div>
            <div className="legend-item">
              <kbd>4</kbd>
              <span>Arrow</span>
            </div>
            <div className="legend-item">
              <kbd>Double Click</kbd>
              <span>Add text</span>
            </div>
          </div>

          <div className="legend-section">
            <h4>Shape Operations</h4>
            <div className="legend-item">
              <kbd>Ctrl/Cmd + C</kbd>
              <span>Copy</span>
            </div>
            <div className="legend-item">
              <kbd>Ctrl/Cmd + X</kbd>
              <span>Cut</span>
            </div>
            <div className="legend-item">
              <kbd>Ctrl/Cmd + V</kbd>
              <span>Paste</span>
            </div>
            <div className="legend-item">
              <kbd>Ctrl/Cmd + D</kbd>
              <span>Duplicate</span>
            </div>
            <div className="legend-item">
              <kbd>Delete / Backspace</kbd>
              <span>Delete selected</span>
            </div>
          </div>

          <div className="legend-section">
            <h4>Selection</h4>
            <div className="legend-item">
              <kbd>Shift + Click/Drag</kbd>
              <span>Multi-select</span>
            </div>
          </div>

          <div className="legend-section">
            <h4>AI Assistant</h4>
            <div className="legend-item">
              <kbd>A</kbd>
              <span>Toggle AI panel</span>
            </div>
          </div>
        </div>
      </div>
    )}
  </>
  )
}

export default Toolbar

