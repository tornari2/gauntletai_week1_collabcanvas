/**
 * Shape Intelligence Utilities
 * Handles natural language parsing for colors, positions, sizes, and shapes
 */

// Common color names to hex mapping
const COLOR_MAP = {
  // Basic colors
  'red': '#FF0000',
  'green': '#00FF00',
  'blue': '#0000FF',
  'yellow': '#FFFF00',
  'orange': '#FFA500',
  'purple': '#800080',
  'pink': '#FFC0CB',
  'brown': '#A52A2A',
  'black': '#000000',
  'white': '#FFFFFF',
  'gray': '#808080',
  'grey': '#808080',
  
  // Extended colors
  'lightblue': '#ADD8E6',
  'darkblue': '#00008B',
  'lightgreen': '#90EE90',
  'darkgreen': '#006400',
  'lightred': '#FFB6C1',
  'darkred': '#8B0000',
  'cyan': '#00FFFF',
  'magenta': '#FF00FF',
  'lime': '#00FF00',
  'navy': '#000080',
  'teal': '#008080',
  'maroon': '#800000',
  'olive': '#808000',
  'silver': '#C0C0C0',
  'gold': '#FFD700',
  'violet': '#EE82EE',
  'indigo': '#4B0082',
  'turquoise': '#40E0D0',
  'coral': '#FF7F50',
  'salmon': '#FA8072',
  'khaki': '#F0E68C',
  'crimson': '#DC143C',
  'lavender': '#E6E6FA',
  'beige': '#F5F5DC',
  'tan': '#D2B48C',
  'skyblue': '#87CEEB',
};

/**
 * Convert color name to hex code
 * @param {string} colorName - Color name (e.g., "red", "blue")
 * @returns {string} - Hex color code with opacity
 */
export function parseColor(colorName) {
  if (!colorName) return 'rgba(128, 128, 128, 0.5)'; // Default gray
  
  // If already a hex color
  if (colorName.startsWith('#')) {
    // Convert hex to rgba with default opacity
    return hexToRgba(colorName, 0.5);
  }
  
  // If already rgba
  if (colorName.startsWith('rgba')) {
    return colorName;
  }
  
  const normalized = colorName.toLowerCase().trim();
  const hex = COLOR_MAP[normalized] || '#808080'; // Default to gray if not found
  
  return hexToRgba(hex, 0.5);
}

/**
 * Convert hex to rgba
 * @param {string} hex - Hex color code
 * @param {number} opacity - Opacity (0-1)
 * @returns {string} - RGBA color string
 */
function hexToRgba(hex, opacity = 0.5) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

/**
 * Parse position from natural language or coordinates
 * @param {string|number} x - X position or position name
 * @param {string|number} y - Y position
 * @param {object} canvasSize - Canvas dimensions {width, height}
 * @returns {object} - {x, y} coordinates
 */
export function parsePosition(x, y, canvasSize = { width: 1200, height: 800 }) {
  // If numeric coordinates provided
  if (typeof x === 'number' && typeof y === 'number') {
    return { x, y };
  }
  
  // Parse position names
  const positionStr = typeof x === 'string' ? x.toLowerCase() : '';
  
  const positions = {
    'center': { x: canvasSize.width / 2, y: canvasSize.height / 2 },
    'middle': { x: canvasSize.width / 2, y: canvasSize.height / 2 },
    'top-left': { x: 100, y: 100 },
    'top-right': { x: canvasSize.width - 200, y: 100 },
    'bottom-left': { x: 100, y: canvasSize.height - 200 },
    'bottom-right': { x: canvasSize.width - 200, y: canvasSize.height - 200 },
    'top': { x: canvasSize.width / 2, y: 100 },
    'bottom': { x: canvasSize.width / 2, y: canvasSize.height - 200 },
    'left': { x: 100, y: canvasSize.height / 2 },
    'right': { x: canvasSize.width - 200, y: canvasSize.height / 2 },
  };
  
  return positions[positionStr] || { x: 200, y: 200 }; // Default position
}

/**
 * Parse size from natural language or numeric values
 * @param {string|number} size - Size descriptor or numeric value
 * @returns {object} - {width, height} or {radius} depending on shape
 */
