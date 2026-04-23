import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Compass, ShieldAlert, LogOut, LogIn, Search as SearchIcon, Clock } from 'lucide-react';
import { auth } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';

export const Shell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile, isAdmin, isGuest } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Live Search: Debounced navigation to prevent "shaking/flickering"
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchTerm.trim()) {
        // Only navigate if the current search in URL is different to avoid redundant re-renders
        const params = new URLSearchParams(location.search);
        if (params.get('q') !== searchTerm) {
          navigate(`/search?q=${encodeURIComponent(searchTerm)}`, { replace: true });
        }
      } else if (location.pathname === '/search') {
        navigate('/', { replace: true });
      }
    }, 300); // 300ms debounce delay

    return () => clearTimeout(handler);
  }, [searchTerm, location.pathname, navigate]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handleLogout = async () => {
    await auth.signOut();
  };

  const handleLoginRedirect = () => {
    navigate('/login');
  };

  const SUBJECTS = ['ML', 'AFLC', 'ITE', 'WT', 'WT LAB', 'ML LAB'];

  const NavItem = ({ to, icon: Icon, label }: { to: string; icon: any; label: string }) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
          isActive 
            ? 'bg-blue-600 text-white shadow-blue-200 shadow-lg' 
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
        }`
      }
    >
      <Icon size={18} />
      <span>{label}</span>
    </NavLink>
  );

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 text-slate-900">
      {/* Bottom Navigation (Mobile) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-around px-4 z-50">
        <NavLink to="/" className={({ isActive }) => `flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all duration-300 ${isActive ? 'bg-blue-600 text-white shadow-lg scale-110 shadow-blue-200' : 'text-slate-400 hover:bg-slate-50'}`}>
          <LayoutDashboard size={22} />
        </NavLink>
        {!isAdmin && (
          <NavLink to="/requests" className={({ isActive }) => `flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all duration-300 ${isActive ? 'bg-blue-600 text-white shadow-lg scale-110 shadow-blue-200' : 'text-slate-400 hover:bg-slate-50'}`}>
            <Clock size={22} />
          </NavLink>
        )}
        {isAdmin && (
          <NavLink to="/admin" className={({ isActive }) => `flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all duration-300 ${isActive ? 'bg-blue-600 text-white shadow-lg scale-110 shadow-blue-200' : 'text-slate-400 hover:bg-slate-50'}`}>
            <ShieldAlert size={22} />
          </NavLink>
        )}
      </nav>

      {/* Sidebar (Desktop Only) */}
      <aside className="app-sidebar hidden lg:flex flex-col transition-transform duration-300">
        <div className="p-6">
          <div className="flex justify-center mb-8">
            <h1 className="text-3xl font-black tracking-widest text-slate-900 border-b-4 border-blue-600 pb-1">CSE-C</h1>
          </div>

          <nav className="space-y-2">
            <NavItem to="/" icon={LayoutDashboard} label="Dashboard" />
            {!isAdmin && <NavItem to="/requests" icon={Clock} label="My Activity" />}
            {isAdmin && <NavItem to="/admin" icon={ShieldAlert} label="Admin Panel" />}
          </nav>
        </div>

        <div className="mt-auto p-4 border-t border-slate-200">
          {isGuest ? (
            <div className="space-y-3">
              <div className="bg-gradient-to-r from-blue-50 to-slate-50 border border-blue-200 p-3 rounded-xl">
                <p className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-1">Guest Mode</p>
                <p className="text-xs text-blue-600/90 leading-relaxed">Connect your account to save requests.</p>
              </div>
              <button
                onClick={handleLoginRedirect}
                className="btn-primary w-full py-2.5 flex items-center justify-center gap-2"
              >
                <LogIn size={14} />
                <span>Sign In</span>
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl overflow-hidden mb-3 border border-slate-200">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold shadow-md">
                  {user?.email?.substring(0, 2).toUpperCase() || 'U'}
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-semibold truncate text-slate-900">{user?.email}</p>
                  <p className="text-xs text-slate-500 uppercase tracking-tight font-bold">
                    {isAdmin ? 'ADMIN' : 'USER'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-semibold text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 border border-transparent hover:border-red-100"
              >
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>
            </>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-60 flex flex-col min-h-screen w-full pb-16 lg:pb-0">
        <header className="h-20 bg-white/80 backdrop-blur-lg border-b border-slate-200 flex lg:grid lg:grid-cols-3 justify-between items-center px-4 md:px-8 shrink-0 sticky top-0 z-40 shadow-sm">
          {/* Left: Brand (Mobile Only) */}
          <div className="flex items-center">
            <h1 className="lg:hidden text-2xl font-black text-slate-900 shrink-0">CSE-C</h1>
          </div>

          {/* Center: Search Bar (Desktop Always, Mobile only on Search Page) */}
          <div className={`${location.pathname === '/search' ? 'flex' : 'hidden lg:flex'} justify-center flex-1 lg:flex-initial`}>
            <form onSubmit={handleSearch} className="w-full max-w-xs md:max-w-md relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                <SearchIcon size={14} className="md:w-4 md:h-4" />
              </div>
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search resources..." 
                className="w-full bg-slate-50 border-2 border-slate-100 dark:bg-slate-900 dark:border-slate-800 rounded-xl pl-10 md:pl-12 pr-4 py-2 text-sm focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none placeholder:text-slate-400 dark:text-slate-200"
              />
            </form>
          </div>

          {/* Right: Semester Indicator & User Avatar (Mobile) */}
          <div className="flex justify-end items-center gap-3">
            <span className="text-3xl md:text-4xl font-black text-blue-600 tracking-tighter italic mr-2 md:mr-0">3-2</span>
            
            {/* Mobile-only Avatar Dropdown */}
            {!isGuest && (
              <div className="lg:hidden relative">
                <button 
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shadow-md active:scale-95 transition-transform"
                >
                  {user?.email?.substring(0, 1).toUpperCase() || 'U'}
                </button>

                <AnimatePresence>
                  {showUserMenu && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 10 }}
                        className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 z-50 origin-top-right"
                      >
                        <div className="p-3 border-b border-slate-50 mb-1">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Account</p>
                          <p className="text-xs font-semibold text-slate-900 truncate">{user?.email}</p>
                        </div>
                        <button
                          onClick={() => { handleLogout(); setShowUserMenu(false); }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                        >
                          <LogOut size={16} />
                          <span>SIGN OUT</span>
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </header>

        <div className="p-6 md:p-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
};
