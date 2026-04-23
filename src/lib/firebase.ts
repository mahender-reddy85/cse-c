import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, setPersistence, browserLocalPersistence, signInAnonymously } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

import { getAnalytics } from 'firebase/analytics';
import firebaseConfig from '../../firebase-applet-config.json';

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
