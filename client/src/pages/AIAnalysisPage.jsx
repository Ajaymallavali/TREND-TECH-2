import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Sparkles, Search, Link as LinkIcon, Video, CheckCircle2, AlertTriangle, ArrowUpRight, TrendingUp, ChevronDown, ChevronUp, Star, ShieldCheck, Zap, Layers, Award } from 'lucide-react';
import { apiClient } from '../services/apiClient.js';
import ProductImage from '../components/ProductImage.jsx';

const formatINR = (val) => {
  if (val === null || val === undefined) return 'Price unavailable';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(val);
};

export default function AIAnalysisPage() {
  const [query, setQuery] = useState('');
  const [url, setUrl] = useState('');
  const [reelUrl, setReelUrl] = useState('');
  const [description, setDescription] = useState('');

  const [expandedStrength, setExpandedStrength] = useState(null);
  const [expandedLimitation, setExpandedLimitation] = useState(null);

  const mutation = useMutation({
    mutationFn: async (payload) => {
      const res = await apiClient.post('/products/analysis', payload);
      return res.data.data;
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim() && !url.trim() && !reelUrl.trim() && !description.trim()) return;
    mutation.mutate({ query, url, reelUrl, description });
  };

  const data = mutation.data;
  const isLoading = mutation.isPending;

  return (
    <div className="min-h-screen bg-ink-50">
      {/* Header */}
      <header className="border-b border-ink-100 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-accent-600" />
            <span className="text-lg font-semibold tracking-tight text-ink-900">TREND-TECH</span>
          </Link>
          <div className="flex items-center gap-4 text-xs font-semibold text-ink-600">
            <Link to="/" className="hover:text-ink-900">Home</Link>
            <Link to="/search" className="hover:text-ink-900">Search Catalog</Link>
            <Link to="/compare" className="hover:text-ink-900">Compare Tool</Link>
            <Link to="/analysis" className="text-accent-600 border-b-2 border-accent-600 pb-0.5">AI Analysis</Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-5xl px-6 py-10 space-y-10">
        
        {/* Banner Title */}
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-accent-50 px-3 py-1 text-xs font-bold text-accent-700 mb-3">
            <Sparkles className="h-3.5 w-3.5" />
            <span>AI Product Research & Deal Recommendation Engine</span>
          </div>
          <h1 className="text-3xl font-black text-ink-900 tracking-tight sm:text-4xl">
            Smart Product & Reel AI Analysis
          </h1>
          <p className="mt-2 text-xs text-ink-500 font-medium">
            Paste a product name, store link, or social review reel to extract exact products, compare prices across Indian stores, and get AI recommendation scores.
          </p>
        </div>

        {/* STEP 1: Input Form */}
        <section className="card bg-white p-6 shadow-sm border border-ink-100 rounded-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-ink-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Search className="h-3.5 w-3.5 text-accent-600" /> Product Name or Query
                </label>
                <input
                  type="text"
                  placeholder="e.g. iPhone 15 Pro Max, Galaxy S24, MacBook Air..."
                  className="input-field text-xs py-2"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-ink-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <LinkIcon className="h-3.5 w-3.5 text-accent-600" /> Store Product URL
                </label>
                <input
                  type="url"
                  placeholder="https://www.amazon.in/dp/..."
                  className="input-field text-xs py-2"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-ink-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Video className="h-3.5 w-3.5 text-red-500" /> Social / Review Reel URL (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://www.instagram.com/reel/... or YouTube link"
                  className="input-field text-xs py-2"
                  value={reelUrl}
                  onChange={(e) => setReelUrl(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-ink-700 uppercase tracking-wider mb-1.5">
                  Additional Details / Specs Context
                </label>
                <input
                  type="text"
                  placeholder="e.g. 256GB storage variant, under ₹1,20,000 budget"
                  className="input-field text-xs py-2"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary py-2.5 px-6 text-xs font-bold flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Analyzing Source Content...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>Run AI Analysis Workflow</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </section>

        {/* STEP 2: Research Progress Display */}
        {isLoading && (
          <section className="card bg-white p-6 border border-accent-200 rounded-2xl shadow-sm space-y-4 animate-pulse">
            <h3 className="text-sm font-bold text-ink-900 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-accent-600 animate-bounce" /> Research Progress
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-3 text-accent-700 font-semibold">
                <CheckCircle2 className="h-4 w-4 text-accent-600" />
                <span>1. Reading source content & parameters...</span>
              </div>
              <div className="flex items-center gap-3 text-accent-700 font-semibold">
                <CheckCircle2 className="h-4 w-4 text-accent-600" />
                <span>2. Extracting & identifying mentioned electronics...</span>
              </div>
              <div className="flex items-center gap-3 text-accent-700 font-semibold">
                <CheckCircle2 className="h-4 w-4 text-accent-600" />
                <span>3. Matching exact product models against canonical catalog...</span>
              </div>
              <div className="flex items-center gap-3 text-accent-700 font-semibold">
                <CheckCircle2 className="h-4 w-4 text-accent-600" />
                <span>4. Collecting verified technical specifications...</span>
              </div>
              <div className="flex items-center gap-3 text-accent-700 font-semibold">
                <CheckCircle2 className="h-4 w-4 text-accent-600" />
                <span>5. Comparing marketplace prices across Indian retailers...</span>
              </div>
              <div className="flex items-center gap-3 text-accent-700 font-semibold">
                <CheckCircle2 className="h-4 w-4 text-accent-600" />
                <span>6. Computing AI evaluation scores & key strengths...</span>
              </div>
              <div className="flex items-center gap-3 text-accent-700 font-semibold">
                <CheckCircle2 className="h-4 w-4 text-accent-600" />
                <span>7. Generating final recommendation & category rankings...</span>
              </div>
            </div>
          </section>
        )}

        {/* ANALYSIS RESULTS */}
        {data && (
          <div className="space-y-12">
            
            {data.analyzedProducts.map((item, idx) => {
              const p = item.product;
              const scores = item.aiScores;

              return (
                <div key={p._id || idx} className="space-y-8 border-b border-ink-100 pb-10">
                  
                  {/* Candidate Header */}
                  <div className="card bg-white p-6 border border-ink-100 rounded-2xl flex flex-col md:flex-row gap-6 items-start">
                    
                    <div className="w-full md:w-48 flex-shrink-0">
                      <ProductImage src={p.image} alt={p.name} category={p.category} aspectClassName="aspect-square" />
                    </div>

                    {/* Product Details & Lowest Price */}
                    <div className="flex-grow space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-accent-700 bg-accent-50 border border-accent-100 px-2 py-0.5 rounded">
                          {p.brand}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-ink-500 bg-ink-50 px-2 py-0.5 rounded">
                          {p.category}
                        </span>
                      </div>

                      <h2 className="text-xl font-extrabold text-ink-900 tracking-tight">
                        {p.name}
                      </h2>

                      <p className="text-xs text-ink-500 leading-relaxed">
                        {p.description}
                      </p>

                      {/* Lowest Price Banner */}
                      <div className="pt-2 flex flex-wrap items-center gap-4">
                        <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-2">
                          <span className="block text-[9px] font-bold text-green-700 uppercase">Lowest Verified Price</span>
                          <span className="text-xl font-black text-green-700">{formatINR(item.lowestPrice)}</span>
                          {item.cheapestMarketplace && (
                            <span className="block text-[10px] font-semibold text-green-800">on {item.cheapestMarketplace}</span>
                          )}
                        </div>

                        {/* Overall AI Score */}
                        <div className="bg-accent-50 border border-accent-200 rounded-xl px-4 py-2">
                          <span className="block text-[9px] font-bold text-accent-800 uppercase">AI Analysis Score</span>
                          <span className="text-xl font-black text-accent-700">
                            {typeof scores.overallValue === 'number' ? `${scores.overallValue} / 100` : scores.overallValue}
                          </span>
                          <span className="block text-[10px] font-semibold text-accent-800">Overall Value Score</span>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* STEP 4: Price Comparison Table */}
                  <section className="card bg-white p-6 border border-ink-100 rounded-2xl space-y-4">
                    <h3 className="text-sm font-bold text-ink-900 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-accent-600" /> Verified Marketplace Offers
                    </h3>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-ink-100 bg-ink-50/50 text-ink-500 font-bold uppercase text-[10px]">
                            <th className="py-2.5 px-3">Store</th>
                            <th className="py-2.5 px-3">Current Price</th>
                            <th className="py-2.5 px-3">Stock Status</th>
                            <th className="py-2.5 px-3 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-ink-50">
                          {item.offers.map((offer) => (
                            <tr key={offer._id || offer.marketplace} className="hover:bg-ink-50/40">
                              <td className="py-3 px-3 font-semibold text-ink-900 flex items-center gap-2">
                                {offer.logoUrl && <img src={offer.logoUrl} alt={offer.marketplace} className="h-4 w-auto object-contain" />}
                                {offer.marketplace}
                              </td>
                              <td className="py-3 px-3 font-bold text-ink-900">
                                {formatINR(offer.currentPrice)}
                              </td>
                              <td className="py-3 px-3">
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                                  In Stock
                                </span>
                              </td>
                              <td className="py-3 px-3 text-right">
                                <a
                                  href={offer.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="btn-primary py-1 px-3 text-[11px] font-semibold inline-flex items-center gap-1"
                                >
                                  Compare Offers <ArrowUpRight className="h-3 w-3" />
                                </a>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </section>

                  {/* STEP 5: AI Evaluation Scores Grid */}
                  <section className="card bg-white p-6 border border-ink-100 rounded-2xl space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-ink-900 flex items-center gap-2">
                        <Award className="h-4 w-4 text-accent-600" /> AI Analysis Scores
                      </h3>
                      <span className="text-[10px] font-bold text-ink-400 uppercase tracking-wider">
                        Derived from specs & market data
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-center">
                      <div className="p-3 bg-ink-50/60 rounded-xl border border-ink-100">
                        <span className="block text-[10px] font-bold text-ink-500 uppercase">Performance</span>
                        <span className="text-lg font-black text-ink-900">{scores.performance}</span>
                      </div>
                      <div className="p-3 bg-ink-50/60 rounded-xl border border-ink-100">
                        <span className="block text-[10px] font-bold text-ink-500 uppercase">Features</span>
                        <span className="text-lg font-black text-ink-900">{scores.features}</span>
                      </div>
                      <div className="p-3 bg-ink-50/60 rounded-xl border border-ink-100">
                        <span className="block text-[10px] font-bold text-ink-500 uppercase">Build Quality</span>
                        <span className="text-lg font-black text-ink-900">{scores.buildQuality}</span>
                      </div>
                      <div className="p-3 bg-ink-50/60 rounded-xl border border-ink-100">
                        <span className="block text-[10px] font-bold text-ink-500 uppercase">Ease of Use</span>
                        <span className="text-lg font-black text-ink-900">{scores.easeOfUse}</span>
                      </div>
                      <div className="p-3 bg-ink-50/60 rounded-xl border border-ink-100">
                        <span className="block text-[10px] font-bold text-ink-500 uppercase">Price Value</span>
                        <span className="text-lg font-black text-ink-900">{scores.priceToPerformance}</span>
                      </div>
                      <div className="p-3 bg-ink-50/60 rounded-xl border border-ink-100">
                        <span className="block text-[10px] font-bold text-ink-500 uppercase">Availability</span>
                        <span className="text-lg font-black text-ink-900">{scores.availability}</span>
                      </div>
                    </div>
                  </section>

                  {/* STEP 6 & 7: Strengths & Limitations */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Strengths */}
                    <div className="card bg-white p-6 border border-green-100 rounded-2xl space-y-3">
                      <h3 className="text-sm font-bold text-green-800 flex items-center gap-1.5">
                        <CheckCircle2 className="h-4 w-4 text-green-600" /> Key Strengths
                      </h3>

                      <div className="space-y-2">
                        {item.strengths.map((s, idx) => (
                          <div key={idx} className="border border-green-100 bg-green-50/30 rounded-xl p-3 text-xs">
                            <button
                              onClick={() => setExpandedStrength(expandedStrength === idx ? null : idx)}
                              className="w-full flex items-center justify-between font-bold text-green-900 text-left"
                            >
                              <span>✓ {s.title}</span>
                              {expandedStrength === idx ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                            </button>
                            {expandedStrength === idx && (
                              <p className="mt-2 text-[11px] text-green-800 leading-relaxed border-t border-green-100 pt-2">
                                {s.detail}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Limitations */}
                    <div className="card bg-white p-6 border border-red-100 rounded-2xl space-y-3">
                      <h3 className="text-sm font-bold text-red-800 flex items-center gap-1.5">
                        <AlertTriangle className="h-4 w-4 text-red-600" /> Key Limitations
                      </h3>

                      <div className="space-y-2">
                        {item.limitations.map((l, idx) => (
                          <div key={idx} className="border border-red-100 bg-red-50/30 rounded-xl p-3 text-xs">
                            <button
                              onClick={() => setExpandedLimitation(expandedLimitation === idx ? null : idx)}
                              className="w-full flex items-center justify-between font-bold text-red-900 text-left"
                            >
                              <span>✕ {l.title}</span>
                              {expandedLimitation === idx ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                            </button>
                            {expandedLimitation === idx && (
                              <p className="mt-2 text-[11px] text-red-800 leading-relaxed border-t border-red-100 pt-2">
                                {l.detail}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>

                  {/* STEP 8: Better Alternatives */}
                  {item.alternatives.length > 0 && (
                    <section className="card bg-white p-6 border border-ink-100 rounded-2xl space-y-4">
                      <h3 className="text-sm font-bold text-ink-900 flex items-center gap-2">
                        <Zap className="h-4 w-4 text-accent-600" /> See Better Options
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {item.alternatives.map((alt) => (
                          <div key={alt._id} className="border border-ink-100 bg-ink-50/30 rounded-xl p-4 flex flex-col justify-between space-y-3">
                            <div>
                              <div className="h-28 bg-white rounded-lg border p-1 mb-2 flex items-center justify-center">
                                {alt.image ? (
                                  <img src={alt.image} alt={alt.name} className="h-full w-auto max-h-[90px] object-contain" />
                                ) : (
                                  <span className="text-[10px] text-ink-400">No Image</span>
                                )}
                              </div>
                              <span className="text-[9px] font-bold uppercase text-ink-400">{alt.brand}</span>
                              <h4 className="font-bold text-xs text-ink-900 line-clamp-1">{alt.name}</h4>
                              <span className="text-xs font-black text-accent-700 mt-1 block">{formatINR(alt.lowestPrice)}</span>
                            </div>

                            <div className="pt-2 border-t border-ink-100">
                              <p className="text-[10px] text-ink-500 line-clamp-2">{alt.whyBetter}</p>
                              <Link
                                to={`/product/${alt._id}`}
                                className="btn-secondary py-1 text-center w-full block text-[10px] font-semibold mt-2"
                              >
                                View Product
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                </div>
              );
            })}

            {/* STEP 9: Top Category Overall */}
            {data.topOverall.length > 0 && (
              <section className="card bg-white p-6 border border-ink-100 rounded-2xl space-y-4">
                <h3 className="text-sm font-bold text-ink-900 flex items-center gap-2">
                  <Layers className="h-4 w-4 text-accent-600" /> Top {data.topOverallCategory.toUpperCase()} Overall Rankings
                </h3>

                <div className="space-y-2">
                  {data.topOverall.map((topP, idx) => (
                    <div key={topP._id} className="flex items-center justify-between p-3 border border-ink-100 rounded-xl bg-ink-50/30 text-xs">
                      <div className="flex items-center gap-3">
                        <span className="h-6 w-6 rounded-full bg-accent-600 text-white font-bold flex items-center justify-center text-xs">
                          #{idx + 1}
                        </span>
                        <div>
                          <span className="font-bold text-ink-900 block">{topP.name}</span>
                          <span className="text-[10px] text-ink-400 uppercase font-semibold">{topP.brand}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="font-bold text-accent-700">{formatINR(topP.lowestPrice)}</span>
                        <Link to={`/product/${topP._id}`} className="btn-secondary py-1 px-3 text-[10px] font-semibold">
                          Compare Offers
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

          </div>
        )}

      </main>
    </div>
  );
}
