import React, { useState } from 'react'
import '../styles/Legend.css'

function Legend() {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div className="legend-container">
      <button
        className="legend-button"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        aria-label="Show keyboard shortcuts"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      </button>

      {isHovered && (
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
      )}
    </div>
  )
}

export default Legend

