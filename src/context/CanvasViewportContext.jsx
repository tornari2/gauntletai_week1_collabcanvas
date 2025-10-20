import React, { createContext, useContext, useState, useCallback } from 'react';

const CanvasViewportContext = createContext();

export function useCanvasViewport() {
  const context = useContext(CanvasViewportContext);
  if (!context) {
    throw new Error('useCanvasViewport must be used within a CanvasViewportProvider');
  }
  return context;
}

export function CanvasViewportProvider({ children }) {
  const [zoom, setZoom] = useState(1);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });

  const updateZoom = useCallback((newZoom) => {
    setZoom(newZoom);
  }, []);

  const updateCursorPosition = useCallback((x, y) => {
    setCursorPosition({ x: Math.round(x), y: Math.round(y) });
  }, []);

  const value = {
    zoom,
    cursorPosition,
    updateZoom,
    updateCursorPosition,
  };

  return (
    <CanvasViewportContext.Provider value={value}>
      {children}
    </CanvasViewportContext.Provider>
  );
}


