import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, onSnapshot, doc, setDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../utils/firebase';
import { COLLECTIONS, GLOBAL_CANVAS_ID } from '../utils/constants';
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
  
  // Set up Firestore listener for real-time shape updates
  useEffect(() => {
    if (!currentUser) return;

    const shapesRef = collection(db, COLLECTIONS.CANVASES, GLOBAL_CANVAS_ID, COLLECTIONS.SHAPES);
    
    const unsubscribe = onSnapshot(
      shapesRef,
      (snapshot) => {
        const shapes = [];
        snapshot.forEach((doc) => {
          shapes.push({ id: doc.id, ...doc.data() });
        });
        
        // Sort by creation time for consistent ordering
        shapes.sort((a, b) => {
          const aTime = a.createdAt?.seconds || 0;
          const bTime = b.createdAt?.seconds || 0;
          return aTime - bTime;
        });
        
        setShapes(shapes);
      },
      (error) => {
        console.error('Error listening to shapes:', error);
      }
    );

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, [currentUser]);

  // Add a new shape to the canvas (with Firebase sync)
  async function addShape(shape) {
    if (!currentUser) return;
    
    try {
      // Optimistic update: add to local state immediately
      setShapes((prevShapes) => [...prevShapes, shape]);
      
      // Sync to Firebase in background
      const shapeRef = doc(db, COLLECTIONS.CANVASES, GLOBAL_CANVAS_ID, COLLECTIONS.SHAPES, shape.id);
      await setDoc(shapeRef, {
        ...shape,
        ownerId: currentUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastModifiedBy: currentUser.uid,
      });
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
      const shapeRef = doc(db, COLLECTIONS.CANVASES, GLOBAL_CANVAS_ID, COLLECTIONS.SHAPES, shapeId);
      await updateDoc(shapeRef, {
        ...updates,
        updatedAt: serverTimestamp(),
        lastModifiedBy: currentUser.uid,
      });
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
      const shapeRef = doc(db, COLLECTIONS.CANVASES, GLOBAL_CANVAS_ID, COLLECTIONS.SHAPES, shapeId);
      await deleteDoc(shapeRef);
    } catch (error) {
      console.error('Error deleting shape:', error);
      // Note: Firestore listener will correct the state if sync fails
    }
  }

  // Select a shape
  function selectShape(shapeId) {
    setSelectedShapeId(shapeId);
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
  };

  return (
    <CanvasContext.Provider value={value}>
      {children}
    </CanvasContext.Provider>
  );
}

