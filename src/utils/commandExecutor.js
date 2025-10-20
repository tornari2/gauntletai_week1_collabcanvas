/**
 * Command Executor
 * Executes AI-generated commands to create and manipulate shapes
 */

import { v4 as uuidv4 } from 'uuid';
import {
  parseColor,
  parsePosition,
  parseSize,
  parseDimensions,
  calculateGridPositions,
  calculateEvenSpacing,
  parseRotation,
  getDefaultShapeProperties,
} from './shapeIntelligence';

/**
 * Execute a list of operations from AI response
 * @param {Array} operations - Array of operation objects
 * @param {object} context - Canvas context with shapes, addShape, updateShape, etc.
 * @param {object} currentUser - Current user object
 * @returns {object} - Result with success status and created/modified shapes
 */
export async function executeOperations(operations, context, currentUser) {
  const results = {
    success: true,
    createdShapes: [],
    modifiedShapes: [],
    errors: [],
  };

  for (const operation of operations) {
    try {
      const result = await executeOperation(operation, context, currentUser);
      
      if (result.success) {
        if (result.createdShapes) {
          results.createdShapes.push(...result.createdShapes);
        }
        if (result.modifiedShapes) {
          results.modifiedShapes.push(...result.modifiedShapes);
        }
      } else {
        results.errors.push(result.error);
      }
    } catch (error) {
      console.error('Error executing operation:', error);
      results.errors.push(error.message);
      results.success = false;
    }
  }

  return results;
}

/**
 * Execute a single operation
 * @param {object} operation - Operation object from AI
 * @param {object} context - Canvas context
 * @param {object} currentUser - Current user
 * @returns {object} - Result of operation
 */
async function executeOperation(operation, context, currentUser) {
  const { type } = operation;

  switch (type) {
    case 'create':
      return executeCreateOperation(operation, context, currentUser);
    
    case 'move':
      return executeMoveOperation(operation, context, currentUser);
    
    case 'resize':
      return executeResizeOperation(operation, context, currentUser);
    
    case 'rotate':
      return executeRotateOperation(operation, context, currentUser);
    
    case 'delete':
      return executeDeleteOperation(operation, context, currentUser);
    
    case 'duplicate':
      return executeDuplicateOperation(operation, context, currentUser);
    
    case 'customize':
    case 'style':
      return executeCustomizeOperation(operation, context, currentUser);
    
    case 'grid':
      return executeGridOperation(operation, context, currentUser);
    
    case 'arrange':
      return executeArrangeOperation(operation, context, currentUser);
    
    case 'complex':
      return executeComplexOperation(operation, context, currentUser);
    
    default:
      return { success: false, error: `Unknown operation type: ${type}` };
  }
}

/**
 * Execute create operation
 */
