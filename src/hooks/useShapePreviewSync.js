import { useCallback, useRef } from 'react';
import { usePresenceManager } from './usePresence';

/**
 * Custom hook to sync shape preview while drawing
 * Shows other users what shape is being created in real-time
 */
export function useShapePreviewSync() {
  const { updateShapePreview } = usePresenceManager();
  const lastUpdateTime = useRef(0);
  const timeoutId = useRef(null);

  /**
   * Update shape preview for other users to see
   * Throttled to avoid overwhelming the database
   */
  const syncShapePreview = useCallback((previewData) => {
    const now = Date.now();
    const timeSinceLastUpdate = now - lastUpdateTime.current;

    // Throttle updates to every 50ms (20 updates per second)
    if (timeSinceLastUpdate >= 50) {
      lastUpdateTime.current = now;
      updateShapePreview(previewData);
      
      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
        timeoutId.current = null;
      }
    } else {
      // Schedule update
      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
      }
      
      const delay = 50 - timeSinceLastUpdate;
      timeoutId.current = setTimeout(() => {
        lastUpdateTime.current = Date.now();
        updateShapePreview(previewData);
        timeoutId.current = null;
      }, delay);
    }
  }, [updateShapePreview]);

  /**
   * Clear shape preview (shape creation finished or cancelled)
   */
  const clearShapePreview = useCallback(() => {
    if (timeoutId.current) {
      clearTimeout(timeoutId.current);
      timeoutId.current = null;
    }
    updateShapePreview(null);
  }, [updateShapePreview]);

  return {
    syncShapePreview,
    clearShapePreview,
  };
}

