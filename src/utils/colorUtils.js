/**
 * Color utility functions for converting between color formats
 */

/**
 * Convert hex color to hue value (0-360)
 * Returns 0 for black, and hue value for colors
 */
export function hexToHue(hex) {
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

/**
 * Convert hue value (0-360) and opacity (0-1) to rgba string
 */
export function hueToRgba(hue, opacity) {
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

/**
 * Convert rgba string to hex color
 */
export function rgbaToHex(rgba) {
  const [r, g, b] = rgba.match(/\d+/g).map(Number)
  const hex = '#' + [r, g, b].map(x => {
    const hexValue = x.toString(16)
    return hexValue.length === 1 ? '0' + hexValue : hexValue
  }).join('')
  return hex
}

/**
 * Parse rgba string and extract opacity
 */
export function getRgbaOpacity(rgbaString) {
  const rgbaMatch = rgbaString.match(/rgba?\((\d+),\s*(\d+),\s*(\d+),?\s*([\d.]+)?\)/)
  if (rgbaMatch && rgbaMatch[4]) {
    return parseFloat(rgbaMatch[4])
  }
  return 1 // Default opacity
}