function executeCreateOperation(operation, context, currentUser) {
  const { shape: shapeType, properties } = operation;
  const { addShape, getNewShapeZIndex } = context;

  // Get default properties for shape type
  const defaults = getDefaultShapeProperties(shapeType);

  // Parse position
  const position = properties.position || properties;
  const { x, y } = parsePosition(position.x, position.y);

  // Create base shape object
  const baseShape = {
    id: uuidv4(),
    type: shapeType,
    x,
    y,
    zIndex: getNewShapeZIndex(),
    ownerId: currentUser?.uid || 'unknown',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    lastModifiedBy: currentUser?.uid || 'unknown',
  };

  // Build shape based on type
  let shape;

  switch (shapeType) {
    case 'rectangle':
    case 'diamond':
      const rectSize = properties.size 
        ? parseSize(properties.size, shapeType)
        : parseDimensions(properties.width || defaults.width, properties.height || defaults.height);
      
      shape = {
        ...baseShape,
        ...rectSize,
        fillColor: properties.fillColor ? parseColor(properties.fillColor) : defaults.fillColor,
        borderColor: properties.borderColor ? parseColor(properties.borderColor) : defaults.borderColor,
        strokeWidth: properties.strokeWidth || defaults.strokeWidth,
        borderStyle: properties.borderStyle || 'solid',
        rotation: properties.rotation ? parseRotation(properties.rotation) : defaults.rotation,
      };
      break;

    case 'circle':
      const circleSize = properties.size 
        ? parseSize(properties.size, 'circle')
        : { radiusX: properties.radius || properties.radiusX || defaults.radiusX, 
            radiusY: properties.radius || properties.radiusY || defaults.radiusY };
      
      shape = {
        ...baseShape,
        ...circleSize,
        fillColor: properties.fillColor ? parseColor(properties.fillColor) : defaults.fillColor,
        borderColor: properties.borderColor ? parseColor(properties.borderColor) : defaults.borderColor,
        strokeWidth: properties.strokeWidth || defaults.strokeWidth,
        borderStyle: properties.borderStyle || 'solid',
        rotation: properties.rotation ? parseRotation(properties.rotation) : defaults.rotation,
      };
      break;

    case 'text':
      const textFontSize = properties.fontSize || defaults.fontSize;
      console.log('[CREATE TEXT] fontSize:', textFontSize, 'from properties:', properties.fontSize, 'defaults:', defaults.fontSize);
      shape = {
        ...baseShape,
        text: properties.text || defaults.text,
        fontSize: textFontSize,
        fontWeight: properties.fontWeight || defaults.fontWeight,
        fontStyle: properties.fontStyle || defaults.fontStyle,
        fontFamily: properties.fontFamily || defaults.fontFamily,
        textDecoration: properties.textDecoration || 'none',
        fillColor: properties.fillColor ? parseColor(properties.fillColor) : defaults.fillColor,
        rotation: properties.rotation ? parseRotation(properties.rotation) : defaults.rotation,
        scaleX: 1,
        scaleY: 1,
      };
      console.log('[CREATE TEXT] Final shape:', shape);
      break;

    case 'arrow':
      // Parse end position for arrow (if not provided, default to offset from start)
      let endX, endY;
      if (properties.endX !== undefined || properties.endY !== undefined) {
        // If endX or endY is provided, parse them as positions
        const endPosition = parsePosition(properties.endX || x, properties.endY || y);
        endX = endPosition.x;
        endY = endPosition.y;
      } else {
        // Default: arrow extends 100px down and right from start position
        endX = x + 100;
        endY = y + 100;
      }
      
      console.log('[CREATE ARROW] Start:', x, y, 'End:', endX, endY, 'Properties:', properties.endX, properties.endY);
      
      // For arrows, if a color is specified, use it for both fill and border
      // since arrows are monochromatic (line and arrowhead same color)
      let arrowColor;
      if (properties.fillColor) {
        arrowColor = parseColor(properties.fillColor);
      } else if (properties.borderColor) {
        arrowColor = parseColor(properties.borderColor);
      } else {
        arrowColor = defaults.borderColor;
      }
      
      // Arrow positioning: Group at (x, y), points relative to Group position
      // Points start at [0, 0] and end at [endX - x, endY - y]
      shape = {
        ...baseShape,
        x: x,
        y: y,
        points: [0, 0, endX - x, endY - y],
        fillColor: arrowColor,
        borderColor: arrowColor,
        strokeWidth: properties.strokeWidth || defaults.strokeWidth,
        borderStyle: properties.borderStyle || 'solid',
        rotation: 0,
      };
      console.log('[CREATE ARROW] Final position:', x, y, 'Points:', [0, 0, endX - x, endY - y], 'Color:', arrowColor);
      break;

    default:
      return { success: false, error: `Unknown shape type: ${shapeType}` };
  }

  // Add shape to canvas
  addShape(shape);

  return {
    success: true,
    createdShapes: [shape],
  };
}

/**
 * Execute move operation
 */
