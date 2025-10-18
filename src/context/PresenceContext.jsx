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
  const [shapePreviews, setShapePreviews] = useState({}); // Store other users' shape previews
  const [pendingShapes, setPendingShapes] = useState({}); // Store other users' pending shapes (instant broadcast)
  const [remoteSelections, setRemoteSelections] = useState({}); // Store other users' selected shapes
  const [remoteTransforms, setRemoteTransforms] = useState({}); // Store other users' active transformations

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

  // Set all shape previews at once
  const setAllShapePreviews = useCallback((previewsData) => {
    setShapePreviews(previewsData);
  }, []);

  // Set all pending shapes at once
  const setAllPendingShapes = useCallback((pendingShapesData) => {
    setPendingShapes(pendingShapesData);
  }, []);

  // Set all remote selections at once
  const setAllRemoteSelections = useCallback((remoteSelectionsData) => {
    setRemoteSelections(remoteSelectionsData);
  }, []);

  // Set all remote transforms at once
  const setAllRemoteTransforms = useCallback((remoteTransformsData) => {
    setRemoteTransforms(remoteTransformsData);
  }, []);

  const value = useMemo(() => ({
    onlineUsers,
    cursors,
    shapePreviews,
    pendingShapes,
    remoteSelections,
    remoteTransforms,
    setUserOnline,
    setUserOffline,
    updateCursor,
    setAllOnlineUsers,
    setAllCursors,
    setAllShapePreviews,
    setAllPendingShapes,
    setAllRemoteSelections,
    setAllRemoteTransforms,
  }), [onlineUsers, cursors, shapePreviews, pendingShapes, remoteSelections, remoteTransforms, setUserOnline, setUserOffline, updateCursor, setAllOnlineUsers, setAllCursors, setAllShapePreviews, setAllPendingShapes, setAllRemoteSelections, setAllRemoteTransforms]);

  return (
    <PresenceContext.Provider value={value}>
      {children}
    </PresenceContext.Provider>
  );
}

