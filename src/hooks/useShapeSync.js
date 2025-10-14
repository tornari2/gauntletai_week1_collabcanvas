import { useEffect } from 'react';
import { collection, onSnapshot, doc, setDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../utils/firebase';
import { COLLECTIONS, GLOBAL_CANVAS_ID } from '../utils/constants';
import { useCanvas } from '../context/CanvasContext';
import { useAuth } from '../context/AuthContext';

/**
 * Custom hook to sync shapes with Firestore
 * Listens for real-time updates and provides functions to create/update/delete shapes
 */
export function useShapeSync() {
  const { setAllShapes } = useCanvas();
  const { currentUser } = useAuth();

  // Listen to shape changes from Firestore
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
        
        setAllShapes(shapes);
      },
      (error) => {
        console.error('Error listening to shapes:', error);
      }
    );

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, [currentUser, setAllShapes]);

  // Function to create a new shape in Firestore
  async function createShape(shapeData) {
    if (!currentUser) return;

    try {
      const shapeRef = doc(db, COLLECTIONS.CANVASES, GLOBAL_CANVAS_ID, COLLECTIONS.SHAPES, shapeData.id);
      
      await setDoc(shapeRef, {
        ...shapeData,
        ownerId: currentUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastModifiedBy: currentUser.uid,
      });
    } catch (error) {
      console.error('Error creating shape:', error);
      throw error;
    }
  }

  // Function to update a shape in Firestore
  async function updateShapeInFirestore(shapeId, updates) {
    if (!currentUser) return;

    try {
      const shapeRef = doc(db, COLLECTIONS.CANVASES, GLOBAL_CANVAS_ID, COLLECTIONS.SHAPES, shapeId);
      
      await updateDoc(shapeRef, {
        ...updates,
        updatedAt: serverTimestamp(),
        lastModifiedBy: currentUser.uid,
      });
    } catch (error) {
      console.error('Error updating shape:', error);
      throw error;
    }
  }

  // Function to delete a shape from Firestore
  async function deleteShapeFromFirestore(shapeId) {
    if (!currentUser) return;

    try {
      const shapeRef = doc(db, COLLECTIONS.CANVASES, GLOBAL_CANVAS_ID, COLLECTIONS.SHAPES, shapeId);
      await deleteDoc(shapeRef);
    } catch (error) {
      console.error('Error deleting shape:', error);
      throw error;
    }
  }

  return {
    createShape,
    updateShapeInFirestore,
    deleteShapeFromFirestore,
  };
}

