import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { UserProfile } from '../types';
const BOOTSTRAP_ADMINS = ['likkimahenderreddy123@gmail.com'];
const BOOTSTRAP_STUDENTS = ['ndgmahi7@gmail.com'];

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
        // If not in database, check if it's a bootstrap admin or student
        const isAdminEmail = BOOTSTRAP_ADMINS.includes(authUser.email || '');
        const isStudentEmail = BOOTSTRAP_STUDENTS.includes(authUser.email || '');

        if (isAdminEmail || isStudentEmail) {
          const profileData = {
            email: authUser.email!,
            role: isAdminEmail ? 'admin' : 'student',
            createdAt: serverTimestamp(),
          };
          await setDoc(doc(db, 'users', authUser.uid), profileData);
          setProfile({ uid: authUser.uid, ...profileData } as any);
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
