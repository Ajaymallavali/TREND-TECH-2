import React from 'react';
import { Search, Link as LinkIcon, MessageSquare } from 'lucide-react';

export default function AIAnalysisEmptyState({ onSelectExample }) {
  return (
    <section className="text-center py-12 px-6">
      <h2 className="text-xl font-black text-ink-900 mb-6">What would you like to analyze?</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        
        <div className="card bg-white p-6 border border-ink-100 rounded-2xl hover:border-accent-200 transition-colors">
          <div className="h-10 w-10 bg-accent-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <LinkIcon className="h-5 w-5 text-accent-600" />
          </div>
          <h3 className="text-sm font-bold text-ink-900 mb-2">Paste a URL</h3>
          <p className="text-xs text-ink-500 mb-4">Analyze any product from Amazon, Flipkart, etc. to find the best deal.</p>
        </div>

        <div className="card bg-white p-6 border border-ink-100 rounded-2xl hover:border-accent-200 transition-colors">
          <div className="h-10 w-10 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="h-5 w-5 text-green-600" />
          </div>
          <h3 className="text-sm font-bold text-ink-900 mb-2">Search Catalog</h3>
          <p className="text-xs text-ink-500 mb-4">Search our verified catalog by product name or exact model number.</p>
        </div>

        <div className="card bg-white p-6 border border-ink-100 rounded-2xl hover:border-accent-200 transition-colors cursor-pointer" onClick={() => onSelectExample('Best gaming laptop under 100000')}>
          <div className="h-10 w-10 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="h-5 w-5 text-purple-600" />
          </div>
          <h3 className="text-sm font-bold text-ink-900 mb-2">Ask AI</h3>
          <p className="text-xs text-ink-500 mb-4">"Best gaming laptop under ₹100000" or "Compare S25 and iPhone 17"</p>
        </div>
      </div>
    </section>
  );
}
