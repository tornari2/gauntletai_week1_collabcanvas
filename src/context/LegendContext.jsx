import React, { createContext, useContext, useState, useCallback } from 'react';

const LegendContext = createContext();

export function useLegend() {
  const context = useContext(LegendContext);
  if (!context) {
    throw new Error('useLegend must be used within a LegendProvider');
  }
  return context;
}

export function LegendProvider({ children }) {
  const [isLegendOpen, setIsLegendOpen] = useState(false);

  const toggleLegend = useCallback(() => {
    setIsLegendOpen(prev => !prev);
  }, []);

  const openLegend = useCallback(() => {
    setIsLegendOpen(true);
  }, []);

  const closeLegend = useCallback(() => {
    setIsLegendOpen(false);
  }, []);

  const value = {
    isLegendOpen,
    toggleLegend,
    openLegend,
    closeLegend,
  };

  return (
    <LegendContext.Provider value={value}>
      {children}
    </LegendContext.Provider>
  );
}


