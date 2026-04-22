import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { UserProfile } from '../types';

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
  loading: true,
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
        setLoading(true); // Ensure loading is true while we fetch or create profile
        unsubscribeProfile = onSnapshot(doc(db, 'users', authUser.uid), async (snapshot) => {
          if (snapshot.exists()) {
            setProfile({ uid: authUser.uid, ...snapshot.data() } as UserProfile);
            setLoading(false);
          } else {
            if (authUser.isAnonymous) {
              try {
                await setDoc(doc(db, 'users', authUser.uid), {
                  email: 'guest@examhub.local',
                  role: 'student',
                  createdAt: serverTimestamp(),
                  isGuest: true
                });
              } catch (e) {
                console.error("Auto-provision guest failed:", e);
                setLoading(false);
              }
            } else {
              // Non-anonymous user with no profile yet.
              // This can happen briefly during Google login redirects.
              // We'll keep loading true for a bit or if they truly have no profile, 
              // the login logic usually handles the creation.
              setProfile(null);
              setLoading(false);
            }
          }
        }, (error) => {
          console.error("Profile sync error:", error);
          setProfile(null);
          setLoading(false);
        });
      } else {
        // No user? Auto-login as guest for the "Remove login page only better" experience
        try {
          await signInAnonymously(auth);
          // onAuthStateChanged will trigger again
        } catch (error) {
          console.error("Auto-guest login failed:", error);
          setProfile(null);
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
    isAdmin: profile?.role === 'admin',
    isGuest: !!profile?.isGuest || user?.isAnonymous || false,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
