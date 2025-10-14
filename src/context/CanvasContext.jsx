import React, { createContext, useContext, useState } from 'react';

const CanvasContext = createContext();

export function useCanvas() {
  const context = useContext(CanvasContext);
  if (!context) {
    throw new Error('useCanvas must be used within a CanvasProvider');
  }
  return context;
}

export function CanvasProvider({ children }) {
  const [shapes, setShapes] = useState([]);
  const [selectedShapeId, setSelectedShapeId] = useState(null);
  const [creatingRectangle, setCreatingRectangle] = useState(false);

  // Add a new shape to the canvas
  function addShape(shape) {
    setShapes((prevShapes) => [...prevShapes, shape]);
  }

  // Update an existing shape
  function updateShape(shapeId, updates) {
    setShapes((prevShapes) =>
      prevShapes.map((shape) =>
        shape.id === shapeId ? { ...shape, ...updates } : shape
      )
    );
  }

  // Delete a shape from the canvas
  function deleteShape(shapeId) {
    setShapes((prevShapes) => prevShapes.filter((shape) => shape.id !== shapeId));
    
    // Clear selection if the deleted shape was selected
    if (selectedShapeId === shapeId) {
      setSelectedShapeId(null);
    }
  }

  // Select a shape
  function selectShape(shapeId) {
    setSelectedShapeId(shapeId);
  }

  // Set all shapes at once (used for initial load from Firestore)
  function setAllShapes(newShapes) {
    setShapes(newShapes);
  }

  const value = {
    shapes,
    selectedShapeId,
    creatingRectangle,
    setCreatingRectangle,
    addShape,
    updateShape,
    deleteShape,
    selectShape,
    setAllShapes,
  };

  return (
    <CanvasContext.Provider value={value}>
      {children}
    </CanvasContext.Provider>
  );
}

