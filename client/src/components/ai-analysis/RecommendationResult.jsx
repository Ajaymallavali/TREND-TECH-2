import React from 'react';
import { Link } from 'react-router-dom';
import { Search, CheckCircle2, ExternalLink, ShieldAlert } from 'lucide-react';

export default function RecommendationResult({ data, formatINR }) {
  if (!data || data.status !== 'RECOMMENDATION_SUCCESS') return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <section className="card bg-ink-900 text-white p-6 md:p-8 rounded-2xl shadow-sm border border-ink-800">
        <h3 className="text-xs font-black text-ink-400 uppercase tracking-widest flex items-center gap-2 mb-4">
          <Search className="h-4 w-4 text-accent-400" /> Understood Request
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-[10px] text-ink-500 uppercase font-bold tracking-widest mb-1">Intent</p>
            <p className="text-sm font-black text-blue-400">{data.request.intent}</p>
          </div>
          <div>
            <p className="text-[10px] text-ink-500 uppercase font-bold tracking-widest mb-1">Category</p>
            <p className="text-sm font-black text-purple-400">{data.request.category || 'Any'}</p>
          </div>
          <div>
            <p className="text-[10px] text-ink-500 uppercase font-bold tracking-widest mb-1">Budget</p>
            <p className="text-sm font-black text-green-400">
              {data.request.budget ? (data.request.budget.maxPrice ? `Under ${formatINR(data.request.budget.maxPrice)}` : `Over ${formatINR(data.request.budget.minPrice)}`) : 'No limit'}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-ink-500 uppercase font-bold tracking-widest mb-1">Requirements</p>
            <div className="flex flex-wrap gap-1">
              {data.request.requirements && data.request.requirements.length > 0 ? (
                data.request.requirements.map((req, i) => (
                  <span key={i} className="text-[10px] bg-ink-800 text-ink-200 px-2 py-0.5 rounded uppercase font-bold border border-ink-700">{req}</span>
                ))
              ) : (
                <span className="text-sm font-bold text-ink-400">None</span>
              )}
            </div>
          </div>
        </div>
      </section>

      {data.recommendations && data.recommendations.length > 0 ? (
        <div className="space-y-6">
          <h3 className="text-lg font-black text-ink-900 uppercase tracking-widest flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" /> Recommended Products
          </h3>
          {data.recommendations.map((rec, idx) => (
            <section key={rec.product._id} className="card bg-white p-6 border border-ink-200 rounded-2xl flex flex-col md:flex-row gap-6 items-center shadow-sm relative overflow-hidden">
              {idx === 0 && (
                <div className="absolute top-0 right-0 bg-gradient-to-l from-accent-600 to-accent-800 text-white text-[10px] font-black px-4 py-1.5 uppercase tracking-widest shadow-sm">
                  Top Recommendation
                </div>
              )}
              <div className="w-full md:w-1/4 flex-shrink-0 bg-ink-50 p-4 rounded-xl border border-ink-100 flex items-center justify-center">
                <img src={rec.product.image} alt={rec.product.name} className="h-32 object-contain" />
              </div>
              <div className="flex-1 space-y-3">
                <div>
                  <span className="text-[10px] font-bold text-ink-500 uppercase tracking-widest">{rec.product.brand} • #{rec.rank} Match</span>
                  <h4 className="text-xl font-black text-ink-900">{rec.product.name}</h4>
                  {rec.requirementMatch && rec.requirementMatch.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {rec.requirementMatch.map(rm => (
                        <span key={rm} className="text-[10px] bg-green-50 text-green-700 border border-green-200 px-2 py-1 rounded-md uppercase font-bold flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" /> {rm}
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="text-sm text-ink-600 font-medium mt-2">{rec.explanation}</p>
                </div>
              </div>
              <div className="w-full md:w-1/4 flex flex-col items-end gap-3 text-right">
                <div>
                  <p className="text-[10px] font-bold text-ink-500 uppercase tracking-widest mb-1">Best Verified Deal</p>
                  <p className="text-2xl font-black text-ink-900">{formatINR(rec.deal.price)}</p>
                  {rec.deal.mrp > rec.deal.price && (
                    <p className="text-sm font-semibold text-ink-400 line-through">{formatINR(rec.deal.mrp)}</p>
                  )}
                </div>
                <div className="flex gap-2 w-full justify-end">
                  <Link to={`/compare?p1=${rec.product._id}`} className="btn-outline px-4 py-2 text-xs w-full text-center md:w-auto">
                    COMPARE
                  </Link>
                  <a href={rec.deal.url} target="_blank" rel="noopener noreferrer" className="btn-primary px-6 py-2 text-xs bg-accent-600 hover:bg-accent-700 text-white rounded-lg font-black w-full text-center md:w-auto flex items-center justify-center gap-1">
                    BUY NOW <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </section>
          ))}
        </div>
      ) : (
        <section className="bg-amber-50 border border-amber-200 p-8 rounded-2xl text-center shadow-sm">
          <ShieldAlert className="h-10 w-10 text-amber-500 mx-auto mb-3" />
          <h3 className="text-lg font-black text-amber-800">NO EXACT MATCHES FOUND</h3>
          <p className="text-sm font-medium text-amber-700 mt-2">{data.message || 'Try broadening your requirements or increasing your budget.'}</p>
        </section>
      )}
    </div>
  );
}
