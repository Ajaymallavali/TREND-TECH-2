import React from 'react';
import { Zap, TrendingUp, ExternalLink } from 'lucide-react';
import { getStoreRedirectUrl } from '../../utils/storeUrlHelper';

export function DealMetricsCard({ identity, dealMetrics, bestDeal, preferredDeal, sourceInfo, formatINR }) {
  if (!dealMetrics) return null;

  return (
    <>
      {(identity.matchConfidence === 'EXACT' || identity.status === 'IDENTITY_VERIFIED' || identity.status === 'EXTERNAL_LIVE_VERIFIED') && (
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card bg-white p-5 border border-ink-100 rounded-2xl flex flex-col justify-center">
            <span className="text-[10px] font-bold text-ink-500 uppercase tracking-widest mb-1">Best Price</span>
            <span className="text-xl font-black text-ink-900">{formatINR(dealMetrics.bestPrice)}</span>
          </div>
          <div className="card bg-white p-5 border border-ink-100 rounded-2xl flex flex-col justify-center">
            <span className="text-[10px] font-bold text-ink-500 uppercase tracking-widest mb-1">Best Discount</span>
            <span className="text-xl font-black text-ink-900">{dealMetrics.bestDiscount ? `${dealMetrics.bestDiscount}% OFF` : 'N/A'}</span>
          </div>
          <div className="card bg-white p-5 border border-ink-100 rounded-2xl flex flex-col justify-center">
            <span className="text-[10px] font-bold text-ink-500 uppercase tracking-widest mb-1">Best Savings</span>
            <span className="text-xl font-black text-ink-900">{dealMetrics.bestSavings ? formatINR(dealMetrics.bestSavings) : 'N/A'}</span>
          </div>
          <div className="card bg-white p-5 border-accent-200 rounded-2xl flex flex-col justify-center bg-accent-50">
            <span className="text-[10px] font-bold text-accent-700 uppercase tracking-widest mb-1">Best Verified Deal</span>
            <span className="text-xl font-black text-accent-900 truncate">{bestDeal ? bestDeal.marketplace : 'None'}</span>
          </div>
        </section>
      )}

      {sourceInfo && sourceInfo.marketplace && sourceInfo.price && bestDeal && sourceInfo.marketplace !== bestDeal.marketplace && sourceInfo.price > bestDeal.price && (
        <section className="card bg-amber-50 p-6 border border-amber-200 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
          <div>
            <div className="flex items-center gap-2 text-amber-700 mb-1">
              <Zap className="h-4 w-4" />
              <span className="text-xs font-bold uppercase tracking-widest">Source vs Best Marketplace</span>
            </div>
            <p className="text-sm font-semibold text-amber-900 mt-2">
              The analyzed product is from <strong className="font-black">{sourceInfo.marketplace}</strong> ({formatINR(sourceInfo.price)}). A verified lower price was found on <strong className="font-black">{bestDeal.marketplace}</strong> ({formatINR(bestDeal.price)}).
            </p>
          </div>
          <div className="bg-white px-4 py-3 rounded-xl border border-amber-100 flex-shrink-0 text-center shadow-sm">
            <span className="block text-[10px] font-bold text-amber-600 uppercase">Potential Savings</span>
            <span className="block text-2xl font-black text-amber-600">{formatINR(sourceInfo.price - bestDeal.price)}</span>
          </div>
        </section>
      )}

      {preferredDeal && bestDeal && preferredDeal.marketplace !== bestDeal.marketplace && (
        <section className="bg-white p-6 border border-ink-100 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
          <div>
            <div className="flex items-center gap-2 text-ink-500 mb-1">
              <TrendingUp className="h-4 w-4" />
              <span className="text-xs font-bold uppercase tracking-widest">Preferred Store</span>
            </div>
            <h3 className="text-xl font-black text-ink-900">{preferredDeal.marketplace}</h3>
            <div className="flex items-end gap-2 mt-2">
              <span className="text-2xl font-black text-ink-900">{formatINR(preferredDeal.price)}</span>
              <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full mb-1">
                +{formatINR(preferredDeal.price - bestDeal.price)} compared to Best Deal
              </span>
            </div>
          </div>
          <a
            href={getStoreRedirectUrl(preferredDeal.marketplace, identity, preferredDeal.url)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline px-6 py-3 text-sm whitespace-nowrap flex items-center gap-2"
          >
            BUY NOW ON {preferredDeal.marketplace.toUpperCase()} <ExternalLink className="h-4 w-4" />
          </a>
        </section>
      )}
    </>
  );
}
