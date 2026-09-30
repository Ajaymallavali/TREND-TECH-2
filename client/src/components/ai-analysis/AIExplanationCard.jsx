import React from 'react';
import { Sparkles, ShieldCheck, Link as LinkIcon } from 'lucide-react';

export function AIExplanationCard({ data }) {
  if (!data.research) return null;

  return (
    <>
      {data.research.explanation && (
        <section className="card bg-accent-900 text-white p-6 md:p-8 rounded-2xl shadow-sm border border-accent-800">
          <h3 className="text-xs font-black text-accent-300 uppercase tracking-widest flex items-center gap-2 mb-4">
            <Sparkles className="h-4 w-4 text-accent-400" /> AI Analysis & Verification
          </h3>
          <p className="text-base md:text-lg font-semibold leading-relaxed text-accent-50 mb-6">
            {data.research.explanation}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-accent-800/50">
            {data.research.keyFindings && (
              <div>
                <h4 className="text-[10px] font-bold text-accent-400 uppercase tracking-widest mb-3">Key Findings</h4>
                <ul className="space-y-2">
                  {data.research.keyFindings.map((finding, idx) => (
                    <li key={idx} className="text-sm font-medium text-accent-100 flex items-start gap-2">
                      <span className="text-accent-500 mt-1">•</span> {finding}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {data.research.watchOutFor && data.research.watchOutFor.length > 0 && (
              <div>
                <h4 className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-3">Watch Out For</h4>
                <ul className="space-y-2">
                  {data.research.watchOutFor.map((w, idx) => (
                    <li key={idx} className="text-sm font-medium text-amber-100 flex items-start gap-2">
                      <span className="text-amber-500 mt-1">•</span> {w}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>
      )}

      {data.specs && Object.keys(data.specs).length > 0 && (
        <section className="card bg-white p-6 border border-ink-100 rounded-2xl">
          <h3 className="text-xs font-black text-ink-400 uppercase tracking-widest mb-4">Key Specs</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {Object.entries(data.specs).map(([k, v]) => (
              <div key={k} className="bg-ink-50 p-3 rounded-xl border border-ink-100 flex flex-col justify-center">
                <p className="text-[10px] font-bold text-ink-400 uppercase mb-1">{k}</p>
                <p className="text-xs font-semibold text-ink-900 line-clamp-2" title={v}>{v}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}

