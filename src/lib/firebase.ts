import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, setPersistence, browserLocalPersistence, signInAnonymously } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCZIzCyyVbxQMBUihOwcKjCvJOA3xzCmVw",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "cse-c-ab22a.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "cse-c-ab22a",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "cse-c-ab22a.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "708396073887",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:708396073887:web:47cce66bc0e870bf3133aa",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-4ZRPF26RDE"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Set persistence to local for better cross-tab/refresh stability
setPersistence(auth, browserLocalPersistence).catch(console.error);

export const analytics = typeof window !== 'undefined' ? (() => {
  try {
    return getAnalytics(app);
  } catch (e) {
    console.warn("Firebase Analytics failed to initialize:", e);
    return null;
  }
})() : null;

export const db = getFirestore(app);


export const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);
export const signInWithGoogleRedirect = () => signInWithRedirect(auth, googleProvider);
export const signInAsGuest = () => signInAnonymously(auth);
export { getRedirectResult };
