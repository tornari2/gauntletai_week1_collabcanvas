import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { collection, onSnapshot, doc, setDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../utils/firebase';
import { COLLECTIONS, GLOBAL_CANVAS_ID } from '../utils/constants';
import { calculateZIndex } from '../utils/throttle';
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
  const [selectedShapeIds, setSelectedShapeIds] = useState([]); // For multi-select
  const [creatingRectangle, setCreatingRectangle] = useState(false);
  const [creatingDiamond, setCreatingDiamond] = useState(false);
  const [creatingCircle, setCreatingCircle] = useState(false);
  const [creatingArrow, setCreatingArrow] = useState(false);
  
  // Ref for the Konva stage (to be set by Canvas component)
  const stageRef = useRef(null);
  
  // Customization settings that persist across shape creation
  const [fillColor, setFillColor] = useState('#808080'); // Default gray
  const [fillOpacity, setFillOpacity] = useState(0.5); // Default 50%
  const [borderThickness, setBorderThickness] = useState(2); // Default 2px
  const [borderStyle, setBorderStyle] = useState('solid'); // 'solid', 'dashed', or 'dotted'
  
  // Text customization settings
  const [fontSize, setFontSize] = useState('medium'); // 'small', 'medium', 'large'
  const [fontWeight, setFontWeight] = useState('normal'); // 'normal', 'bold'
  const [fontStyle, setFontStyle] = useState('normal'); // 'normal', 'italic'
  const [textDecoration, setTextDecoration] = useState('none'); // 'none', 'underline'
  const [fontFamily, setFontFamily] = useState('Arial'); // Font family name
  
  // Layer customization settings
  const [defaultLayerPosition, setDefaultLayerPosition] = useState('front'); // 'front' or 'back'
  
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
        
        // Sort by zIndex for consistent ordering (layering)
        shapes.sort((a, b) => {
          const aZ = a.zIndex || a.createdAt?.seconds || 0;
          const bZ = b.zIndex || b.createdAt?.seconds || 0;
          return aZ - bZ;
        });
        
        setShapes(shapes);
      },
      (error) => {
        console.error('Firestore listener error:', error);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  // Add a new shape to the canvas (with Firebase sync)
  async function addShape(shape) {
    // Get user from context or directly from Firebase auth
    const user = currentUser || auth.currentUser;
    
    if (!user) {
      console.error('Cannot add shape: No authenticated user');
      return;
    }
    
    try {
      // Optimistic update: add to local state immediately
      setShapes((prevShapes) => [...prevShapes, shape]);
      
      // Sync to Firebase in background
      const shapeRef = doc(db, COLLECTIONS.CANVASES, GLOBAL_CANVAS_ID, COLLECTIONS.SHAPES, shape.id);
      await setDoc(shapeRef, {
        ...shape,
        zIndex: shape.zIndex || Date.now(), // Use provided zIndex or timestamp
        ownerId: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastModifiedBy: user.uid,
      });
    } catch (error) {
      console.error('Error adding shape:', error);
      // Revert optimistic update on error
      setShapes((prevShapes) => prevShapes.filter(s => s.id !== shape.id));
    }
  }

  // Update an existing shape (with Firebase sync)
  async function updateShape(shapeId, updates) {
    const user = currentUser || auth.currentUser;
    if (!user) return;
    
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
        lastModifiedBy: user.uid,
      });
    } catch (error) {
      console.error('Error updating shape:', error);
      // Note: Firestore listener will correct the state if sync fails
    }
  }

  // Delete a shape from the canvas (with Firebase sync)
  async function deleteShape(shapeId) {
    const user = currentUser || auth.currentUser;
    if (!user) return;
    
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
    setSelectedShapeIds([]); // Clear multi-selection when single selecting
  }
  
  // Select multiple shapes
  function selectShapes(shapeIds) {
    setSelectedShapeIds(shapeIds);
    setSelectedShapeId(null); // Clear single selection when multi-selecting
  }
  
  // Delete multiple shapes
  async function deleteShapes(shapeIds) {
    const user = currentUser || auth.currentUser;
    if (!user) return;
    
    try {
      // Optimistic update: remove from local state immediately
      setShapes((prevShapes) => prevShapes.filter((shape) => !shapeIds.includes(shape.id)));
      
      // Clear selections
      setSelectedShapeId(null);
      setSelectedShapeIds([]);
      
      // Sync to Firebase in background
      await Promise.all(
        shapeIds.map(shapeId => {
          const shapeRef = doc(db, COLLECTIONS.CANVASES, GLOBAL_CANVAS_ID, COLLECTIONS.SHAPES, shapeId);
          return deleteDoc(shapeRef);
        })
      );
    } catch (error) {
      console.error('Error deleting shapes:', error);
    }
  }
  
  // Update multiple shapes at once
  async function updateShapes(shapeIds, updates) {
    const user = currentUser || auth.currentUser;
    if (!user) return;
    
    try {
      // Optimistic update
      setShapes((prevShapes) =>
        prevShapes.map((shape) =>
          shapeIds.includes(shape.id) ? { ...shape, ...updates } : shape
        )
      );
      
      // Sync to Firebase
      await Promise.all(
        shapeIds.map(shapeId => {
          const shapeRef = doc(db, COLLECTIONS.CANVASES, GLOBAL_CANVAS_ID, COLLECTIONS.SHAPES, shapeId);
          return updateDoc(shapeRef, {
            ...updates,
            updatedAt: serverTimestamp(),
            lastModifiedBy: user.uid,
          });
        })
      );
    } catch (error) {
      console.error('Error updating shapes:', error);
    }
  }
  
  // Calculate zIndex for new shapes based on defaultLayerPosition
  const getNewShapeZIndex = useCallback(() => {
    return calculateZIndex(shapes, defaultLayerPosition);
  }, [shapes, defaultLayerPosition]);
  
  // Send shape to front (highest zIndex)
  const sendToFront = useCallback(async (shapeId) => {
    const user = currentUser || auth.currentUser;
    if (!user) return;
    
    try {
      const newZIndex = calculateZIndex(shapes, 'front');
      
      // Optimistic update
      setShapes((prevShapes) =>
        prevShapes.map((shape) =>
          shape.id === shapeId ? { ...shape, zIndex: newZIndex } : shape
        )
      );
      
      // Sync to Firebase
      const shapeRef = doc(db, COLLECTIONS.CANVASES, GLOBAL_CANVAS_ID, COLLECTIONS.SHAPES, shapeId);
      await updateDoc(shapeRef, {
        zIndex: newZIndex,
        updatedAt: serverTimestamp(),
        lastModifiedBy: user.uid,
      });
    } catch (error) {
      console.error('Error sending shape to front:', error);
    }
  }, [currentUser, shapes]);
  
  // Send shape to back (lowest zIndex)
  const sendToBack = useCallback(async (shapeId) => {
    const user = currentUser || auth.currentUser;
    if (!user) return;
    
    try {
      const newZIndex = calculateZIndex(shapes, 'back');
      
      // Optimistic update
      setShapes((prevShapes) =>
        prevShapes.map((shape) =>
          shape.id === shapeId ? { ...shape, zIndex: newZIndex } : shape
        )
      );
      
      // Sync to Firebase
      const shapeRef = doc(db, COLLECTIONS.CANVASES, GLOBAL_CANVAS_ID, COLLECTIONS.SHAPES, shapeId);
      await updateDoc(shapeRef, {
        zIndex: newZIndex,
        updatedAt: serverTimestamp(),
        lastModifiedBy: user.uid,
      });
    } catch (error) {
      console.error('Error sending shape to back:', error);
    }
  }, [currentUser, shapes]);

  const value = {
    shapes,
    selectedShapeId,
    selectedShapeIds,
    creatingRectangle,
    setCreatingRectangle,
    creatingDiamond,
    setCreatingDiamond,
    creatingCircle,
    setCreatingCircle,
    creatingArrow,
    setCreatingArrow,
    fillColor,
    setFillColor,
    fillOpacity,
    setFillOpacity,
    borderThickness,
    setBorderThickness,
    borderStyle,
    setBorderStyle,
    fontSize,
    setFontSize,
    fontWeight,
    setFontWeight,
    fontStyle,
    setFontStyle,
    textDecoration,
    setTextDecoration,
    fontFamily,
    setFontFamily,
    defaultLayerPosition,
    setDefaultLayerPosition,
    getNewShapeZIndex,
    addShape,
    updateShape,
    deleteShape,
    selectShape,
    selectShapes,
    deleteShapes,
    updateShapes,
    sendToFront,
    sendToBack,
    stageRef,
  };

  return (
    <CanvasContext.Provider value={value}>
      {children}
    </CanvasContext.Provider>
  );
}

