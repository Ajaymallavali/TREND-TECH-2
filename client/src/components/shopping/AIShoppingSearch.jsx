import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function AIShoppingSearch({ compact = false }) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    navigate(`/analysis?q=${encodeURIComponent(query)}`);
  };

  const suggestions = [
    "Best phone under ₹30000",
    "Best ANC headphones under ₹5000",
    "Best laptop for coding",
    "Compare Galaxy S25 Ultra and iPhone 17 Pro"
  ];

  if (compact) {
    return (
      <form onSubmit={handleSearch} className="flex-grow max-w-xl mx-auto relative group">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Sparkles className="h-4 w-4 text-accent-500" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-10 py-2 border border-ink-200 rounded-full text-xs bg-white text-ink-900 placeholder-ink-400 focus:outline-none focus:ring-1 focus:ring-accent-500 focus:border-accent-500 shadow-sm transition-all group-hover:border-accent-300"
          placeholder="Ask AI: Try 'Best gaming laptop under ₹100000'"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit" className="absolute inset-y-0 right-0 pr-3 flex items-center text-ink-400 hover:text-accent-600 transition-colors">
          <ArrowRight className="h-4 w-4" />
        </button>
      </form>
    );
  }

  return (
    <div className="mx-auto mt-6 max-w-2xl w-full">
      <form onSubmit={handleSearch} className="relative group shadow-lg rounded-2xl">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Sparkles className="h-5 w-5 text-accent-500" />
        </div>
        <input
          type="text"
          className="block w-full pl-12 pr-16 py-4 border-2 border-accent-100 rounded-2xl text-sm font-medium bg-white text-ink-900 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-all hover:border-accent-300"
          placeholder="What are you looking for? Try 'Best gaming laptop under ₹100000'"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit" className="absolute inset-y-2 right-2 px-4 bg-accent-600 text-white rounded-xl text-xs font-bold hover:bg-accent-700 transition-colors shadow-sm flex items-center gap-1.5">
          Ask AI <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </form>

      <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
        <span className="text-[10px] font-bold text-ink-400 uppercase tracking-widest mr-2">Examples:</span>
        {suggestions.map((term) => (
          <button
            key={term}
            onClick={() => navigate(`/analysis?q=${encodeURIComponent(term)}`)}
            className="rounded-full bg-white border border-ink-200 px-3 py-1.5 text-[11px] font-semibold text-ink-600 hover:border-accent-300 hover:text-accent-700 hover:bg-accent-50 transition-colors shadow-sm"
          >
            {term}
          </button>
        ))}
      </div>
    </div>
  );
}