function executeMoveOperation(operation, context, currentUser) {
  const { position, offset } = operation;
  const { shapes, updateShape, selectedShapeId, selectedShapeIds } = context;

  // Only allow moving selected shapes - user must select first
  let targetShapes = [];
  if (selectedShapeIds && selectedShapeIds.length > 0) {
    targetShapes = shapes.filter(s => selectedShapeIds.includes(s.id));
  } else if (selectedShapeId) {
    targetShapes = shapes.filter(s => s.id === selectedShapeId);
  }

  if (targetShapes.length === 0) {
    return { success: false, error: 'Please select one or more shapes first before moving them' };
  }

  // Update all matching shapes
  const modifiedShapes = [];
  
  if (offset) {
    // Relative movement - apply the same offset to all shapes
    targetShapes.forEach(shape => {
      const updates = {
        x: (shape.x || 0) + (offset.x || 0),
        y: (shape.y || 0) + (offset.y || 0),
        updatedAt: Date.now(),
        lastModifiedBy: currentUser?.uid || 'unknown',
      };
      
      updateShape(shape.id, updates);
      modifiedShapes.push(shape.id);
    });
  } else if (position) {
    // Absolute position - move the group while maintaining relative positions
    // Calculate the centroid (center point) of all selected shapes
    const centroidX = targetShapes.reduce((sum, s) => sum + (s.x || 0), 0) / targetShapes.length;
    const centroidY = targetShapes.reduce((sum, s) => sum + (s.y || 0), 0) / targetShapes.length;
    
    // Calculate the target position
    const newPos = parsePosition(position.x, position.y);
    
    // Calculate the offset needed to move the centroid to the target position
    const deltaX = newPos.x - centroidX;
    const deltaY = newPos.y - centroidY;
    
    // Apply the offset to all shapes, maintaining their relative positions
    targetShapes.forEach(shape => {
      const updates = {
        x: (shape.x || 0) + deltaX,
        y: (shape.y || 0) + deltaY,
        updatedAt: Date.now(),
        lastModifiedBy: currentUser?.uid || 'unknown',
      };
      
      updateShape(shape.id, updates);
      modifiedShapes.push(shape.id);
    });
  } else {
    return { success: false, error: 'No position or offset specified for move operation' };
  }

  return {
    success: true,
    modifiedShapes,
  };
}

/**
 * Execute resize operation
 */
function executeResizeOperation(operation, context, currentUser) {
  const { scale, dimensions } = operation;
  const { shapes, updateShape, selectedShapeId, selectedShapeIds } = context;

  // Only allow resizing selected shapes - user must select first
  let targetShapes = [];
  if (selectedShapeIds && selectedShapeIds.length > 0) {
    targetShapes = shapes.filter(s => selectedShapeIds.includes(s.id));
  } else if (selectedShapeId) {
    targetShapes = shapes.filter(s => s.id === selectedShapeId);
  }

  if (targetShapes.length === 0) {
    return { success: false, error: 'Please select one or more shapes first before resizing them' };
  }

  // Update all matching shapes
  const modifiedShapes = [];
  targetShapes.forEach(shape => {
    const updates = {
      updatedAt: Date.now(),
      lastModifiedBy: currentUser?.uid || 'unknown',
    };

    if (scale) {
      // Scale existing dimensions
      if (shape.type === 'circle') {
        updates.radiusX = (shape.radiusX || 50) * scale;
        updates.radiusY = (shape.radiusY || 50) * scale;
      } else if (shape.type === 'rectangle' || shape.type === 'diamond') {
        updates.width = (shape.width || 100) * scale;
        updates.height = (shape.height || 100) * scale;
      } else if (shape.type === 'text') {
        updates.scaleX = (shape.scaleX || 1) * scale;
        updates.scaleY = (shape.scaleY || 1) * scale;
      } else if (shape.type === 'arrow') {
        // For arrows, scale the points
        const currentPoints = shape.points || [0, 0, 100, 100];
        const centerX = (currentPoints[0] + currentPoints[2]) / 2;
        const centerY = (currentPoints[1] + currentPoints[3]) / 2;
        updates.points = [
          centerX + (currentPoints[0] - centerX) * scale,
          centerY + (currentPoints[1] - centerY) * scale,
          centerX + (currentPoints[2] - centerX) * scale,
          centerY + (currentPoints[3] - centerY) * scale,
        ];
      }
    } else if (dimensions) {
      // Set specific dimensions
      if (shape.type === 'circle') {
        updates.radiusX = dimensions.radius || dimensions.radiusX || shape.radiusX || 50;
        updates.radiusY = dimensions.radius || dimensions.radiusY || shape.radiusY || 50;
      } else if (shape.type === 'rectangle' || shape.type === 'diamond') {
        updates.width = dimensions.width || shape.width || 100;
        updates.height = dimensions.height || shape.height || 100;
      }
    }

    updateShape(shape.id, updates);
    modifiedShapes.push(shape.id);
  });

  return {
    success: true,
    modifiedShapes,
  };
}

