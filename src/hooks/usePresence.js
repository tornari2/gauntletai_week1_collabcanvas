import { useEffect } from 'react';
import { collection, onSnapshot, doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../utils/firebase';
import { COLLECTIONS } from '../utils/constants';
import { usePresence } from '../context/PresenceContext';
import { useAuth } from '../context/AuthContext';

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
  }, [currentUser, setAllOnlineUsers, setAllCursors]);

  // Function to set user as online in Firestore
  async function setUserPresence() {
    if (!currentUser || !userProfile) return;

    try {
      const presenceRef = doc(db, COLLECTIONS.PRESENCE, currentUser.uid);
      
      await setDoc(presenceRef, {
        userId: currentUser.uid,
        displayName: userProfile.displayName,
        colorHex: userProfile.colorHex,
        cursorX: 0,
        cursorY: 0,
        lastActive: serverTimestamp(),
        onlineStatus: 'online',
      });
    } catch (error) {
      console.error('Error setting user presence:', error);
    }
  }

  // Function to remove user presence from Firestore
  async function removeUserPresence() {
    if (!currentUser) return;

    try {
      const presenceRef = doc(db, COLLECTIONS.PRESENCE, currentUser.uid);
      await deleteDoc(presenceRef);
    } catch (error) {
      console.error('Error removing user presence:', error);
    }
  }

  // Function to update cursor position in Firestore
  async function updateCursorPosition(x, y) {
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
  }

  return {
    setUserPresence,
    removeUserPresence,
    updateCursorPosition,
  };
}

