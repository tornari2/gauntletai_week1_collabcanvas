/**
 * Centralized z-index management
 * Organized from lowest to highest layer
 */

export const Z_INDEX = {
  // Base layer - Canvas and shapes
  CANVAS: 0,
  
  // UI Layer 1 - Bottom toolbar and basic UI
  TOOLBAR: 100,
  USER_LIST: 100,
  
  // UI Layer 2 - Overlays and panels
  CUSTOMIZATION_PANEL: 200,
  LEGEND_BUTTON: 200,
  LOGIN_MODAL: 200,
  
  // UI Layer 3 - Tooltips and popovers
  LEGEND_TOOLTIP: 300,
  
  // Interaction Layer - Collaborative features
  REMOTE_CURSORS: 500,
  
  // Top Layer - Active editing states
  TEXT_INPUT: 1000,
}

export default Z_INDEX