/**
 * Execute rotate operation
 */
function executeRotateOperation(operation, context, currentUser) {
  const { angle } = operation;
  const { shapes, updateShape, selectedShapeId, selectedShapeIds } = context;

  // Only allow rotating selected shapes - user must select first
  let targetShapes = [];
  if (selectedShapeIds && selectedShapeIds.length > 0) {
    targetShapes = shapes.filter(s => selectedShapeIds.includes(s.id));
  } else if (selectedShapeId) {
    targetShapes = shapes.filter(s => s.id === selectedShapeId);
  }

  if (targetShapes.length === 0) {
    return { success: false, error: 'Please select one or more shapes first before rotating them' };
  }

  const rotation = parseRotation(angle);
  console.log('[ROTATE] Parsed angle:', angle, '→ rotation:', rotation);

  // Update all matching shapes
  const modifiedShapes = [];
  targetShapes.forEach(shape => {
    const oldRotation = shape.rotation || 0;
    const newRotation = oldRotation + rotation;
    console.log(`[ROTATE] Shape ${shape.id}: ${oldRotation}° → ${newRotation}°`);
    
    updateShape(shape.id, {
      rotation: newRotation,
      updatedAt: Date.now(),
      lastModifiedBy: currentUser?.uid || 'unknown',
    });
    modifiedShapes.push(shape.id);
  });

  console.log(`[ROTATE] Successfully rotated ${modifiedShapes.length} shape(s)`);

  return {
    success: true,
    modifiedShapes,
  };
}

/**
 * Execute delete operation
 */
function executeDeleteOperation(operation, context, currentUser) {
  const { shapes, deleteShape, selectedShapeId, selectedShapeIds } = context;

  // Only allow deleting selected shapes - user must select first
  let targetShapes = [];
  if (selectedShapeIds && selectedShapeIds.length > 0) {
    targetShapes = shapes.filter(s => selectedShapeIds.includes(s.id));
  } else if (selectedShapeId) {
    targetShapes = shapes.filter(s => s.id === selectedShapeId);
  }

  if (targetShapes.length === 0) {
    return { success: false, error: 'Please select one or more shapes first before deleting them' };
  }

  // Delete all matching shapes
  const modifiedShapes = [];
  targetShapes.forEach(shape => {
    deleteShape(shape.id);
    modifiedShapes.push(shape.id);
  });

  return {
    success: true,
    modifiedShapes,
  };
}

/**
 * Execute duplicate operation
 */
function executeDuplicateOperation(operation, context, currentUser) {
  const { offset } = operation;
  const { shapes, addShape, getNewShapeZIndex, selectedShapeId, selectedShapeIds } = context;

  console.log('[DUPLICATE] Operation:', operation);
  console.log('[DUPLICATE] Received offset:', offset);

  // Only allow duplicating selected shapes - user must select first
  let targetShapes = [];
  if (selectedShapeIds && selectedShapeIds.length > 0) {
    targetShapes = shapes.filter(s => selectedShapeIds.includes(s.id));
  } else if (selectedShapeId) {
    targetShapes = shapes.filter(s => s.id === selectedShapeId);
  }

  if (targetShapes.length === 0) {
    return { success: false, error: 'Please select one or more shapes first before duplicating them' };
  }

  // Default offset for duplicated shapes (southeast offset - clearly visible)
  // Only use provided offset if it has valid, non-zero x and y values
  let finalOffset = { x: 80, y: 80 };
  if (offset && typeof offset.x === 'number' && typeof offset.y === 'number' && (offset.x !== 0 || offset.y !== 0)) {
    finalOffset = offset;
  }
  
  console.log('[DUPLICATE] Final offset to use:', finalOffset);
  console.log('[DUPLICATE] Target shapes:', targetShapes.map(s => ({ id: s.id, type: s.type, x: s.x, y: s.y })));

  // Duplicate all selected shapes
  const createdShapes = [];
  targetShapes.forEach(shape => {
    const newX = (shape.x || 0) + finalOffset.x;
    const newY = (shape.y || 0) + finalOffset.y;
    
    console.log(`[DUPLICATE] Shape ${shape.id}: (${shape.x}, ${shape.y}) → (${newX}, ${newY})`);
    
    // Create a copy of the shape with a new ID and position
    const duplicatedShape = {
      ...shape,
      id: uuidv4(),
      x: newX,
      y: newY,
      zIndex: getNewShapeZIndex(),
      ownerId: currentUser?.uid || 'unknown',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      lastModifiedBy: currentUser?.uid || 'unknown',
    };

    // For arrows, also offset the points (keep points the same relative to the new position)
    if (shape.type === 'arrow' && shape.points) {
      duplicatedShape.points = [
        shape.points[0],
        shape.points[1],
        shape.points[2],
        shape.points[3]
      ];
    }

    console.log('[DUPLICATE] Creating duplicated shape:', { id: duplicatedShape.id, type: duplicatedShape.type, x: duplicatedShape.x, y: duplicatedShape.y });
    
    addShape(duplicatedShape);
    createdShapes.push(duplicatedShape);
  });

  console.log(`[DUPLICATE] Successfully duplicated ${createdShapes.length} shape(s)`);

  return {
    success: true,
    createdShapes,
  };
}

