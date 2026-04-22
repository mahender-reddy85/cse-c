import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { UserProfile } from '../types';
const BOOTSTRAP_ADMINS = ['likkimahenderreddy123@gmail.com'];

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  isGuest: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: false,
  isAdmin: false,
  isGuest: false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (authUser) => {
      setUser(authUser);
      
      if (unsubscribeProfile) {
        unsubscribeProfile();
        unsubscribeProfile = null;
      }

      if (authUser) {
        // Don't set loading to true for existing users
        setLoading(false);
    unsubscribeProfile = onSnapshot(doc(db, 'users', authUser.uid), async (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setProfile({ uid: authUser.uid, ...data } as UserProfile);
        setLoading(false);
      } else {
        // If not in database, check if it's a bootstrap admin
        const isAdminEmail = BOOTSTRAP_ADMINS.includes(authUser.email || '');
        if (isAdminEmail) {
          // Auto-provision bootstrap admin if missing from DB
          const adminProfile = {
            email: authUser.email!,
            role: 'admin',
            createdAt: serverTimestamp(),
          };
          await setDoc(doc(db, 'users', authUser.uid), adminProfile);
          setProfile({ uid: authUser.uid, ...adminProfile } as any);
          setLoading(false);
        } else {
          // ACCESS DENIED: Not in users collection
          console.error("Access Denied: User not in allowlist");
          await auth.signOut();
          setProfile(null);
          setLoading(false);
          alert("Access Denied: You are not authorized to use this portal. Please contact an admin.");
        }
      }
    }, (error) => {
      console.error("Profile sync error:", error);
      setProfile(null);
      setLoading(false);
    });
      } else {
        // No user? Auto-login as guest
        try {
          await signInAnonymously(auth);
          // onAuthStateChanged will trigger again
        } catch (error) {
          console.error("Auto-guest login failed:", error);
          setLoading(false);
        }
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, []);

  const value = {
    user,
    profile,
    loading,
    isAdmin: profile?.role === 'admin' || BOOTSTRAP_ADMINS.includes(user?.email || ''),
    isGuest: !!profile?.isGuest || user?.isAnonymous || false,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
