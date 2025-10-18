import React, { useEffect, useState } from 'react'
import { useCanvas } from '../context/CanvasContext'
import '../styles/CustomizationPanel.css'

function CustomizationPanel() {
  const { 
    shapes,
    selectedShapeId,
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

  // Local state for editing - hue value 0-360
  // 0: black
  // 1-360: color spectrum
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

  // Convert hex to hue
  const hexToHue = (hex) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255
    const g = parseInt(hex.slice(3, 5), 16) / 255
    const b = parseInt(hex.slice(5, 7), 16) / 255
    
    // Check if it's black (all values very close to 0)
    if (r < 0.1 && g < 0.1 && b < 0.1) {
      return 0
    }
    
    // Convert to hue
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    const delta = max - min
    
    if (delta === 0) return 0
    
    let hue
    if (max === r) {
      hue = ((g - b) / delta) % 6
    } else if (max === g) {
      hue = (b - r) / delta + 2
    } else {
      hue = (r - g) / delta + 4
    }
    
    hue = Math.round(hue * 60)
    if (hue < 0) hue += 360
    
    return hue
  }

  // Update local state when selection changes or global defaults change
  useEffect(() => {
    if (selectedShape) {
      // For arrows, use borderColor; for other shapes, use fillColor
      const colorSource = selectedShape.type === 'arrow' 
        ? (selectedShape.borderColor || 'rgba(128, 128, 128, 0.5)')
        : (selectedShape.fillColor || 'rgba(128, 128, 128, 0.5)')
      
      // Parse rgba to extract rgb and opacity
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
        
        setLocalHue(hexToHue(hex))
        
        // Enforce minimum 10% opacity for arrows and text
        const isArrowOrText = selectedShape.type === 'arrow' || selectedShape.type === 'text'
        if (isArrowOrText && a < 0.1) {
          setLocalOpacity(0.1)
        } else if (creatingArrow && a < 0.1) {
          setLocalOpacity(0.1)
        } else {
          setLocalOpacity(a)
        }
      }
      
      // Only update border properties for shapes that have borders (not text)
      if (selectedShape.type !== 'text') {
        setLocalThickness(selectedShape.strokeWidth || 2)
        setLocalBorderStyle(selectedShape.borderStyle || 'solid')
      } else {
        // For text, keep the global defaults in the UI
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
      
      // If in arrow creation mode and opacity is below 10%, enforce minimum
      if (creatingArrow && fillOpacity < 0.1) {
        setLocalOpacity(0.1)
      } else {
        setLocalOpacity(fillOpacity)
      }
      
      setLocalThickness(borderThickness)
      setLocalBorderStyle(borderStyle)
      setLocalFontSize(fontSize)
      setLocalFontWeight(fontWeight)
      setLocalFontStyle(fontStyle)
      setLocalTextDecoration(textDecoration)
      setLocalFontFamily(fontFamily)
    }
  }, [selectedShape, selectedShapeId, fillColor, fillOpacity, borderThickness, borderStyle, fontSize, fontWeight, fontStyle, textDecoration, fontFamily, creatingArrow])

  // Automatically adjust opacity to 10% minimum when arrow creation mode is activated
  // Restore original opacity when arrow mode is deactivated
  useEffect(() => {
    if (creatingArrow && localOpacity < 0.1) {
      // Just update local display to 10%, don't change global default
      setLocalOpacity(0.1)
    } else if (!creatingArrow && !selectedShape) {
      // When switching away from arrow mode, restore from global default
      setLocalOpacity(fillOpacity)
    }
  }, [creatingArrow, fillOpacity, selectedShape])

  // Convert hue to rgba
  const hueToRgba = (hue, opacity) => {
    if (hue === 0) {
      // Black
      return `rgba(0, 0, 0, ${opacity})`
    }
    
    // Convert HSL to RGB (full saturation, 50% lightness)
    const s = 1
    const l = 0.5
    const c = (1 - Math.abs(2 * l - 1)) * s
    const x = c * (1 - Math.abs((hue / 60) % 2 - 1))
    const m = l - c / 2
    
    let r, g, b
    if (hue < 60) {
      [r, g, b] = [c, x, 0]
    } else if (hue < 120) {
      [r, g, b] = [x, c, 0]
    } else if (hue < 180) {
      [r, g, b] = [0, c, x]
    } else if (hue < 240) {
      [r, g, b] = [0, x, c]
    } else if (hue < 300) {
      [r, g, b] = [x, 0, c]
    } else {
      [r, g, b] = [c, 0, x]
    }
    
    r = Math.round((r + m) * 255)
    g = Math.round((g + m) * 255)
    b = Math.round((b + m) * 255)
    
    return `rgba(${r}, ${g}, ${b}, ${opacity})`
  }

  // Handle hue change
  const handleHueChange = (newHue) => {
    setLocalHue(newHue)
    
    const rgba = hueToRgba(newHue, localOpacity)
    
    // Convert to hex for global storage
    const [r, g, b] = rgba.match(/\d+/g).map(Number)
    const hex = '#' + [r, g, b].map(x => {
      const hexValue = x.toString(16)
      return hexValue.length === 1 ? '0' + hexValue : hexValue
    }).join('')
    
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
    <div className="customization-panel">
      <h3>Customization Panel</h3>
      
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
        />
      </div>

      <div className="control-group">
        <label>Border Style</label>
        <div className="border-style-buttons">
          <button
            className={`border-style-btn ${localBorderStyle === 'solid' ? 'active' : ''}`}
            onClick={() => handleBorderStyleChange('solid')}
            title="Solid"
          >
            <div className="border-preview solid-line"></div>
          </button>
          <button
            className={`border-style-btn ${localBorderStyle === 'dashed' ? 'active' : ''}`}
            onClick={() => handleBorderStyleChange('dashed')}
            title="Dashed"
          >
            <div className="border-preview dashed-line"></div>
          </button>
          <button
            className={`border-style-btn ${localBorderStyle === 'dotted' ? 'active' : ''}`}
            onClick={() => handleBorderStyleChange('dotted')}
            title="Dotted"
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
          >
            Small
          </button>
          <button
            className={`font-size-btn ${localFontSize === 'medium' ? 'active' : ''}`}
            onClick={() => handleFontSizeChange('medium')}
          >
            Medium
          </button>
          <button
            className={`font-size-btn ${localFontSize === 'large' ? 'active' : ''}`}
            onClick={() => handleFontSizeChange('large')}
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
          >
            <strong>B</strong>
          </button>
          <button
            className={`text-style-btn ${localFontStyle === 'italic' ? 'active' : ''}`}
            onClick={handleFontStyleChange}
            title="Italic"
          >
            <em>I</em>
          </button>
          <button
            className={`text-style-btn ${localTextDecoration === 'underline' ? 'active' : ''}`}
            onClick={handleTextDecorationChange}
            title="Underline"
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