/**
 * Execute customize operation - change colors and styles
 */
function executeCustomizeOperation(operation, context, currentUser) {
  const { fillColor, borderColor, strokeWidth, borderStyle, fillOpacity, borderOpacity, fontSize, fontWeight, fontStyle, textDecoration } = operation;
  const { shapes, updateShape, selectedShapeId, selectedShapeIds } = context;

  // Only allow customizing selected shapes - user must select first
  let targetShapes = [];
  if (selectedShapeIds && selectedShapeIds.length > 0) {
    targetShapes = shapes.filter(s => selectedShapeIds.includes(s.id));
  } else if (selectedShapeId) {
    targetShapes = shapes.filter(s => s.id === selectedShapeId);
  }

  if (targetShapes.length === 0) {
    return { success: false, error: 'Please select one or more shapes first before customizing them' };
  }

  // Helper to extract current opacity from rgba string
  const extractOpacity = (rgbaString) => {
    if (!rgbaString) return 1;
    const match = rgbaString.match(/rgba?\([^,]+,[^,]+,[^,]+,?\s*([\d.]+)?\)/);
    return match && match[1] ? parseFloat(match[1]) : 1;
  };

  // Helper to apply color with preserved or new opacity
  const applyColorWithOpacity = (colorInput, currentColor, newOpacity) => {
    const currentOpacity = extractOpacity(currentColor);
    const opacity = newOpacity !== undefined ? newOpacity : currentOpacity;
    
    // Parse the color (this will give us rgba with default opacity)
    const parsedColor = parseColor(colorInput);
    
    // Replace the opacity with the correct one
    return parsedColor.replace(/[\d.]+\)$/, `${opacity})`);
  };

  // Update all matching shapes
  const modifiedShapes = [];
  targetShapes.forEach(shape => {
    const updates = {
      updatedAt: Date.now(),
      lastModifiedBy: currentUser?.uid || 'unknown',
    };

    // Apply fill color changes (preserve existing opacity unless specified)
    if (fillColor !== undefined) {
      const newColor = applyColorWithOpacity(fillColor, shape.fillColor, fillOpacity);
      updates.fillColor = newColor;
      console.log(`[Customize] Changing fill color for shape ${shape.id} from ${shape.fillColor} to ${newColor}`);
    } else if (fillOpacity !== undefined) {
      // Just change opacity, keep color
      const currentOpacity = extractOpacity(shape.fillColor);
      updates.fillColor = shape.fillColor.replace(/[\d.]+\)$/, `${fillOpacity})`);
      console.log(`[Customize] Changing fill opacity for shape ${shape.id} to ${fillOpacity}`);
    }

    // Apply border color changes (preserve existing opacity unless specified)
    if (borderColor !== undefined) {
      const newColor = applyColorWithOpacity(borderColor, shape.borderColor, borderOpacity);
      updates.borderColor = newColor;
      console.log(`[Customize] Changing border color for shape ${shape.id} to ${newColor}`);
    } else if (borderOpacity !== undefined) {
      // Just change opacity, keep color
      updates.borderColor = shape.borderColor.replace(/[\d.]+\)$/, `${borderOpacity})`);
    }

    // Apply stroke width
    if (strokeWidth !== undefined) {
      updates.strokeWidth = strokeWidth;
      console.log(`[Customize] Changing stroke width for shape ${shape.id} to ${strokeWidth}`);
    }

    // Apply border style
    if (borderStyle !== undefined) {
      updates.borderStyle = borderStyle;
      console.log(`[Customize] Changing border style for shape ${shape.id} to ${borderStyle}`);
    }

    // Apply text-specific styles
    if (shape.type === 'text') {
      if (fontSize !== undefined) {
        updates.fontSize = fontSize;
      }
      if (fontWeight !== undefined) {
        updates.fontWeight = fontWeight;
      }
      if (fontStyle !== undefined) {
        updates.fontStyle = fontStyle;
      }
      if (textDecoration !== undefined) {
        updates.textDecoration = textDecoration;
      }
    }

    console.log(`[Customize] Applying updates to shape ${shape.id}:`, updates);
    updateShape(shape.id, updates);
    modifiedShapes.push(shape.id);
  });

  console.log(`[Customize] Successfully customized ${modifiedShapes.length} shape(s)`);

  return {
    success: true,
    modifiedShapes,
  };
}

