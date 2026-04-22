import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithGoogle, signInWithGoogleRedirect, signInAsGuest, getRedirectResult, auth, db } from '../lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { LogIn, Loader2, HelpCircle, UserCircle } from 'lucide-react';
import { motion } from 'motion/react';

const BOOTSTRAP_ADMINS = ['likkimahenderreddy123@gmail.com'];

export const Login: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkRedirect = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          setIsLoading(true);
          const user = result.user;
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          
          if (!userDoc.exists()) {
            const isAdminEmail = BOOTSTRAP_ADMINS.includes(user.email || '');
            await setDoc(doc(db, 'users', user.uid), {
              email: user.email,
              role: isAdminEmail ? 'admin' : 'student',
              createdAt: serverTimestamp()
            });
          }
          navigate('/');
        }
      } catch (err: any) {
        console.error("Redirect Login Error:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    checkRedirect();
  }, [navigate]);

  const handleLogin = async (useRedirect = false) => {
    if (isLoading) return;
    
    setError(null);

    if (useRedirect) {
      try {
        await signInWithGoogleRedirect();
      } catch (err: any) {
        setError(err.message);
      }
      return;
    }

    setIsLoading(true);
    try {
      const result = await signInWithGoogle();
      const user = result.user;
      
      // Check if user exists in the system
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (!userDoc.exists()) {
        // Auto-provision user based on email
        const isAdminEmail = BOOTSTRAP_ADMINS.includes(user.email || '');
        
        await setDoc(doc(db, 'users', user.uid), {
          email: user.email,
          role: isAdminEmail ? 'admin' : 'student',
          createdAt: serverTimestamp()
        });
      }
      
      // Standard flow: once provisioned or if already exists, go home
      navigate('/');
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user') {
        console.log('User closed the login popup.');
      } else if (err.code === 'auth/network-request-failed') {
        setError("Network Error: Please check your internet connection or disable ad-blockers that might be blocking Firebase.");
      } else {
        console.error("Login Error:", err);
        setError(err.message || "An unexpected error occurred during login.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    // This is now redundant but kept as a silent redirect for safety
    navigate('/');
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center transition-transform duration-1000 scale-105"
        style={{ 
          backgroundImage: 'url("/class-photo.jpg")', // Reference to the provided image
          backgroundColor: '#0f172a' // Dark fall-back color
        }}
      >
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[1px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/20 to-slate-900/80" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="z-10 w-full max-w-md"
      >
        <div className="text-center mb-10">
          <h1 className="text-5xl font-extrabold tracking-tighter text-white drop-shadow-2xl">
            Exam Hub
          </h1>
          <div className="h-1 w-20 bg-white mx-auto mt-4 rounded-full" />
        </div>

        <div className="bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-3xl shadow-2xl space-y-6">
          <div className="space-y-4">
            {/* Admin Login Button */}
            <button
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full relative overflow-hidden group bg-white text-brand-600 font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-brand-600/20 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <div className="absolute inset-0 bg-brand-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
              <div className="relative z-10 flex items-center justify-center gap-3 group-hover:text-white transition-colors duration-300">
                {isLoading ? <Loader2 size={20} className="animate-spin" /> : <LogIn size={20} />}
                <span>{isLoading ? 'Verifying...' : 'Sign in as Admin'}</span>
              </div>
            </button>

            {/* Member Login Button */}
            <button
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full relative overflow-hidden group bg-white text-slate-700 font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-slate-400/10 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <div className="absolute inset-0 bg-brand-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
              <div className="relative z-10 flex items-center justify-center gap-3 group-hover:text-white transition-colors duration-300">
                {isLoading ? <Loader2 size={20} className="animate-spin" /> : <LogIn size={20} />}
                <span>{isLoading ? 'Verifying...' : 'Sign in as Member'}</span>
              </div>
            </button>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-red-500/20 backdrop-blur-md border border-red-500/50 text-white rounded-xl text-xs font-bold text-center uppercase tracking-wider"
            >
              {error}
            </motion.div>
          )}

          <p className="text-[10px] text-white/60 text-center font-medium uppercase tracking-[0.2em] pt-4">
            Secure Institutional Access
          </p>

          <div className="pt-4 border-t border-white/10 mt-4">
            <button
              onClick={() => handleLogin(true)}
              className="w-full flex items-center justify-center gap-2 text-[10px] text-white/50 hover:text-white transition-colors uppercase tracking-widest font-bold group"
            >
              <HelpCircle size={12} className="group-hover:rotate-12 transition-transform" />
              <span>Trouble signing in? Try Redirect</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
