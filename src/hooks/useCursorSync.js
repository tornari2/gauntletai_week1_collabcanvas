import { useCallback, useRef } from 'react';
import { usePresenceManager } from './usePresence';
import { SYNC_CONFIG } from '../utils/constants';

/**
 * Custom hook to handle cursor position synchronization with throttling
 * Throttles cursor updates to avoid overwhelming Firestore
 */
export function useCursorSync() {
  const { updateCursorPosition } = usePresenceManager();
  const throttleTimerRef = useRef(null);
  const lastUpdateRef = useRef({ x: 0, y: 0 });

  // Throttled cursor update function
  const updateCursor = useCallback((x, y) => {
    // Store the latest cursor position
    lastUpdateRef.current = { x, y };

    // If there's no pending update, schedule one
    if (!throttleTimerRef.current) {
      throttleTimerRef.current = setTimeout(() => {
        const { x: latestX, y: latestY } = lastUpdateRef.current;
        
        // Update cursor position in Firestore
        updateCursorPosition(latestX, latestY);
        
        // Clear the timer
        throttleTimerRef.current = null;
      }, SYNC_CONFIG.CURSOR_THROTTLE_MS);
    }
  }, [updateCursorPosition]);

  return {
    updateCursor,
  };
}

