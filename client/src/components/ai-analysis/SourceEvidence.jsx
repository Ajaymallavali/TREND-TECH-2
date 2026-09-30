import React from 'react';
import { ShieldCheck, Link as LinkIcon } from 'lucide-react';
export function SourceEvidence({ data }) {
  return (
    <>
      {data.sources && data.sources.length > 0 && (
        <section className="card bg-white p-6 border border-ink-100 rounded-2xl">
          <h3 className="text-xs font-black text-ink-400 uppercase tracking-widest mb-4">Sources (Gemini Web Search)</h3>
          <div className="flex flex-wrap gap-2">
            {data.sources.map((src, idx) => (
              <a 
                key={idx} 
                href={src} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[10px] bg-ink-50 border border-ink-200 text-ink-600 px-3 py-1.5 rounded-full hover:bg-ink-100 transition-colors max-w-full truncate"
                title={src}
              >
                {new URL(src).hostname}
              </a>
            ))}
          </div>
        </section>
      )}

      {data.evidence && (
        <section className="card bg-ink-900 text-white p-6 border border-ink-800 rounded-2xl space-y-4 shadow-sm">
          <h3 className="text-xs font-black text-ink-300 uppercase tracking-widest flex items-center gap-2 mb-4">
            <ShieldCheck className="h-4 w-4 text-green-400" /> AI Research Evidence
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="space-y-1">
              <p className="text-[10px] text-ink-400 uppercase font-bold tracking-widest">Input</p>
              <p className="text-sm font-black text-ink-100 line-clamp-1" title={data.evidence.input}>{data.evidence.input}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-ink-400 uppercase font-bold tracking-widest">Intent</p>
              <p className="text-sm font-black text-blue-400">{data.evidence.intent}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-ink-400 uppercase font-bold tracking-widest">Research Mode</p>
              <p className="text-sm font-black text-purple-400">{data.evidence.researchMode.replace('_', ' ')}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-ink-400 uppercase font-bold tracking-widest">Product Identity</p>
              <p className="text-sm font-black text-green-400">{data.evidence.identity}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-ink-400 uppercase font-bold tracking-widest">Variant</p>
              <p className="text-sm font-black text-green-400">{data.evidence.variant}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-ink-400 uppercase font-bold tracking-widest">Image</p>
              <p className={`text-sm font-black ${data.evidence.image === 'VERIFIED' ? 'text-green-400' : 'text-amber-400'}`}>{data.evidence.image}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-ink-400 uppercase font-bold tracking-widest">Marketplaces</p>
              <p className="text-sm font-black text-ink-100">{data.evidence.verifiedOffers} Verified Offers</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-ink-400 uppercase font-bold tracking-widest">Sources</p>
              <p className="text-sm font-black text-ink-100">{data.evidence.sources.length} Verified Sources</p>
            </div>
          </div>
        </section>
      )}

      {data.urlIntelligence && data.urlIntelligence.isValid && (
        <section className="card bg-ink-50 text-ink-900 p-6 border border-ink-200 rounded-2xl space-y-4 shadow-sm mt-6">
          <h3 className="text-xs font-black text-ink-900 uppercase tracking-widest flex items-center gap-2 mb-4">
            <LinkIcon className="h-4 w-4 text-accent-600" /> URL Analysis Evidence
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="space-y-1 col-span-2 md:col-span-4">
              <p className="text-[10px] text-ink-500 uppercase font-bold tracking-widest">Original URL</p>
              <p className="text-xs font-semibold text-ink-700 truncate" title={data.urlIntelligence.originalUrl}>{data.urlIntelligence.originalUrl}</p>
            </div>
            <div className="space-y-1 col-span-2 md:col-span-4">
              <p className="text-[10px] text-ink-500 uppercase font-bold tracking-widest">Normalized Product URL</p>
              <p className="text-sm font-black text-ink-900 truncate" title={data.urlIntelligence.url}>{data.urlIntelligence.url}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-ink-500 uppercase font-bold tracking-widest">Marketplace</p>
              <p className="text-sm font-black text-accent-600">{data.urlIntelligence.marketplace}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-ink-500 uppercase font-bold tracking-widest">URL Type</p>
              <p className="text-sm font-black text-accent-600">{data.urlIntelligence.urlType}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-ink-500 uppercase font-bold tracking-widest">Product ID</p>
              <p className="text-sm font-black text-ink-900">{data.urlIntelligence.identifiers?.productId || 'N/A'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-ink-500 uppercase font-bold tracking-widest">Variant ID</p>
              <p className="text-sm font-black text-ink-900">{data.urlIntelligence.identifiers?.variantId || 'N/A'}</p>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