/**
 * Execute grid operation - create multiple shapes in a grid layout
 */
function executeGridOperation(operation, context, currentUser) {
  const { rows, columns, shape: shapeType, spacing, startPosition, shapeProperties } = operation;
  const { addShape, getNewShapeZIndex } = context;

  // Parse shape size
  const shapeSize = shapeProperties?.size 
    ? parseSize(shapeProperties.size, shapeType)
    : parseSize('medium', shapeType);

  // Calculate grid positions
  const positions = calculateGridPositions(
    rows,
    columns,
    spacing || 20,
    startPosition ? parsePosition(startPosition.x, startPosition.y) : { x: 100, y: 100 },
    shapeType === 'circle' ? { width: shapeSize.radiusX * 2, height: shapeSize.radiusY * 2 } : shapeSize
  );

  const createdShapes = [];

  // Create shape at each position
  positions.forEach(pos => {
    const createOp = {
      type: 'create',
      shape: shapeType,
      properties: {
        ...shapeProperties,
        x: pos.x,
        y: pos.y,
        ...shapeSize,
      },
    };

    const result = executeCreateOperation(createOp, context, currentUser);
    if (result.success && result.createdShapes) {
      createdShapes.push(...result.createdShapes);
    }
  });

  return {
    success: true,
    createdShapes,
  };
}

/**
 * Execute arrange operation - space shapes evenly
 */
function executeArrangeOperation(operation, context, currentUser) {
  const { direction, spacing } = operation;
  const { shapes, updateShape, selectedShapeId, selectedShapeIds } = context;

  // Only allow arranging selected shapes - user must select first
  let targetShapes = [];
  if (selectedShapeIds && selectedShapeIds.length > 0) {
    targetShapes = shapes.filter(s => selectedShapeIds.includes(s.id));
  } else if (selectedShapeId) {
    targetShapes = shapes.filter(s => s.id === selectedShapeId);
  }

  if (targetShapes.length === 0) {
    return { success: false, error: 'Please select two or more shapes first before arranging them' };
  }

  // Calculate new positions
  const arrangedShapes = calculateEvenSpacing(targetShapes, direction, spacing || 800);

  // Update shapes with new positions
  const modifiedShapes = [];
  arrangedShapes.forEach((shape, index) => {
    const updates = {
      updatedAt: Date.now(),
      lastModifiedBy: currentUser?.uid || 'unknown',
    };

    if (direction === 'horizontal') {
      updates.x = shape.x;
    } else {
      updates.y = shape.y;
    }

    updateShape(targetShapes[index].id, updates);
    modifiedShapes.push(targetShapes[index].id);
  });

  return {
    success: true,
    modifiedShapes,
  };
}

