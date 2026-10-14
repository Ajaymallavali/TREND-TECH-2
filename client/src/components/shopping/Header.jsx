import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sparkles, Zap, LayoutDashboard, LogOut } from 'lucide-react';
import { useAuthStore } from '../../store/authStore.js';

export default function Header() {
  const location = useLocation();
  const status = useAuthStore((s) => s.status);
  const logout = useAuthStore((s) => s.logout);

  const navLinks = [
    { name: 'Trend', path: '/trend' },
    { name: 'Tech', path: '/tech' },
    { name: 'Deals', path: '/deals' },
    { name: 'Compare', path: '/compare' },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-ink-100/80 bg-white/85 backdrop-blur-md shadow-xs transition-all">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-3">
        {/* Logo & Navigation */}
        <div className="flex items-center gap-7">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="h-8 w-8 rounded-xl bg-accent-600 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform duration-200">
              <Zap className="h-4 w-4 fill-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-tight text-ink-900 group-hover:text-accent-600 transition-colors leading-none">
                TREND-TECH
              </span>
              <span className="text-[9px] font-bold text-accent-600 uppercase tracking-widest mt-0.5">
                Shopping Intelligence
              </span>
            </div>
          </Link>
          
          <nav className="hidden md:flex items-center gap-1.5 p-1 bg-ink-50/80 rounded-xl border border-ink-100/60">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 uppercase tracking-wider ${
                    isActive
                      ? 'bg-white text-ink-950 shadow-xs border border-ink-100/80 font-black'
                      : 'text-ink-500 hover:text-ink-900 hover:bg-white/50'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>
        
        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <Link
            to="/analysis"
            className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-accent-50 to-emerald-50/80 px-3.5 py-2 text-xs font-bold text-accent-800 border border-accent-200/80 shadow-xs hover:border-accent-300 hover:shadow-sm active:scale-[0.98] transition-all"
          >
            <Sparkles className="h-3.5 w-3.5 text-accent-600 group-hover:rotate-12 transition-transform" />
            <span>AI Shopping Hub</span>
          </Link>

          <div className="hidden sm:flex items-center gap-2">
            {status === 'authenticated' ? (
              <>
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-600 hover:text-ink-950 px-3 py-2 rounded-lg hover:bg-ink-50 transition-colors"
                >
                  <LayoutDashboard className="h-3.5 w-3.5" />
                  <span>Dashboard</span>
                </Link>
                <button
                  onClick={logout}
                  className="btn-secondary py-1.5 px-3 text-xs inline-flex items-center gap-1"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Log out</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-xs font-semibold text-ink-600 hover:text-ink-950 px-3 py-2 rounded-lg hover:bg-ink-50 transition-colors"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="btn-primary py-2 px-4 text-xs font-bold"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
