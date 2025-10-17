import { useCallback, useRef } from 'react';
import { usePresenceManager } from './usePresence';
import { SYNC_CONFIG } from '../utils/constants';

/**
 * Custom hook to sync cursor position to Realtime Database with throttling
 * Prevents overwhelming the database with too many updates (~60fps)
 */
export function useCursorSync() {
  const { updateCursorPosition } = usePresenceManager();
  const lastUpdateTime = useRef(0);
  const pendingUpdate = useRef(null);
  const timeoutId = useRef(null);

  /**
   * Throttled cursor position update
   * Updates immediately if enough time has passed, otherwise schedules update
   */
  const syncCursorPosition = useCallback((x, y) => {
    const now = Date.now();
    const timeSinceLastUpdate = now - lastUpdateTime.current;

    // If enough time has passed, update immediately
    if (timeSinceLastUpdate >= SYNC_CONFIG.CURSOR_THROTTLE_MS) {
      lastUpdateTime.current = now;
      updateCursorPosition(x, y);
      
      // Clear any pending update
      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
        timeoutId.current = null;
      }
      pendingUpdate.current = null;
    } else {
      // Store pending update
      pendingUpdate.current = { x, y };
      
      // Schedule update if not already scheduled
      if (!timeoutId.current) {
        const delay = SYNC_CONFIG.CURSOR_THROTTLE_MS - timeSinceLastUpdate;
        
        timeoutId.current = setTimeout(() => {
          if (pendingUpdate.current) {
            lastUpdateTime.current = Date.now();
            updateCursorPosition(pendingUpdate.current.x, pendingUpdate.current.y);
            pendingUpdate.current = null;
          }
          timeoutId.current = null;
        }, delay);
      }
    }
  }, [updateCursorPosition]);

  return {
    syncCursorPosition,
  };
}