/**
 * Execute complex operation - create composite structures
 */
function executeComplexOperation(operation, context, currentUser) {
  const { template, parameters } = operation;

  switch (template) {
    case 'login-form':
      return createLoginForm(parameters, context, currentUser);
    
    case 'navigation-bar':
      return createNavigationBar(parameters, context, currentUser);
    
    case 'card-layout':
      return createCardLayout(parameters, context, currentUser);
    
    case 'button-group':
      return createButtonGroup(parameters, context, currentUser);
    
    default:
      return { success: false, error: `Unknown template: ${template}` };
  }
}

/**
 * Create a login form layout
 */
function createLoginForm(parameters, context, currentUser) {
  const startPos = parameters?.position ? parsePosition(parameters.position.x, parameters.position.y) : { x: 400, y: 200 };
  
  const operations = [
    // Title
    {
      type: 'create',
      shape: 'text',
      properties: {
        x: startPos.x,
        y: startPos.y,
        text: 'Login',
        fontSize: 'large',
        fontWeight: 'bold',
        fillColor: 'black',
      },
    },
    // Username label
    {
      type: 'create',
      shape: 'text',
      properties: {
        x: startPos.x,
        y: startPos.y + 60,
        text: 'Username',
        fontSize: 'medium',
        fillColor: 'black',
      },
    },
    // Username field
    {
      type: 'create',
      shape: 'rectangle',
      properties: {
        x: startPos.x,
        y: startPos.y + 90,
        width: 250,
        height: 40,
        fillColor: 'white',
        borderColor: 'gray',
        strokeWidth: 2,
      },
    },
    // Password label
    {
      type: 'create',
      shape: 'text',
      properties: {
        x: startPos.x,
        y: startPos.y + 150,
        text: 'Password',
        fontSize: 'medium',
        fillColor: 'black',
      },
    },
    // Password field
    {
      type: 'create',
      shape: 'rectangle',
      properties: {
        x: startPos.x,
        y: startPos.y + 180,
        width: 250,
        height: 40,
        fillColor: 'white',
        borderColor: 'gray',
        strokeWidth: 2,
      },
    },
    // Submit button
    {
      type: 'create',
      shape: 'rectangle',
      properties: {
        x: startPos.x,
        y: startPos.y + 240,
        width: 250,
        height: 45,
        fillColor: 'blue',
        borderColor: 'darkblue',
        strokeWidth: 2,
      },
    },
    // Submit button text
    {
      type: 'create',
      shape: 'text',
      properties: {
        x: startPos.x + 90,
        y: startPos.y + 250,
        text: 'Submit',
        fontSize: 'medium',
        fontWeight: 'bold',
        fillColor: 'white',
      },
    },
  ];

  const createdShapes = [];
  operations.forEach(op => {
    const result = executeCreateOperation(op, context, currentUser);
    if (result.success && result.createdShapes) {
      createdShapes.push(...result.createdShapes);
    }
  });

  return {
    success: true,
    createdShapes,
  };
}

/**
 * Create a navigation bar
 */
function createNavigationBar(parameters, context, currentUser) {
  const startPos = parameters?.position ? parsePosition(parameters.position.x, parameters.position.y) : { x: 100, y: 50 };
  const itemCount = parameters?.itemCount || 4;
  const itemNames = parameters?.items || ['Home', 'About', 'Services', 'Contact'];

  const operations = [
    // Background bar
    {
      type: 'create',
      shape: 'rectangle',
      properties: {
        x: startPos.x,
        y: startPos.y,
        width: 800,
        height: 60,
        fillColor: 'darkblue',
        borderColor: 'navy',
        strokeWidth: 2,
      },
    },
  ];

  // Add menu items
  const itemSpacing = 800 / (itemCount + 1);
  for (let i = 0; i < Math.min(itemCount, itemNames.length); i++) {
    operations.push({
      type: 'create',
      shape: 'text',
      properties: {
        x: startPos.x + itemSpacing * (i + 1) - 30,
        y: startPos.y + 20,
        text: itemNames[i],
        fontSize: 'medium',
        fontWeight: 'bold',
        fillColor: 'white',
      },
    });
  }

  const createdShapes = [];
  operations.forEach(op => {
    const result = executeCreateOperation(op, context, currentUser);
    if (result.success && result.createdShapes) {
      createdShapes.push(...result.createdShapes);
    }
  });

  return {
    success: true,
    createdShapes,
  };
}

