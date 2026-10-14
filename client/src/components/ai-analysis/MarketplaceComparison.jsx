import React from 'react';
import { Zap, CheckCircle2, ArrowRight } from 'lucide-react';
import { getStoreRedirectUrl } from '../../utils/storeUrlHelper';

export function MarketplaceComparison({ marketplaces, product, formatINR }) {
  if (!marketplaces || marketplaces.length === 0) return null;

  return (
    <section className="card bg-white p-6 border border-ink-100 rounded-2xl space-y-4 overflow-x-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <h3 className="text-sm font-bold text-ink-900 uppercase flex items-center gap-2">
          <Zap className="h-4 w-4 text-accent-600" /> Compare Stores
        </h3>
        <span className="text-xs font-semibold text-ink-500 bg-ink-50 px-3 py-1 rounded-full border border-ink-100">
          {marketplaces.filter(mp => mp.isVerified).length === 1 
            ? "1 verified marketplace offer" 
            : `${marketplaces.filter(mp => mp.isVerified).length} verified marketplace offers compared`}
        </span>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-6">
        {marketplaces.map((mp, idx) => (
          <div key={mp._id || idx} className="card bg-ink-50 border border-ink-100 rounded-2xl p-5 flex flex-col relative overflow-hidden">
            {mp.isVerified && (
              <div className="absolute top-0 right-0 bg-green-100 text-green-800 text-[9px] font-black uppercase px-2 py-1 rounded-bl-lg flex items-center gap-1">
                <CheckCircle2 className="h-2.5 w-2.5" /> Verified
              </div>
            )}
            <h4 className="text-lg font-black text-ink-900 mb-2">{mp.marketplace}</h4>
            <div className="flex items-end gap-2 mb-3">
              <span className="text-2xl font-black text-ink-900">{formatINR(mp.price)}</span>
              {mp.mrp && <span className="text-sm font-semibold text-ink-400 line-through mb-0.5">{formatINR(mp.mrp)}</span>}
            </div>
            
            <div className="flex items-center gap-2 mb-4">
              {mp.discountPercentage > 0 ? (
                <span className="text-[10px] font-bold bg-green-100 text-green-800 px-2 py-0.5 rounded uppercase">
                  {mp.discountPercentage}% OFF
                </span>
              ) : null}
              {mp.savings > 0 ? (
                <span className="text-[10px] font-bold bg-accent-100 text-accent-800 px-2 py-0.5 rounded uppercase">
                  Save {formatINR(mp.savings)}
                </span>
              ) : null}
            </div>

            <a
              href={getStoreRedirectUrl(mp.marketplace, product || mp.productName, mp.url)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline py-2 px-4 text-xs mt-auto flex items-center justify-center gap-2"
            >
              VIEW DEAL <ArrowRight className="h-3 w-3" />
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}
