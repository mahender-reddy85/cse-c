import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Compass, Search, MessageSquare, ShieldAlert, LogOut, LogIn, User as UserIcon, PlusCircle, X, Search as SearchIcon, Clock } from 'lucide-react';
import { auth } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';

const NavItem = ({ to, icon: Icon, label }: { to: string; icon: any; label: string }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center gap-3 px-4 py-3 font-mono text-xs tracking-widest transition-all duration-300 border-l-2 ${
        isActive
          ? 'bg-cyber-cyan/10 border-cyber-cyan text-cyber-cyan'
          : 'border-transparent text-gray-500 hover:text-gray-300 hover:bg-white/5'
      }`
    }
  >
    <Icon size={18} />
    <span>{label}</span>
  </NavLink>
);

export const Shell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile, isAdmin, isGuest } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
    }
  };

  const handleLogout = async () => {
    await auth.signOut();
  };

  const handleLoginRedirect = () => {
    navigate('/login');
  };

  const NavItem = ({ to, icon: Icon, label }: { to: string; icon: any; label: string }) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `nav-link ${isActive ? 'nav-link-active' : 'nav-link-inactive'}`
      }
    >
      <Icon size={18} />
      <span>{label}</span>
    </NavLink>
  );

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      {/* Sidebar */}
      <aside className="app-sidebar">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
              <Compass className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800">Exam Hub</h1>
          </div>

          <nav className="space-y-1">
            <NavItem to="/" icon={LayoutDashboard} label="Dashboard" />
            <NavItem to="/browse" icon={Compass} label="Explorer" />
            <NavItem to="/requests" icon={Clock} label="My Activity" />
          </nav>

          {isAdmin && (
            <div className="mt-10 pt-10 border-t border-slate-100">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">
                Admin Controls
              </p>
              <NavItem to="/admin" icon={ShieldAlert} label="Admin Panel" />
            </div>
          )}
        </div>

        <div className="mt-auto p-4 border-t border-slate-100">
          {isGuest ? (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg">
                <p className="text-[10px] font-bold text-blue-700 uppercase tracking-widest mb-1">Guest Mode</p>
                <p className="text-[9px] text-blue-600/80 leading-tight">Connect your account to save requests and unlock admin tools.</p>
              </div>
              <button
                onClick={handleLoginRedirect}
                className="btn-primary w-full py-3 flex items-center justify-center gap-2"
              >
                <LogIn size={14} />
                <span>Sign In</span>
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-lg overflow-hidden mb-4">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-bold ring-2 ring-white">
                  {user?.email?.substring(0, 2).toUpperCase() || 'U'}
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-bold truncate">{user?.email}</p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-tighter">
                    {profile?.role || 'User'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>
            </>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 flex flex-col min-h-screen">
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0 sticky top-0 z-40">
          <div className="flex items-center gap-6 flex-1 max-w-2xl">
            <div className="flex items-center gap-4 text-slate-300">
              <span className="font-light">/</span>
              <h2 className="font-bold text-slate-800 text-sm tracking-tight whitespace-nowrap">Active Session</h2>
            </div>
            
            {/* Integrated Search Bar */}
            <form onSubmit={handleSearch} className="flex-1 relative group max-w-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-600 transition-colors">
                <SearchIcon size={14} />
              </div>
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search resources..." 
                className="w-full bg-slate-50 border border-slate-100 rounded-full pl-9 pr-4 py-1.5 text-[11px] focus:bg-white focus:ring-4 focus:ring-brand-600/5 focus:border-brand-600/20 transition-all outline-none"
              />
            </form>
          </div>

          <div className="flex items-center gap-3">
            <NavLink to="/requests" className="flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg text-xs font-bold transition-all border border-slate-200 active:scale-95">
              <PlusCircle size={14} />
              <span>New Request</span>
            </NavLink>
            <NavLink to="/browse" className="btn-primary flex items-center gap-2 px-4 py-2">
              <Compass size={14} />
              <span>Browse All</span>
            </NavLink>
          </div>
        </header>

        <div className="p-8">
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
};