/**
 * Create a card layout
 */
function createCardLayout(parameters, context, currentUser) {
  const startPos = parameters?.position ? parsePosition(parameters.position.x, parameters.position.y) : { x: 300, y: 200 };

  const operations = [
    // Card background
    {
      type: 'create',
      shape: 'rectangle',
      properties: {
        x: startPos.x,
        y: startPos.y,
        width: 300,
        height: 400,
        fillColor: 'white',
        borderColor: 'lightgray',
        strokeWidth: 2,
      },
    },
    // Image placeholder
    {
      type: 'create',
      shape: 'rectangle',
      properties: {
        x: startPos.x + 20,
        y: startPos.y + 20,
        width: 260,
        height: 180,
        fillColor: 'lightblue',
        borderColor: 'gray',
        strokeWidth: 1,
      },
    },
    // Title
    {
      type: 'create',
      shape: 'text',
      properties: {
        x: startPos.x + 20,
        y: startPos.y + 220,
        text: parameters?.title || 'Card Title',
        fontSize: 'large',
        fontWeight: 'bold',
        fillColor: 'black',
      },
    },
    // Description
    {
      type: 'create',
      shape: 'text',
      properties: {
        x: startPos.x + 20,
        y: startPos.y + 260,
        text: parameters?.description || 'Card description text goes here.',
        fontSize: 'small',
        fillColor: 'gray',
      },
    },
    // Button
    {
      type: 'create',
      shape: 'rectangle',
      properties: {
        x: startPos.x + 20,
        y: startPos.y + 330,
        width: 120,
        height: 40,
        fillColor: 'blue',
        borderColor: 'darkblue',
        strokeWidth: 2,
      },
    },
    // Button text
    {
      type: 'create',
      shape: 'text',
      properties: {
        x: startPos.x + 45,
        y: startPos.y + 340,
        text: 'Learn More',
        fontSize: 'medium',
        fillColor: 'white',
      },
    },
  ];

  const createdShapes = [];
  operations.forEach(op => {
    const result = executeCreateOperation(op, context, currentUser);
    if (result.success && result.createdShapes) {
      createdShapes.push(...result.createdShapes);
    }
  });

  return {
    success: true,
    createdShapes,
  };
}

/**
 * Create a button group
 */
function createButtonGroup(parameters, context, currentUser) {
  const startPos = parameters?.position ? parsePosition(parameters.position.x, parameters.position.y) : { x: 300, y: 300 };
  const buttonCount = parameters?.count || 3;
  const buttonLabels = parameters?.labels || ['Button 1', 'Button 2', 'Button 3'];

  const createdShapes = [];
  const spacing = 20;
  const buttonWidth = 120;
  const buttonHeight = 40;

  for (let i = 0; i < buttonCount; i++) {
    // Button background
    const buttonOp = {
      type: 'create',
      shape: 'rectangle',
      properties: {
        x: startPos.x + i * (buttonWidth + spacing),
        y: startPos.y,
        width: buttonWidth,
        height: buttonHeight,
        fillColor: 'blue',
        borderColor: 'darkblue',
        strokeWidth: 2,
      },
    };

    const buttonResult = executeCreateOperation(buttonOp, context, currentUser);
    if (buttonResult.success && buttonResult.createdShapes) {
      createdShapes.push(...buttonResult.createdShapes);
    }

    // Button text
    const textOp = {
      type: 'create',
      shape: 'text',
      properties: {
        x: startPos.x + i * (buttonWidth + spacing) + 25,
        y: startPos.y + 12,
        text: buttonLabels[i] || `Button ${i + 1}`,
        fontSize: 'medium',
        fillColor: 'white',
      },
    };

    const textResult = executeCreateOperation(textOp, context, currentUser);
    if (textResult.success && textResult.createdShapes) {
      createdShapes.push(...textResult.createdShapes);
    }
  }

  return {
    success: true,
    createdShapes,
  };
}

