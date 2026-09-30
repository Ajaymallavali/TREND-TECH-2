import React from 'react';
import { HelpCircle, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PartialMatchResult({ data }) {
  if (!data || data.status !== 'PARTIAL_MATCH') return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <section className="card bg-amber-50 border border-amber-200 p-8 rounded-2xl text-center shadow-sm">
        <HelpCircle className="h-10 w-10 text-amber-500 mx-auto mb-3" />
        <h3 className="text-lg font-black text-amber-800 uppercase tracking-widest">{data.message}</h3>
        <p className="text-sm font-medium text-amber-700 mt-2">
          We found {data.candidates.length} products matching your query. Which one did you mean?
        </p>
      </section>

      <section className="space-y-4">
        {data.candidates.map((prod) => (
          <div key={prod._id} className="card bg-white p-4 border border-ink-100 rounded-xl flex items-center justify-between hover:border-accent-400 transition-colors cursor-pointer group shadow-sm"
            onClick={() => {
               // A hack to trigger a re-search with the exact model if clicked, 
               // by dispatching a custom event or you can just show a link.
               // The safest is a link to the standalone search or re-fill the form
               const event = new CustomEvent('ai-search-exact', { detail: prod.name });
               window.dispatchEvent(event);
            }}
          >
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 bg-ink-50 rounded-lg p-2 flex items-center justify-center">
                <img src={prod.image} alt={prod.name} className="h-full object-contain" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-ink-500 uppercase tracking-widest">{prod.brand}</span>
                <h4 className="text-sm font-black text-ink-900 leading-tight">{prod.name}</h4>
                <div className="flex gap-2 mt-1">
                  <span className="text-[10px] bg-ink-100 px-2 py-0.5 rounded font-bold text-ink-600">{prod.model}</span>
                </div>
              </div>
            </div>
            <button className="h-8 w-8 rounded-full bg-ink-50 text-ink-400 group-hover:bg-accent-100 group-hover:text-accent-600 flex items-center justify-center transition-colors">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        ))}
      </section>
    </div>
  );
}
