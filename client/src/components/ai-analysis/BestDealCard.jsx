import React from 'react';
import { ArrowRight, Zap, CheckCircle2 } from 'lucide-react';
import { getStoreRedirectUrl } from '../../utils/storeUrlHelper';

export function BestDealCard({ bestDeal, product, formatINR }) {
  if (!bestDeal) return null;

  return (
    <section className="card bg-gradient-to-br from-accent-700 to-accent-800 p-8 border border-accent-600 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-8 text-white shadow-lg relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
      
      <div className="flex-1 relative z-10">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[10px] font-black uppercase tracking-widest bg-accent-900/50 px-2 py-1 border border-accent-500/30 rounded shadow-sm text-accent-100 flex items-center gap-1.5">
            <CheckCircle2 className="h-3 w-3" /> BEST VERIFIED DEAL
          </span>
          <span className="text-xs font-bold text-accent-200 uppercase tracking-wider">{bestDeal.marketplace}</span>
        </div>
        
        <div className="flex items-baseline gap-3">
          <span className="text-5xl font-black">{formatINR(bestDeal.price)}</span>
          {bestDeal.mrp > bestDeal.price && (
            <span className="text-xl text-accent-300 line-through font-semibold opacity-80">{formatINR(bestDeal.mrp)}</span>
          )}
        </div>
        
        {bestDeal.savings > 0 && (
          <p className="text-sm font-semibold text-accent-100 bg-accent-900/40 inline-block px-3 py-1 rounded-full mt-2">
            Save {formatINR(bestDeal.savings)} ({bestDeal.discountPercentage}% OFF)
          </p>
        )}
      </div>

      <div className="w-full md:w-auto flex-shrink-0 relative z-10">
        <a
          href={getStoreRedirectUrl(bestDeal.marketplace, product, bestDeal.url)}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-white text-accent-800 px-8 py-4 rounded-xl font-black text-lg w-full flex items-center justify-center gap-2 hover:bg-accent-50 transition-colors shadow-sm"
        >
          BUY NOW <ArrowRight className="h-5 w-5" />
        </a>
      </div>
    </section>
  );
}
