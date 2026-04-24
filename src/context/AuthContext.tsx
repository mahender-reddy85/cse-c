import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { UserProfile } from '../types';
import { BOOTSTRAP_ADMINS, BOOTSTRAP_STUDENTS } from '../lib/constants';

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (authUser) => {
      setUser(authUser);
      
      if (unsubscribeProfile) {
        unsubscribeProfile();
        unsubscribeProfile = null;
      }

      if (authUser) {
        // We are still loading until profile is fetched
    unsubscribeProfile = onSnapshot(doc(db, 'users', authUser.uid), async (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setProfile({ uid: authUser.uid, ...data } as UserProfile);
        setLoading(false);
      } else {
        // Auto-create profile instead of blocking
        const isAdminEmail = BOOTSTRAP_ADMINS.includes(authUser.email || '');
        const profileData = {
          email: authUser.email || (authUser.isAnonymous ? 'guest@examhub.local' : ''),
          role: isAdminEmail ? 'admin' : 'student',
          createdAt: serverTimestamp(),
          isGuest: authUser.isAnonymous
        };
        
        try {
          await setDoc(doc(db, 'users', authUser.uid), profileData);
          setProfile({ uid: authUser.uid, ...profileData } as any);
        } catch (err) {
          console.error("Auto-create profile failed:", err);
          setProfile({ uid: authUser.uid, ...profileData } as any);
        }
        setLoading(false);
      }
    }, (error) => {
      console.error("Profile sync error:", error);
      setProfile(null);
      setLoading(false);
    });
      } else {
        setProfile(null);
        setLoading(false);
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
