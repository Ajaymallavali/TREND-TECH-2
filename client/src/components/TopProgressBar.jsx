import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function TopProgressBar() {
  const [loading, setLoading] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [location.pathname, location.search]);

  if (!loading) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-ink-100 overflow-hidden">
      <div className="h-full bg-gradient-to-r from-accent-500 via-accent-600 to-indigo-600 animate-pulse transition-all duration-300 w-full" />
    </div>
  );
}
