import { useCallback, useRef } from 'react';
import { usePresenceManager } from './usePresence';

/**
 * Custom hook to sync shape transformations in real-time
 * Throttles updates to avoid overwhelming the database
 */
export function useTransformSync() {
  const { broadcastTransform } = usePresenceManager();
  const lastUpdateTime = useRef(0);
  const timeoutId = useRef(null);
  const pendingTransform = useRef(null);

  /**
   * Broadcast shape transformation (drag, rotate, scale)
   * Throttled to 20 updates per second
   */
  const syncTransform = useCallback((transformData) => {
    const now = Date.now();
    const timeSinceLastUpdate = now - lastUpdateTime.current;

    pendingTransform.current = transformData;

    // Throttle updates to every 50ms (20 updates per second)
    if (timeSinceLastUpdate >= 50) {
      lastUpdateTime.current = now;
      broadcastTransform(transformData);
      pendingTransform.current = null;
      
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
        if (pendingTransform.current) {
          lastUpdateTime.current = Date.now();
          broadcastTransform(pendingTransform.current);
          pendingTransform.current = null;
        }
        timeoutId.current = null;
      }, delay);
    }
  }, [broadcastTransform]);

  /**
   * Clear active transform (transformation finished)
   */
  const clearTransform = useCallback(() => {
    if (timeoutId.current) {
      clearTimeout(timeoutId.current);
      timeoutId.current = null;
    }
    pendingTransform.current = null;
    broadcastTransform(null);
  }, [broadcastTransform]);

  return {
    syncTransform,
    clearTransform,
  };
}

