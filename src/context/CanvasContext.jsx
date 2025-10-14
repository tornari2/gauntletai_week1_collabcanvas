import React, { createContext, useContext, useState, useEffect } from 'react';
import { useShapeSync } from '../hooks/useShapeSync';
import { useAuth } from './AuthContext';

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
  const { currentUser } = useAuth();
  
  // Get Firebase sync functions from useShapeSync hook
  const { createShape: createShapeInFirestore, updateShapeInFirestore, deleteShapeFromFirestore } = useShapeSync();

  // Add a new shape to the canvas (with Firebase sync)
  async function addShape(shape) {
    if (!currentUser) return;
    
    try {
      // Optimistic update: add to local state immediately
      setShapes((prevShapes) => [...prevShapes, shape]);
      
      // Sync to Firebase in background
      await createShapeInFirestore(shape);
    } catch (error) {
      console.error('Error adding shape:', error);
      // Revert optimistic update on error
      setShapes((prevShapes) => prevShapes.filter(s => s.id !== shape.id));
    }
  }

  // Update an existing shape (with Firebase sync)
  async function updateShape(shapeId, updates) {
    if (!currentUser) return;
    
    try {
      // Optimistic update: update local state immediately
      setShapes((prevShapes) =>
        prevShapes.map((shape) =>
          shape.id === shapeId ? { ...shape, ...updates } : shape
        )
      );
      
      // Sync to Firebase in background
      await updateShapeInFirestore(shapeId, updates);
    } catch (error) {
      console.error('Error updating shape:', error);
      // Note: Firestore listener will correct the state if sync fails
    }
  }

  // Delete a shape from the canvas (with Firebase sync)
  async function deleteShape(shapeId) {
    if (!currentUser) return;
    
    try {
      // Optimistic update: remove from local state immediately
      setShapes((prevShapes) => prevShapes.filter((shape) => shape.id !== shapeId));
      
      // Clear selection if the deleted shape was selected
      if (selectedShapeId === shapeId) {
        setSelectedShapeId(null);
      }
      
      // Sync to Firebase in background
      await deleteShapeFromFirestore(shapeId);
    } catch (error) {
      console.error('Error deleting shape:', error);
      // Note: Firestore listener will correct the state if sync fails
    }
  }

  // Select a shape
  function selectShape(shapeId) {
    setSelectedShapeId(shapeId);
  }

  // Set all shapes at once (used by Firestore listener)
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

