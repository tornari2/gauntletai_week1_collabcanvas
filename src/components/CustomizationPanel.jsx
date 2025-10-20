import React, { useEffect, useState } from 'react'
import { useCanvas } from '../context/CanvasContext'
import { useCanvasViewport } from '../context/CanvasViewportContext'
import { hexToHue, hueToRgba, rgbaToHex } from '../utils/colorUtils'
import '../styles/CustomizationPanel.css'

function CustomizationPanel() {
  const { 
    shapes,
    selectedShapeId,
    selectedShapeIds,
    fillColor, 
    setFillColor, 
    fillOpacity, 
    setFillOpacity,
    borderThickness,
    setBorderThickness,
    borderStyle,
    setBorderStyle,
    fontSize,
    setFontSize,
    fontWeight,
    setFontWeight,
    fontStyle,
    setFontStyle,
    textDecoration,
    setTextDecoration,
    fontFamily,
    setFontFamily,
    defaultLayerPosition,
    setDefaultLayerPosition,
    updateShape,
    creatingArrow,
    sendToFront,
    sendToBack
  } = useCanvas()
  
  const { zoom, cursorPosition } = useCanvasViewport()

  // Local state for editing - hue value 0-360
  const [localHue, setLocalHue] = useState(0)
  const [localOpacity, setLocalOpacity] = useState(fillOpacity)
  const [localThickness, setLocalThickness] = useState(borderThickness)
  const [localBorderStyle, setLocalBorderStyle] = useState(borderStyle)
  const [localFontSize, setLocalFontSize] = useState(fontSize)
  const [localFontWeight, setLocalFontWeight] = useState(fontWeight)
  const [localFontStyle, setLocalFontStyle] = useState(fontStyle)
  const [localTextDecoration, setLocalTextDecoration] = useState(textDecoration)
  const [localFontFamily, setLocalFontFamily] = useState(fontFamily)

  // Get the selected shape
  const selectedShape = selectedShapeId ? shapes.find(s => s.id === selectedShapeId) : null
  
  // Check if multiple shapes are selected
  const isMultiSelect = selectedShapeIds.length > 0

  // Parse rgba color and extract components
  const parseRgbaColor = (colorSource) => {
    const rgbaMatch = colorSource.match(/rgba?\((\d+),\s*(\d+),\s*(\d+),?\s*([\d.]+)?\)/)
    if (rgbaMatch) {
      const r = parseInt(rgbaMatch[1])
      const g = parseInt(rgbaMatch[2])
      const b = parseInt(rgbaMatch[3])
      const a = rgbaMatch[4] ? parseFloat(rgbaMatch[4]) : 1
      
      const hex = '#' + [r, g, b].map(x => {
        const hexValue = x.toString(16)
        return hexValue.length === 1 ? '0' + hexValue : hexValue
      }).join('')
      
      return { hex, opacity: a }
    }
    return null
  }

  // Update local state when selection changes or global defaults change
  useEffect(() => {
    if (selectedShape) {
      // For arrows, use borderColor; for other shapes, use fillColor
      const colorSource = selectedShape.type === 'arrow' 
        ? (selectedShape.borderColor || 'rgba(128, 128, 128, 0.5)')
        : (selectedShape.fillColor || 'rgba(128, 128, 128, 0.5)')
      
      const parsed = parseRgbaColor(colorSource)
      if (parsed) {
        setLocalHue(hexToHue(parsed.hex))
        
        // Enforce minimum 10% opacity for arrows and text
        const isArrowOrText = selectedShape.type === 'arrow' || selectedShape.type === 'text'
        setLocalOpacity(isArrowOrText && parsed.opacity < 0.1 ? 0.1 : parsed.opacity)
      }
      
      // Only update border properties for shapes that have borders (not text)
      if (selectedShape.type !== 'text') {
        setLocalThickness(selectedShape.strokeWidth || 2)
        setLocalBorderStyle(selectedShape.borderStyle || 'solid')
      } else {
        setLocalThickness(borderThickness)
        setLocalBorderStyle(borderStyle)
      }
      
      // Text-specific properties
      if (selectedShape.type === 'text') {
        setLocalFontSize(selectedShape.fontSize || fontSize)
        setLocalFontWeight(selectedShape.fontWeight || fontWeight)
        setLocalFontStyle(selectedShape.fontStyle || fontStyle)
        setLocalTextDecoration(selectedShape.textDecoration || textDecoration)
        setLocalFontFamily(selectedShape.fontFamily || fontFamily)
      }
    } else {
      // No selection - use global defaults
      setLocalHue(hexToHue(fillColor))
      setLocalOpacity(creatingArrow && fillOpacity < 0.1 ? 0.1 : fillOpacity)
      setLocalThickness(borderThickness)
      setLocalBorderStyle(borderStyle)
      setLocalFontSize(fontSize)
      setLocalFontWeight(fontWeight)
      setLocalFontStyle(fontStyle)
      setLocalTextDecoration(textDecoration)
      setLocalFontFamily(fontFamily)
    }
  }, [selectedShape, selectedShapeId, fillColor, fillOpacity, borderThickness, borderStyle, 
      fontSize, fontWeight, fontStyle, textDecoration, fontFamily, creatingArrow])

  // Automatically adjust opacity to 10% minimum when arrow creation mode is activated
  useEffect(() => {
    if (creatingArrow && localOpacity < 0.1) {
      setLocalOpacity(0.1)
    } else if (!creatingArrow && !selectedShape) {
      setLocalOpacity(fillOpacity)
    }
  }, [creatingArrow, fillOpacity, selectedShape])

  // Handle hue change
  const handleHueChange = (newHue) => {
    setLocalHue(newHue)
    
    const rgba = hueToRgba(newHue, localOpacity)
    const hex = rgbaToHex(rgba)
    
    if (selectedShape) {
      // Update the selected shape only - do NOT update global defaults
      const updates = { fillColor: rgba }
      
      // For arrows, also update borderColor since that's what's visually displayed
      if (selectedShape.type === 'arrow') {
        updates.borderColor = rgba
      }
      
      updateShape(selectedShapeId, updates)
    } else {
      // Only update global default when NOT editing a shape (creating new shapes)
      setFillColor(hex)
    }
  }

  // Handle opacity change
  const handleOpacityChange = (newOpacity) => {
    // Prevent arrows and text from having opacity below 10%
    const isArrowOrText = (selectedShape && (selectedShape.type === 'arrow' || selectedShape.type === 'text')) || creatingArrow
    if (isArrowOrText && newOpacity < 0.1) {
      newOpacity = 0.1
    }
    
    setLocalOpacity(newOpacity)
    
    const rgba = hueToRgba(localHue, newOpacity)
    
    if (selectedShape) {
      // Update the selected shape only - do NOT update global defaults
      const updates = { fillColor: rgba }
      
      // For arrows, also update borderColor since that's what's visually displayed
      if (selectedShape.type === 'arrow') {
        updates.borderColor = rgba
      }
      
      updateShape(selectedShapeId, updates)
    } else {
      // Only update global default when NOT editing a shape (creating new shapes)
      setFillOpacity(newOpacity)
    }
  }

  // Handle thickness change
  const handleThicknessChange = (newThickness) => {
    setLocalThickness(newThickness)
    
    if (selectedShape) {
      // Update the selected shape only
      updateShape(selectedShapeId, {
        strokeWidth: newThickness
      })
    } else {
      // Only update global default when no shape is selected
      setBorderThickness(newThickness)
    }
  }

  // Handle border style change
  const handleBorderStyleChange = (newStyle) => {
    setLocalBorderStyle(newStyle)
    
    if (selectedShape) {
      // Update the selected shape only
      updateShape(selectedShapeId, {
        borderStyle: newStyle
      })
    } else {
      // Only update global default when no shape is selected
      setBorderStyle(newStyle)
    }
  }

  // Handle font size change
  const handleFontSizeChange = (size) => {
    setLocalFontSize(size)
    
    if (selectedShape && selectedShape.type === 'text') {
      // Update the selected shape only
      updateShape(selectedShapeId, { fontSize: size })
    } else {
      // Only update global default when no shape is selected
      setFontSize(size)
    }
  }

  // Handle font weight change (bold toggle)
  const handleFontWeightChange = () => {
    const newWeight = localFontWeight === 'normal' ? 'bold' : 'normal'
    setLocalFontWeight(newWeight)
    
    if (selectedShape && selectedShape.type === 'text') {
      // Update the selected shape only
      updateShape(selectedShapeId, { fontWeight: newWeight })
    } else {
      // Only update global default when no shape is selected
      setFontWeight(newWeight)
    }
  }

  // Handle font style change (italic toggle)
  const handleFontStyleChange = () => {
    const newStyle = localFontStyle === 'normal' ? 'italic' : 'normal'
    setLocalFontStyle(newStyle)
    
    if (selectedShape && selectedShape.type === 'text') {
      // Update the selected shape only
      updateShape(selectedShapeId, { fontStyle: newStyle })
    } else {
      // Only update global default when no shape is selected
      setFontStyle(newStyle)
    }
  }

  // Handle text decoration change (underline toggle)
  const handleTextDecorationChange = () => {
    const newDecoration = localTextDecoration === 'none' ? 'underline' : 'none'
    setLocalTextDecoration(newDecoration)
    
    if (selectedShape && selectedShape.type === 'text') {
      // Update the selected shape only
      updateShape(selectedShapeId, { textDecoration: newDecoration })
    } else {
      // Only update global default when no shape is selected
      setTextDecoration(newDecoration)
    }
  }

  // Handle font family change
  const handleFontFamilyChange = (e) => {
    const family = e.target.value
    setLocalFontFamily(family)
    
    if (selectedShape && selectedShape.type === 'text') {
      // Update the selected shape only
      updateShape(selectedShapeId, { fontFamily: family })
    } else {
      // Only update global default when no shape is selected
      setFontFamily(family)
    }
  }

  return (
    <div className={`customization-panel ${isMultiSelect ? 'multi-select-mode' : ''}`}>
      <div className="viewport-info">
        <div className="viewport-info-item">
          <span className="viewport-label">Zoom:</span>
          <span className="viewport-value">{Math.round(zoom * 100)}%</span>
        </div>
        <div className="viewport-info-item">
          <span className="viewport-label">Cursor:</span>
          <span className="viewport-value">({cursorPosition.x}, {cursorPosition.y})</span>
        </div>
      </div>
      
      <div className="control-group">
        <label htmlFor="color-slider">
          Color
        </label>
        <div className="hue-slider-container">
          <input
            id="color-slider"
            type="range"
            min="0"
            max="330"
            step="1"
            value={localHue}
            onChange={(e) => handleHueChange(parseInt(e.target.value))}
            className="hue-slider"
            disabled={isMultiSelect}
            style={{
              background: `linear-gradient(to right,
                rgba(0, 0, 0, ${localOpacity}) 0%,
                rgba(0, 0, 0, ${localOpacity}) 1.2%,
                hsla(0, 100%, 50%, ${localOpacity}) 2%,
                hsla(30, 100%, 50%, ${localOpacity}) 10%,
                hsla(60, 100%, 50%, ${localOpacity}) 19%,
                hsla(90, 100%, 50%, ${localOpacity}) 28%,
                hsla(120, 100%, 50%, ${localOpacity}) 37%,
                hsla(150, 100%, 50%, ${localOpacity}) 46%,
                hsla(180, 100%, 50%, ${localOpacity}) 55%,
                hsla(210, 100%, 50%, ${localOpacity}) 64%,
                hsla(240, 100%, 50%, ${localOpacity}) 73%,
                hsla(270, 100%, 50%, ${localOpacity}) 82%,
                hsla(300, 100%, 50%, ${localOpacity}) 91%,
                hsla(330, 100%, 50%, ${localOpacity}) 100%
              )`
            }}
          />
          <div 
            className="hue-thumb-indicator"
            style={{
              left: `${(localHue / 330) * 100}%`,
              backgroundColor: hueToRgba(localHue, localOpacity)
            }}
          />
        </div>
      </div>

      <div className="control-group">
        <label htmlFor="fill-opacity">
          Opacity: {Math.round(localOpacity * 100)}%
        </label>
        <input
          id="fill-opacity"
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={localOpacity}
          onChange={(e) => handleOpacityChange(parseFloat(e.target.value))}
          disabled={isMultiSelect}
        />
      </div>

      <div className="control-group">
        <label htmlFor="border-thickness">
          Border: {localThickness}px
        </label>
        <input
          id="border-thickness"
          type="range"
          min="1"
          max="10"
          step="1"
          value={localThickness}
          onChange={(e) => handleThicknessChange(parseInt(e.target.value))}
          disabled={isMultiSelect}
        />
      </div>

      <div className="control-group">
        <label>Border Style</label>
        <div className="border-style-buttons">
          <button
            className={`border-style-btn ${localBorderStyle === 'solid' ? 'active' : ''}`}
            onClick={() => handleBorderStyleChange('solid')}
            title="Solid"
            disabled={isMultiSelect}
          >
            <div className="border-preview solid-line"></div>
          </button>
          <button
            className={`border-style-btn ${localBorderStyle === 'dashed' ? 'active' : ''}`}
            onClick={() => handleBorderStyleChange('dashed')}
            title="Dashed"
            disabled={isMultiSelect}
          >
            <div className="border-preview dashed-line"></div>
          </button>
          <button
            className={`border-style-btn ${localBorderStyle === 'dotted' ? 'active' : ''}`}
            onClick={() => handleBorderStyleChange('dotted')}
            title="Dotted"
            disabled={isMultiSelect}
          >
            <div className="border-preview dotted-line"></div>
          </button>
        </div>
      </div>

      <div className="control-group">
        <label>Font Size</label>
        <div className="font-size-buttons">
          <button
            className={`font-size-btn ${localFontSize === 'small' ? 'active' : ''}`}
            onClick={() => handleFontSizeChange('small')}
            disabled={isMultiSelect}
          >
            Small
          </button>
          <button
            className={`font-size-btn ${localFontSize === 'medium' ? 'active' : ''}`}
            onClick={() => handleFontSizeChange('medium')}
            disabled={isMultiSelect}
          >
            Medium
          </button>
          <button
            className={`font-size-btn ${localFontSize === 'large' ? 'active' : ''}`}
            onClick={() => handleFontSizeChange('large')}
            disabled={isMultiSelect}
          >
            Large
          </button>
        </div>
      </div>

      <div className="control-group">
        <label>Text Style</label>
        <div className="text-style-buttons">
          <button
            className={`text-style-btn ${localFontWeight === 'bold' ? 'active' : ''}`}
            onClick={handleFontWeightChange}
            title="Bold"
            disabled={isMultiSelect}
          >
            <strong>B</strong>
          </button>
          <button
            className={`text-style-btn ${localFontStyle === 'italic' ? 'active' : ''}`}
            onClick={handleFontStyleChange}
            title="Italic"
            disabled={isMultiSelect}
          >
            <em>I</em>
          </button>
          <button
            className={`text-style-btn ${localTextDecoration === 'underline' ? 'active' : ''}`}
            onClick={handleTextDecorationChange}
            title="Underline"
            disabled={isMultiSelect}
          >
            <u>U</u>
          </button>
        </div>
      </div>

      <div className="control-group">
        <label htmlFor="font-family">Font Family</label>
        <select
          id="font-family"
          value={localFontFamily}
          onChange={handleFontFamilyChange}
          className="font-family-select"
          disabled={isMultiSelect}
        >
          <option value="Arial">Arial</option>
          <option value="Times New Roman">Times New Roman</option>
          <option value="Courier New">Courier New</option>
          <option value="Georgia">Georgia</option>
          <option value="Verdana">Verdana</option>
          <option value="Comic Sans MS">Comic Sans MS</option>
          <option value="Trebuchet MS">Trebuchet MS</option>
          <option value="Impact">Impact</option>
          <option value="Helvetica">Helvetica</option>
        </select>
      </div>

      {/* Layer Controls - always visible */}
      <div className="control-group">
        <label>Layer</label>
        <div className="layer-buttons">
          <button
            className={`layer-btn ${defaultLayerPosition === 'front' ? 'active' : ''}`}
            onClick={() => {
              if (selectedShapeId) {
                // If shape is selected, just send it to front without changing default
                sendToFront(selectedShapeId);
              } else {
                // If no shape selected, change default layer position
                setDefaultLayerPosition('front');
              }
            }}
            title={selectedShapeId ? "Send selected to front" : "Set default: new shapes will appear in front"}
            disabled={isMultiSelect}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5l0 14M5 12l7-7 7 7" />
            </svg>
            <span>To Front</span>
          </button>
          <button
            className={`layer-btn ${defaultLayerPosition === 'back' ? 'active' : ''}`}
            onClick={() => {
              if (selectedShapeId) {
                // If shape is selected, just send it to back without changing default
                sendToBack(selectedShapeId);
              } else {
                // If no shape selected, change default layer position
                setDefaultLayerPosition('back');
              }
            }}
            title={selectedShapeId ? "Send selected to back" : "Set default: new shapes will appear in back"}
            disabled={isMultiSelect}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 19l0-14M5 12l7 7 7-7" />
            </svg>
            <span>To Back</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default CustomizationPanel
