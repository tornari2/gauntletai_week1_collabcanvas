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
  const { setAllOnlineUsers, setAllCursors } = usePresence();
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

  return {
    setUserPresence,
    removeUserPresence,
    updateCursorPosition,
  };
}

