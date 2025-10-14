import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../utils/firebase';
import { getUserColorHex } from '../utils/colorGenerator';
import { COLLECTIONS } from '../utils/constants';

const AuthContext = createContext();

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sign up with email, password, and display name
  async function signup(email, password, displayName) {
    try {
      setError(null);
      
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Generate deterministic color from display name
      const colorHex = getUserColorHex(displayName);

      // Create user profile in Firestore
      const userDocRef = doc(db, COLLECTIONS.USERS, user.uid);
      await setDoc(userDocRef, {
        uid: user.uid,
        email: user.email,
        displayName: displayName,
        colorHex: colorHex,
        createdAt: new Date().toISOString()
      });

      // Set user profile in state
      setUserProfile({
        uid: user.uid,
        email: user.email,
        displayName: displayName,
        colorHex: colorHex
      });

      return user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }

  // Login with email and password
  async function login(email, password) {
    try {
      setError(null);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Fetch user profile from Firestore
      const userDocRef = doc(db, COLLECTIONS.USERS, user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        setUserProfile(userDoc.data());
      }

      return user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }

  // Logout
  async function logout() {
    try {
      setError(null);
      
      // Remove user from presence collection (will implement in PR 11)
      if (currentUser) {
        // TODO: Remove from presence collection
        // const presenceRef = doc(db, COLLECTIONS.PRESENCE, currentUser.uid);
        // await deleteDoc(presenceRef);
      }

      await signOut(auth);
      setUserProfile(null);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        // Fetch user profile from Firestore
        try {
          const userDocRef = doc(db, COLLECTIONS.USERS, user.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            setUserProfile(userDoc.data());
          }
        } catch (err) {
          console.error('Error fetching user profile:', err);
        }
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userProfile,
    loading,
    error,
    signup,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

