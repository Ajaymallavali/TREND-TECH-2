import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, TrendingUp } from 'lucide-react';
import { useAuthStore } from '../../store/authStore.js';

export default function Header() {
  const status = useAuthStore((s) => s.status);
  const logout = useAuthStore((s) => s.logout);

  return (
    <header className="border-b border-ink-100 bg-white sticky top-0 z-50 shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-3.5">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2 group">
            <span className="text-xl font-black tracking-tight text-ink-900 group-hover:text-accent-600 transition-colors">
              TREND-TECH
            </span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-5 text-[11px] font-bold tracking-widest text-ink-600 uppercase">
            <Link to="/trend" className="hover:text-accent-600 transition-colors">Trend</Link>
            <Link to="/tech" className="hover:text-accent-600 transition-colors">Tech</Link>
            <Link to="/deals" className="hover:text-accent-600 transition-colors">Deals</Link>
            <Link to="/compare" className="hover:text-accent-600 transition-colors">Compare</Link>
          </nav>
        </div>
        
        <div className="flex items-center gap-4">
          <Link to="/analysis" className="text-xs font-bold text-accent-700 hover:text-accent-950 flex items-center gap-1.5 bg-accent-50 px-4 py-2 rounded-lg border border-accent-200 transition-colors shadow-sm">
            <Sparkles className="h-4 w-4" /> AI Shopping Hub
          </Link>

          <div className="hidden sm:flex items-center gap-3">
            {status === 'authenticated' ? (
              <>
                <Link to="/dashboard" className="text-xs font-semibold text-ink-600 hover:text-ink-900">Dashboard</Link>
                <button onClick={logout} className="btn-secondary py-1.5 px-3.5 text-xs">Log out</button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-xs font-semibold text-ink-600 hover:text-ink-900">Log in</Link>
                <Link to="/register" className="btn-primary py-1.5 px-3.5 text-xs">Sign up</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
