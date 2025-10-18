/**
 * Throttle utility for limiting function execution rate
 * Useful for performance-critical operations like cursor tracking
 */

/**
 * Creates a throttled version of a function
 * @param {Function} func - Function to throttle
 * @param {number} delay - Minimum time between executions in ms
 * @returns {Function} - Throttled function
 */
export function createThrottle(delay) {
  let lastUpdateTime = 0;
  let pendingArgs = null;
  let timeoutId = null;

  return function throttled(func, ...args) {
    const now = Date.now();
    const timeSinceLastUpdate = now - lastUpdateTime;

    if (timeSinceLastUpdate >= delay) {
      lastUpdateTime = now;
      func(...args);
      
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      pendingArgs = null;
    } else {
      pendingArgs = args;
      
      if (!timeoutId) {
        const remainingDelay = delay - timeSinceLastUpdate;
        
        timeoutId = setTimeout(() => {
          if (pendingArgs) {
            lastUpdateTime = Date.now();
            func(...pendingArgs);
            pendingArgs = null;
          }
          timeoutId = null;
        }, remainingDelay);
      }
    }
  };
}

/**
 * Calculate z-index for shapes
 * @param {Array} shapes - Array of shapes
 * @param {string} position - 'front' or 'back'
 * @returns {number} - New z-index value
 */
export function calculateZIndex(shapes, position) {
  if (shapes.length === 0) {
    return Date.now();
  }

  if (position === 'front') {
    const maxZIndex = shapes.reduce((max, shape) => {
      const shapeZ = shape.zIndex || 0;
      return shapeZ > max ? shapeZ : max;
    }, 0);
    return maxZIndex + 1;
  } else {
    const minZIndex = shapes.reduce((min, shape) => {
      const shapeZ = shape.zIndex || 0;
      return shapeZ < min ? shapeZ : min;
    }, Infinity);
    return (minZIndex === Infinity ? 0 : minZIndex) - 1;
  }
}

