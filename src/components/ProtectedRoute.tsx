import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, adminOnly = false }) => {
  const { user, profile, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
          <span className="text-slate-600 font-bold text-sm uppercase tracking-widest animate-pulse">Let's go CSE-C</span>
        </div>
      </div>
    );
  }

  // If we have a user but for some reason the profile is still null after non-loading
  // We can fallback to guest-like behavior rather than blocking with an error screen
  const effectiveProfile = profile || (user ? { 
    uid: user.uid, 
    role: 'student', 
    email: user.email || 'guest@examhub.local' 
  } : null);

  if (!user || !effectiveProfile) {
    return <Navigate to="/login" />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
};
