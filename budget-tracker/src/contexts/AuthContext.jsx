import { initializeApp } from "firebase/app";
import { updatePassword as firebaseUpdatePassword } from 'firebase/auth';

import {
  createUserWithEmailAndPassword,
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut
} from 'firebase/auth';
import React, { createContext, useContext, useEffect, useState } from 'react';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBrJ7IhI2YaL1sEnZQkczUWm97Fg0AUFmo",
  authDomain: "budget-tracker-62738.firebaseapp.com",
  databaseURL: "https://budget-tracker-62738-default-rtdb.firebaseio.com",
  projectId: "budget-tracker-62738",
  storageBucket: "budget-tracker-62738.firebasestorage.app",
  messagingSenderId: "697184687551",
  appId: "1:697184687551:web:2aea06ade78421a07f3d0a",
  measurementId: "G-8QN55S28FM"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
 

const googleProvider = new GoogleAuthProvider();

const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  async function register(email, password) {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (error) {
      const authError = error;
      throw new Error(getErrorMessage(authError.code));
    }
  }

  async function login(email, password) {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      const authError = error;
      throw new Error(getErrorMessage(authError.code));
    }
  }

  async function logout() {
    try {
      await signOut(auth);
    } catch (error) {
      const authError = error;
      throw new Error(getErrorMessage(authError.code));
    }
  }

  async function googleSignIn() {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      const authError = error;
      throw new Error(getErrorMessage(authError.code));
    }
  }
  async function updatePassword(newPassword) {
    if (currentUser) {
      try {
        await firebaseUpdatePassword(currentUser, newPassword);
      } catch (error) {
        const authError = error;
        throw new Error(getErrorMessage(authError.code));
      }
    } else {
      throw new Error('No authenticated user');
    }
  }

  function getErrorMessage(errorCode) {
    switch (errorCode) {
      case 'auth/email-already-in-use':
        return 'This email is already registered';
      case 'auth/invalid-email':
        return 'Invalid email address';
      case 'auth/operation-not-allowed':
        return 'Operation not allowed';
      case 'auth/weak-password':
        return 'Password is too weak';
      case 'auth/user-disabled':
        return 'This account has been disabled';
      case 'auth/user-not-found':
        return 'No account found with this email';
      case 'auth/wrong-password':
        return 'Incorrect password';
      case 'auth/popup-closed-by-user':
        return 'Sign-in popup was closed before completion';
      case 'auth/cancelled-popup-request':
        return 'Only one popup request allowed at a time';
      case 'auth/popup-blocked':
        return 'Sign-in popup was blocked by the browser';
      default:
        return 'An error occurred during authentication';
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    login,
    register,
    logout,
    googleSignIn,
    isLoading,
    updatePassword,

  };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
    
  );
}

export { auth };

