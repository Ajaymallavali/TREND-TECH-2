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
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <Sparkles className="h-4 w-4 text-accent-500" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-10 py-2 border border-ink-200/80 rounded-xl text-xs bg-white text-ink-900 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-accent-100 focus:border-accent-500 shadow-xs transition-all group-hover:border-accent-300"
          placeholder="Ask AI: Try 'Best gaming laptop under ₹1,00,000'"
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
      <form
        onSubmit={handleSearch}
        className="relative group bg-white rounded-2xl p-1.5 border border-ink-200/80 hover:border-accent-300 focus-within:border-accent-500 focus-within:ring-4 focus-within:ring-accent-100/60 shadow-md transition-all duration-200 flex items-center"
      >
        <div className="pl-3.5 pr-2 flex items-center pointer-events-none text-accent-600">
          <Sparkles className="h-5 w-5 animate-pulse" />
        </div>
        <input
          type="text"
          className="block w-full py-3 pr-4 text-sm font-medium bg-transparent text-ink-900 placeholder:text-ink-400 focus:outline-none"
          placeholder="Ask AI: 'Best phone under ₹30,000' or paste Amazon/Flipkart URL..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          type="submit"
          className="btn-accent px-4 py-2.5 text-xs font-bold shrink-0 flex items-center gap-1.5 shadow-xs"
        >
          <span>Ask AI</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </form>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5">
        <span className="text-[10px] font-bold text-ink-400 uppercase tracking-wider mr-1">Trending:</span>
        {suggestions.map((term) => (
          <button
            key={term}
            type="button"
            onClick={() => navigate(`/analysis?q=${encodeURIComponent(term)}`)}
            className="rounded-full bg-white border border-ink-200/70 px-3 py-1 text-[11px] font-semibold text-ink-600 hover:border-accent-400 hover:text-accent-700 hover:bg-accent-50/50 hover:shadow-xs transition-all duration-150"
          >
            {term}
          </button>
        ))}
      </div>
    </div>
  );
}
