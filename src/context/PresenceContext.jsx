import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

const PresenceContext = createContext();

export function usePresence() {
  const context = useContext(PresenceContext);
  if (!context) {
    throw new Error('usePresence must be used within a PresenceProvider');
  }
  return context;
}

export function PresenceProvider({ children }) {
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [cursors, setCursors] = useState({});

  // Set user as online
  const setUserOnline = useCallback((userId, userData) => {
    setOnlineUsers((prevUsers) => {
      const existingUserIndex = prevUsers.findIndex((user) => user.userId === userId);
      
      if (existingUserIndex >= 0) {
        // Update existing user
        const updatedUsers = [...prevUsers];
        updatedUsers[existingUserIndex] = { userId, ...userData };
        return updatedUsers;
      } else {
        // Add new user
        return [...prevUsers, { userId, ...userData }];
      }
    });
  }, []);

  // Set user as offline (remove from list)
  const setUserOffline = useCallback((userId) => {
    setOnlineUsers((prevUsers) => prevUsers.filter((user) => user.userId !== userId));
    
    // Also remove their cursor
    setCursors((prevCursors) => {
      const newCursors = { ...prevCursors };
      delete newCursors[userId];
      return newCursors;
    });
  }, []);

  // Update cursor position for a user
  const updateCursor = useCallback((userId, cursorData) => {
    setCursors((prevCursors) => ({
      ...prevCursors,
      [userId]: cursorData,
    }));
  }, []);

  // Set all online users at once (used for initial load from Firestore)
  const setAllOnlineUsers = useCallback((users) => {
    setOnlineUsers(users);
  }, []);

  // Set all cursors at once
  const setAllCursors = useCallback((cursorsData) => {
    setCursors(cursorsData);
  }, []);

  const value = useMemo(() => ({
    onlineUsers,
    cursors,
    setUserOnline,
    setUserOffline,
    updateCursor,
    setAllOnlineUsers,
    setAllCursors,
  }), [onlineUsers, cursors, setUserOnline, setUserOffline, updateCursor, setAllOnlineUsers, setAllCursors]);

  return (
    <PresenceContext.Provider value={value}>
      {children}
    </PresenceContext.Provider>
  );
}