export function parseSize(size, shapeType = 'rectangle') {
  // If numeric size provided
  if (typeof size === 'number') {
    if (shapeType === 'circle') {
      return { radiusX: size, radiusY: size };
    }
    return { width: size, height: size };
  }
  
  // Parse size names
  const sizeStr = typeof size === 'string' ? size.toLowerCase() : 'medium';
  
  const sizeMappings = {
    'tiny': 30,
    'small': 50,
    'medium': 100,
    'large': 150,
    'huge': 200,
    'giant': 300,
  };
  
  const baseSize = sizeMappings[sizeStr] || 100;
  
  if (shapeType === 'circle') {
    return { radiusX: baseSize, radiusY: baseSize };
  }
  
  return { width: baseSize, height: baseSize };
}

/**
 * Parse dimensions from natural language
 * @param {string|number} width - Width descriptor or value
 * @param {string|number} height - Height descriptor or value
 * @returns {object} - {width, height}
 */
export function parseDimensions(width, height) {
  const w = typeof width === 'number' ? width : 100;
  const h = typeof height === 'number' ? height : 100;
  return { width: w, height: h };
}

/**
 * Helper function to extract RGB values from rgba or hex color
 * @param {string} color - Color string (rgba or hex)
 * @returns {object|null} - {r, g, b} values or null
 */
function extractRGB(color) {
  if (!color) return null;
  
  // Match rgba format: rgba(r, g, b, a)
  const rgbaMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (rgbaMatch) {
    return {
      r: parseInt(rgbaMatch[1]),
      g: parseInt(rgbaMatch[2]),
      b: parseInt(rgbaMatch[3])
    };
  }
  
  // Match hex format: #RRGGBB
  if (color.startsWith('#')) {
    return {
      r: parseInt(color.slice(1, 3), 16),
      g: parseInt(color.slice(3, 5), 16),
      b: parseInt(color.slice(5, 7), 16)
    };
  }
  
  return null;
}

/**
 * Check if two colors are similar (within tolerance)
 * @param {object} rgb1 - {r, g, b}
 * @param {object} rgb2 - {r, g, b}
 * @param {number} tolerance - Color difference tolerance (0-255)
 * @returns {boolean}
 */
function colorsAreSimilar(rgb1, rgb2, tolerance = 50) {
  if (!rgb1 || !rgb2) return false;
  
  const diff = Math.abs(rgb1.r - rgb2.r) + 
               Math.abs(rgb1.g - rgb2.g) + 
               Math.abs(rgb1.b - rgb2.b);
  
  return diff <= tolerance;
}

/**
 * Find shapes on canvas matching a description
 * @param {Array} shapes - Array of shape objects
 * @param {string} description - Natural language description
 * @returns {Array} - Matching shapes
 */
export function findShapesByDescription(shapes, description) {
  // Safety check: if description is undefined or empty, return empty array
  if (!description || typeof description !== 'string') {
    return [];
  }
  
  const desc = description.toLowerCase();
  
  // Handle "all" or "everything" - but NOT if it's part of a compound description
  if ((desc === 'all' || desc === 'everything' || desc === 'all shapes' || desc === 'everything on the canvas') && !desc.includes(' except') && !desc.includes(' but')) {
    return shapes;
  }
  
  // Handle "selected"
  if (desc === 'selected' || desc === 'selected shape' || desc === 'selected shapes') {
    // This will be handled by the calling context
    return [];
  }
  
  // Extract color mentions
  const colorMatches = Object.keys(COLOR_MAP).filter(color => desc.includes(color));
  
  // Extract shape type mentions
  const typeMatches = ['rectangle', 'circle', 'diamond', 'text', 'arrow'].filter(type => desc.includes(type));
  
  // If no specific filters found (color or type), and it's a vague description like "form" or "layout",
  // return empty to force the AI to be more specific
  if (colorMatches.length === 0 && typeMatches.length === 0) {
    // Check if it's a vague description
    const vagueDescriptions = ['form', 'layout', 'group', 'template', 'thing', 'item', 'object'];
    if (vagueDescriptions.some(vague => desc.includes(vague)) && desc.length < 50) {
      // Return empty - need more specific description
      return [];
    }
  }
  
  let matchingShapes = [...shapes];
  
  // Filter by color
  if (colorMatches.length > 0) {
    matchingShapes = matchingShapes.filter(shape => {
      const shapeColor = shape.fillColor || shape.borderColor;
      const shapeRGB = extractRGB(shapeColor);
      
      // Check if shape color matches any of the target colors
      return colorMatches.some(colorName => {
        const targetHex = COLOR_MAP[colorName];
        const targetRGB = extractRGB(targetHex);
        return colorsAreSimilar(shapeRGB, targetRGB, 50);
      });
    });
  }
  
  // Filter by type
  if (typeMatches.length > 0) {
    matchingShapes = matchingShapes.filter(shape => typeMatches.includes(shape.type));
  }
  
  return matchingShapes;
}

