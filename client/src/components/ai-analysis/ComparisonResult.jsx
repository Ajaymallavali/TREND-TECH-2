import React from 'react';
import { Zap, ArrowRight } from 'lucide-react';
import { getStoreRedirectUrl } from '../../utils/storeUrlHelper';

export default function ComparisonResult({ data, formatINR }) {
  if (!data || data.status !== 'COMPARISON_SUCCESS') return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <h3 className="text-xl font-black text-ink-900 uppercase tracking-widest flex items-center gap-2 mb-4">
        <Zap className="h-6 w-6 text-accent-600" /> Product Comparison
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {data.comparison.map((c, idx) => (
          <section key={c.product._id} className="card bg-white p-6 md:p-8 border border-ink-200 rounded-2xl flex flex-col items-center text-center shadow-sm">
            <div className="bg-ink-50 p-6 w-full rounded-xl border border-ink-100 flex items-center justify-center mb-6 h-48">
              <img src={c.product.image} alt={c.product.name} className="h-full object-contain" />
            </div>
            <span className="text-[10px] font-bold text-ink-500 uppercase tracking-widest mb-1">{c.product.brand}</span>
            <h4 className="text-2xl font-black text-ink-900 mb-2">{c.product.name}</h4>
            
            {c.deal ? (
              <div className="bg-green-50 border border-green-200 p-4 rounded-xl w-full mb-6">
                <p className="text-[10px] font-bold text-green-800 uppercase tracking-widest mb-1">Verified Deal on {c.deal.marketplace}</p>
                <p className="text-3xl font-black text-green-900">{formatINR(c.deal.price)}</p>
                <a href={getStoreRedirectUrl(c.deal.marketplace, c.product, c.deal.url)} target="_blank" rel="noopener noreferrer" className="btn-primary mt-4 w-full bg-accent-600 hover:bg-accent-700 text-white rounded-lg py-3 text-sm font-black flex items-center justify-center gap-2">
                  BUY NOW <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            ) : (
              <div className="bg-ink-50 border border-ink-200 p-4 rounded-xl w-full mb-6">
                <p className="text-sm font-bold text-ink-500 uppercase tracking-widest">No Verified Offers</p>
              </div>
            )}

            <div className="w-full text-left space-y-3">
              <p className="text-xs font-bold text-ink-500 uppercase tracking-widest mb-2 border-b border-ink-100 pb-1">Key Specifications</p>
              {Object.entries(c.product.specs || {}).slice(0, 6).map(([k, v]) => (
                <div key={k} className="flex justify-between items-center text-sm">
                  <span className="font-semibold text-ink-600">{k}</span>
                  <span className="font-black text-ink-900">{v}</span>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
