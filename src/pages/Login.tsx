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
          
          // Skip database calls for now to avoid Firestore errors
          // TODO: Re-enable database calls once Firestore is properly configured
          
          // Temporarily set user role based on email without database
          const isAdminEmail = BOOTSTRAP_ADMINS.includes(user.email || '');
          const userRole = isAdminEmail ? 'admin' : 'student';
          
          console.log('User logged in via redirect:', { email: user.email, role: userRole });
          
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
      
      // Skip database calls for now to avoid Firestore errors
      // TODO: Re-enable database calls once Firestore is properly configured
      
      // Temporarily set user role based on email without database
      const isAdminEmail = BOOTSTRAP_ADMINS.includes(user.email || '');
      const userRole = isAdminEmail ? 'admin' : 'student';
      
      console.log('User logged in:', { email: user.email, role: userRole });
      
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

  const handleAdminLogin = async () => {
    await handleLogin();
  };

  const handleMemberLogin = async () => {
    await handleLogin();
  };

  const handleGuestLogin = async () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 scale-105"
        style={{ backgroundImage: "url('/cse-c.png')" }}
      />
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px]" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="z-10 w-full max-w-md"
      >
        {/* Title */}
        <div className="text-center mb-10">
          <motion.h1 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="text-6xl font-black text-blue-600 tracking-tight mb-2 italic"
          >
            CSE-C
          </motion.h1>
          <motion.h2 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-3xl font-bold tracking-tight text-white mb-2"
          >
            Exam Hub
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-sm text-slate-200 font-medium"
          >
            Your Gateway to Academic Excellence
          </motion.p>
        </div>

        {/* Login Form Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="bg-white border border-slate-200 p-6 rounded-2xl shadow-lg space-y-4"
        >
          <div className="space-y-3">
            {/* Admin Sign In Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAdminLogin}
              disabled={isLoading}
              className="w-full relative overflow-hidden group bg-white text-slate-800 font-semibold py-3 px-4 rounded-xl transition-all shadow-md hover:shadow-lg border border-slate-200 hover:border-slate-300 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-700 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
              <div className="relative z-10 flex items-center justify-center gap-2 group-hover:text-white transition-colors duration-300">
                {isLoading ? <Loader2 size={18} className="animate-spin" /> : <LogIn size={18} />}
                <span className="text-base">{isLoading ? 'Authenticating...' : 'Sign in as Admin'}</span>
              </div>
            </motion.button>

            {/* Member Sign In Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleMemberLogin}
              disabled={isLoading}
              className="w-full relative overflow-hidden group bg-white text-slate-800 font-semibold py-3 px-4 rounded-xl transition-all shadow-md hover:shadow-lg border border-slate-200 hover:border-slate-300 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-700 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
              <div className="relative z-10 flex items-center justify-center gap-2 group-hover:text-white transition-colors duration-300">
                {isLoading ? <Loader2 size={18} className="animate-spin" /> : <LogIn size={18} />}
                <span className="text-base">{isLoading ? 'Authenticating...' : 'Sign in as Member'}</span>
              </div>
            </motion.button>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-semibold text-center"
            >
              {error}
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};