/**
 * Calculate grid positions for shapes
 * @param {number} rows - Number of rows
 * @param {number} cols - Number of columns
 * @param {number} spacing - Space between shapes
 * @param {object} startPos - Starting position {x, y}
 * @param {object} shapeSize - Size of each shape {width, height}
 * @returns {Array} - Array of {x, y} positions
 */
export function calculateGridPositions(rows, cols, spacing = 20, startPos = { x: 100, y: 100 }, shapeSize = { width: 100, height: 100 }) {
  const positions = [];
  
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      positions.push({
        x: startPos.x + col * (shapeSize.width + spacing),
        y: startPos.y + row * (shapeSize.height + spacing),
      });
    }
  }
  
  return positions;
}

/**
 * Calculate evenly spaced positions
 * @param {Array} shapes - Shapes to space
 * @param {string} direction - 'horizontal' or 'vertical'
 * @param {number} totalSpace - Total space available
 * @returns {Array} - Array of positions
 */
export function calculateEvenSpacing(shapes, direction = 'horizontal', totalSpace = 800) {
  if (shapes.length === 0) return [];
  
  const spacing = totalSpace / (shapes.length + 1);
  
  return shapes.map((shape, index) => {
    if (direction === 'horizontal') {
      return {
        ...shape,
        x: spacing * (index + 1),
      };
    } else {
      return {
        ...shape,
        y: spacing * (index + 1),
      };
    }
  });
}

/**
 * Parse rotation angle from natural language
 * @param {string|number} rotation - Rotation descriptor or angle
 * @returns {number} - Rotation angle in degrees
 */
export function parseRotation(rotation) {
  if (typeof rotation === 'number') return rotation;
  
  const rotationStr = String(rotation).toLowerCase();
  
  // Extract numeric value if present
  const numMatch = rotationStr.match(/(\d+)/);
  if (numMatch) {
    return parseInt(numMatch[1]);
  }
  
  // Common rotation names
  const rotations = {
    'quarter': 90,
    'half': 180,
    'full': 360,
  };
  
  for (const [key, value] of Object.entries(rotations)) {
    if (rotationStr.includes(key)) {
      return value;
    }
  }
  
  return 0;
}

/**
 * Get default properties for a shape type
 * @param {string} shapeType - Type of shape
 * @returns {object} - Default properties
 */
export function getDefaultShapeProperties(shapeType) {
  const defaults = {
    rectangle: {
      width: 100,
      height: 100,
      fillColor: 'rgba(128, 128, 128, 0.5)',
      borderColor: '#000000',
      strokeWidth: 2,
      rotation: 0,
    },
    circle: {
      radiusX: 50,
      radiusY: 50,
      fillColor: 'rgba(128, 128, 128, 0.5)',
      borderColor: '#000000',
      strokeWidth: 2,
      rotation: 0,
    },
    diamond: {
      width: 100,
      height: 100,
      fillColor: 'rgba(128, 128, 128, 0.5)',
      borderColor: '#000000',
      strokeWidth: 2,
      rotation: 0,
    },
    text: {
      text: 'Text',
      fontSize: 24,
      fontWeight: 'normal',
      fontStyle: 'normal',
      fontFamily: 'Arial',
      fillColor: 'rgba(0, 0, 0, 0.8)',
      rotation: 0,
    },
    arrow: {
      points: [0, 0, 100, 100],
      fillColor: 'rgba(0, 0, 0, 0.8)',
      borderColor: 'rgba(0, 0, 0, 0.8)',
      strokeWidth: 2,
      rotation: 0,
    },
  };
  
  return defaults[shapeType] || defaults.rectangle;
}

