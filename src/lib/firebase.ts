import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, setPersistence, browserLocalPersistence, signInAnonymously } from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
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

// Use initializeFirestore with standard settings to avoid assertion errors
export const db = initializeFirestore(app, {}, (firebaseConfig as any).firestoreDatabaseId || '(default)');

export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);
export const signInWithGoogleRedirect = () => signInWithRedirect(auth, googleProvider);
export const signInAsGuest = () => signInAnonymously(auth);
export { getRedirectResult };
