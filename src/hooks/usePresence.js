import { useEffect, useCallback } from 'react';
import { collection, onSnapshot, doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../utils/firebase';
import { COLLECTIONS } from '../utils/constants';
import { usePresence } from '../context/PresenceContext';
import { useAuth } from '../context/AuthContext';
import { getUserColorHex } from '../utils/colorGenerator';

/**
 * Custom hook to manage user presence in Firestore
 * Listens for online users and provides functions to set/remove presence
 */
export function usePresenceManager() {
  const { setAllOnlineUsers, setAllCursors } = usePresence();
  const { currentUser, userProfile } = useAuth();

  // Listen to presence changes from Firestore
  useEffect(() => {
    if (!currentUser) return;

    const presenceRef = collection(db, COLLECTIONS.PRESENCE);
    
    const unsubscribe = onSnapshot(
      presenceRef,
      (snapshot) => {
        const users = [];
        const cursorsData = {};
        
        snapshot.forEach((doc) => {
          const data = doc.data();
          
          users.push({
            userId: doc.id,
            displayName: data.displayName,
            colorHex: data.colorHex,
            onlineStatus: data.onlineStatus,
            lastActive: data.lastActive,
          });
          
          // Store cursor positions
          if (data.cursorX !== undefined && data.cursorY !== undefined) {
            cursorsData[doc.id] = {
              x: data.cursorX,
              y: data.cursorY,
              displayName: data.displayName,
              colorHex: data.colorHex,
            };
          }
        });
        
        setAllOnlineUsers(users);
        setAllCursors(cursorsData);
      },
      (error) => {
        console.error('Error listening to presence:', error);
      }
    );

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, [currentUser]);

  // Function to set user as online in Firestore
  const setUserPresence = useCallback(async () => {
    if (!currentUser || !userProfile) return;

    try {
      const presenceRef = doc(db, COLLECTIONS.PRESENCE, currentUser.uid);
      
      // Use userProfile colorHex, or generate from email as fallback
      const colorHex = userProfile.colorHex || 
        (currentUser.email ? getUserColorHex(currentUser.email) : '#000000');
      
      // Use displayName from userProfile, or email prefix as fallback
      const displayName = userProfile.displayName || 
        currentUser.email?.split('@')[0] || 
        'Anonymous';
      
      await setDoc(presenceRef, {
        userId: currentUser.uid,
        displayName: displayName,
        colorHex: colorHex,
        cursorX: 0,
        cursorY: 0,
        lastActive: serverTimestamp(),
        onlineStatus: 'online',
      });
    } catch (error) {
      console.error('Error setting user presence:', error);
    }
  }, [currentUser, userProfile]);

  // Function to remove user presence from Firestore
  const removeUserPresence = useCallback(async () => {
    if (!currentUser) return;

    try {
      const presenceRef = doc(db, COLLECTIONS.PRESENCE, currentUser.uid);
      await deleteDoc(presenceRef);
    } catch (error) {
      console.error('Error removing user presence:', error);
    }
  }, [currentUser]);

  // Function to update cursor position in Firestore
  const updateCursorPosition = useCallback(async (x, y) => {
    if (!currentUser) return;

    try {
      const presenceRef = doc(db, COLLECTIONS.PRESENCE, currentUser.uid);
      
      await setDoc(presenceRef, {
        cursorX: x,
        cursorY: y,
        lastActive: serverTimestamp(),
      }, { merge: true });
    } catch (error) {
      console.error('Error updating cursor position:', error);
    }
  }, [currentUser]);

  return {
    setUserPresence,
    removeUserPresence,
    updateCursorPosition,
  };
}

