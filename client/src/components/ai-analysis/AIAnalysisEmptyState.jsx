import React from 'react';
import { Search, Link as LinkIcon, MessageSquare, Zap, Play } from 'lucide-react';

export default function AIAnalysisEmptyState({ onSelectExample }) {
  const examples = [
    "Best gaming laptop under ₹100000",
    "Phone under ₹30000 with good camera",
    "Best ANC headphones under ₹5000",
    "Compare Galaxy S25 Ultra and iPhone 17 Pro"
  ];

  return (
    <section className="text-center py-12 px-6">
      <h2 className="text-xl font-black text-ink-900 mb-8 uppercase tracking-widest">What would you like to analyze?</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-5xl mx-auto mb-10">
        <div className="card bg-white p-6 border border-ink-100 rounded-2xl hover:border-accent-200 transition-colors">
          <div className="h-10 w-10 bg-accent-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <LinkIcon className="h-5 w-5 text-accent-600" />
          </div>
          <h3 className="text-sm font-bold text-ink-900 mb-2">Paste a product URL</h3>
          <p className="text-[10px] uppercase font-bold text-ink-500">Analyze any Amazon or Flipkart link.</p>
        </div>

        <div className="card bg-white p-6 border border-ink-100 rounded-2xl hover:border-accent-200 transition-colors">
          <div className="h-10 w-10 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="h-5 w-5 text-green-600" />
          </div>
          <h3 className="text-sm font-bold text-ink-900 mb-2">Search for a product</h3>
          <p className="text-[10px] uppercase font-bold text-ink-500">Find models and track price drops.</p>
        </div>

        <div className="card bg-white p-6 border border-ink-100 rounded-2xl hover:border-accent-200 transition-colors">
          <div className="h-10 w-10 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="h-5 w-5 text-purple-600" />
          </div>
          <h3 className="text-sm font-bold text-ink-900 mb-2">Describe what you need</h3>
          <p className="text-[10px] uppercase font-bold text-ink-500">Discover products by feature and budget.</p>
        </div>

        <div className="card bg-white p-6 border border-ink-100 rounded-2xl hover:border-accent-200 transition-colors">
          <div className="h-10 w-10 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Zap className="h-5 w-5 text-amber-600" />
          </div>
          <h3 className="text-sm font-bold text-ink-900 mb-2">Compare products</h3>
          <p className="text-[10px] uppercase font-bold text-ink-500">Side-by-side spec & verified deal comparison.</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto">
        <h4 className="text-xs font-bold text-ink-400 uppercase tracking-widest mb-4">Examples to try</h4>
        <div className="flex flex-wrap justify-center gap-3">
          {examples.map((ex, idx) => (
            <button
              key={idx}
              onClick={() => onSelectExample(ex)}
              className="text-xs font-semibold bg-white border border-ink-200 text-ink-700 px-4 py-2 rounded-full hover:bg-ink-50 hover:border-ink-300 transition-colors flex items-center gap-2 shadow-sm"
            >
              <Play className="h-3 w-3 text-ink-400" /> {ex}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
