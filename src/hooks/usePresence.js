import { useEffect, useCallback } from 'react';
import { ref, onValue, set, update, onDisconnect, remove, serverTimestamp } from 'firebase/database';
import { rtdb } from '../utils/firebase';
import { usePresence } from '../context/PresenceContext';
import { useAuth } from '../context/AuthContext';
import { getUserColorHex } from '../utils/colorGenerator';

/**
 * Custom hook to manage user presence in Firebase Realtime Database
 * Listens for online users and provides functions to set/remove presence
 * Uses RTDB for faster real-time updates and automatic cleanup via onDisconnect
 */
export function usePresenceManager() {
  const { setAllOnlineUsers, setAllCursors, setAllShapePreviews, setAllPendingShapes, setAllRemoteSelections, setAllRemoteTransforms } = usePresence();
  const { currentUser, userProfile } = useAuth();

  // Listen to presence changes from Realtime Database
  useEffect(() => {
    if (!currentUser) return;

    const presenceRef = ref(rtdb, 'presence');
    
    const unsubscribe = onValue(
      presenceRef,
      (snapshot) => {
        const users = [];
        const cursorsData = {};
        const previewsData = {};
        const pendingShapesData = {};
        
        snapshot.forEach((childSnapshot) => {
          const data = childSnapshot.val();
          const userId = childSnapshot.key;
          
          users.push({
            userId: userId,
            displayName: data.displayName,
            colorHex: data.colorHex,
            onlineStatus: data.onlineStatus,
            lastActive: data.lastActive,
          });
          
          // Store cursor positions
          if (data.cursorX !== undefined && data.cursorY !== undefined) {
            cursorsData[userId] = {
              x: data.cursorX,
              y: data.cursorY,
              displayName: data.displayName,
              colorHex: data.colorHex,
            };
          }
          
          // Store shape previews (shapes being drawn)
          if (data.shapePreview) {
            previewsData[userId] = {
              ...data.shapePreview,
              displayName: data.displayName,
              colorHex: data.colorHex,
            };
          }
          
          // Store pending shapes (just created, waiting for Firestore sync)
          if (data.pendingShape) {
            pendingShapesData[userId] = {
              ...data.pendingShape,
              creatorId: userId,
              displayName: data.displayName,
              colorHex: data.colorHex,
            };
          }
        });
        
        setAllOnlineUsers(users);
        setAllCursors(cursorsData);
        setAllShapePreviews(previewsData);
        setAllPendingShapes(pendingShapesData);
        
        // Extract remote selections
        const remoteSelectionsData = {};
        const remoteTransformsData = {};
        snapshot.forEach((childSnapshot) => {
          const data = childSnapshot.val();
          const userId = childSnapshot.key;
          
          if (data.selectedShapes && Array.isArray(data.selectedShapes) && data.selectedShapes.length > 0) {
            remoteSelectionsData[userId] = {
              shapeIds: data.selectedShapes,
              displayName: data.displayName,
              colorHex: data.colorHex,
            };
          }
          
          // Store active transformations
          if (data.activeTransform) {
            remoteTransformsData[userId] = {
              ...data.activeTransform,
              displayName: data.displayName,
              colorHex: data.colorHex,
            };
          }
        });
        setAllRemoteSelections(remoteSelectionsData);
        setAllRemoteTransforms(remoteTransformsData);
      },
      (error) => {
        console.error('Error listening to presence:', error);
      }
    );

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, [currentUser, setAllOnlineUsers, setAllCursors, setAllShapePreviews, setAllPendingShapes, setAllRemoteSelections, setAllRemoteTransforms]);

  // Function to set user as online in Realtime Database with automatic cleanup
  const setUserPresence = useCallback(async () => {
    if (!currentUser || !userProfile) return;

    try {
      const presenceRef = ref(rtdb, `presence/${currentUser.uid}`);
      
      // Use userProfile colorHex, or generate from email as fallback
      const colorHex = userProfile.colorHex || 
        (currentUser.email ? getUserColorHex(currentUser.email) : '#000000');
      
      // Use displayName from userProfile, or email prefix as fallback
      const displayName = userProfile.displayName || 
        currentUser.email?.split('@')[0] || 
        'Anonymous';
      
      // Set presence data
      await set(presenceRef, {
        userId: currentUser.uid,
        displayName: displayName,
        colorHex: colorHex,
        cursorX: 0,
        cursorY: 0,
        lastActive: serverTimestamp(),
        onlineStatus: 'online',
      });
      
      // Automatically remove presence when user disconnects
      // This is a key advantage of Realtime Database!
      onDisconnect(presenceRef).remove();
    } catch (error) {
      console.error('Error setting user presence:', error);
    }
  }, [currentUser, userProfile]);

  // Function to remove user presence from Realtime Database
  const removeUserPresence = useCallback(async () => {
    if (!currentUser) return;

    try {
      const presenceRef = ref(rtdb, `presence/${currentUser.uid}`);
      await remove(presenceRef);
    } catch (error) {
      console.error('Error removing user presence:', error);
    }
  }, [currentUser]);

  // Function to update cursor position in Realtime Database
  // This is much faster than Firestore for frequent updates
  const updateCursorPosition = useCallback(async (x, y) => {
    if (!currentUser) return;

    try {
      const presenceRef = ref(rtdb, `presence/${currentUser.uid}`);
      
      // Use update() instead of set() to only modify specific fields
      await update(presenceRef, {
        cursorX: x,
        cursorY: y,
        lastActive: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating cursor position:', error);
    }
  }, [currentUser]);

  // Function to update shape preview while creating (real-time preview for other users)
  const updateShapePreview = useCallback(async (previewData) => {
    if (!currentUser) return;

    try {
      const presenceRef = ref(rtdb, `presence/${currentUser.uid}`);
      
      // Update with preview data (or null to clear)
      await update(presenceRef, {
        shapePreview: previewData || null,
        lastActive: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating shape preview:', error);
    }
  }, [currentUser]);

  // Function to broadcast a finalized shape instantly (before Firestore sync)
  const broadcastShape = useCallback(async (shapeData) => {
    if (!currentUser) return;

    try {
      const presenceRef = ref(rtdb, `presence/${currentUser.uid}`);
      
      // Broadcast the shape with a timestamp
      await update(presenceRef, {
        pendingShape: {
          ...shapeData,
          broadcastTime: Date.now(),
        },
        lastActive: serverTimestamp(),
      });

      // Clear the pending shape after 5 seconds (Firestore should have synced by then)
      setTimeout(async () => {
        try {
          await update(presenceRef, {
            pendingShape: null,
          });
        } catch (error) {
          console.error('Error clearing pending shape:', error);
        }
      }, 5000);
    } catch (error) {
      console.error('Error broadcasting shape:', error);
    }
  }, [currentUser]);

  // Function to broadcast selected shape(s) to other users
  const broadcastSelection = useCallback(async (selectedShapeIds) => {
    if (!currentUser) return;

    try {
      const presenceRef = ref(rtdb, `presence/${currentUser.uid}`);
      
      // Broadcast selection (array of shape IDs)
      await update(presenceRef, {
        selectedShapes: selectedShapeIds || [],
        lastActive: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error broadcasting selection:', error);
    }
  }, [currentUser]);

  // Function to broadcast ongoing shape transformations (drag, rotate, scale)
  const broadcastTransform = useCallback(async (transformData) => {
    if (!currentUser) return;

    try {
      const presenceRef = ref(rtdb, `presence/${currentUser.uid}`);
      
      // Broadcast transformation with timestamp
      await update(presenceRef, {
        activeTransform: transformData || null,
        lastActive: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error broadcasting transform:', error);
    }
  }, [currentUser]);

  return {
    setUserPresence,
    removeUserPresence,
    updateCursorPosition,
    updateShapePreview,
    broadcastShape,
    broadcastSelection,
    broadcastTransform,
  };
}

