// Canvas Configuration
export const CANVAS_CONFIG = {
  // Zoom limits
  MIN_ZOOM: 0.1,
  MAX_ZOOM: 5,
  
  // Canvas size (virtual canvas space)
  CANVAS_WIDTH: 5000,
  CANVAS_HEIGHT: 5000,
};

// Sync & Performance
export const SYNC_CONFIG = {
  // Cursor position sync throttle (milliseconds)
  CURSOR_THROTTLE_MS: 50,
  
  // Shape update debounce during drag/resize (milliseconds)
  SHAPE_UPDATE_THROTTLE_MS: 50,
};

// Default Shape Properties
export const SHAPE_DEFAULTS = {
  // Rectangle default fill color
  DEFAULT_FILL_COLOR: 'rgba(128, 128, 128, 0.5)',
  
  // Rectangle default border color
  DEFAULT_STROKE_COLOR: '#000000',
  
  // Default stroke width
  DEFAULT_STROKE_WIDTH: 2,
  
  // Selection stroke width
  SELECTION_STROKE_WIDTH: 3,
  
  // Minimum shape size (prevents tiny shapes)
  MIN_SHAPE_SIZE: 10,
};

// Firestore Collections
export const COLLECTIONS = {
  USERS: 'users',
  CANVASES: 'canvases',
  SHAPES: 'shapes',
  PRESENCE: 'presence',
};

// Global canvas ID (single shared canvas for MVP)
export const GLOBAL_CANVAS_ID = 'global';

