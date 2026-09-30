import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  Search, Link as LinkIcon, AlertTriangle, CheckCircle2,
  TrendingUp, Play, Zap, ArrowRight, ExternalLink,
  ShieldAlert, ShieldCheck, HelpCircle, Activity
} from 'lucide-react';
import { apiClient } from '../services/apiClient';

function formatINR(price) {
  if (price == null) return 'Unavailable';
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);
}

export default function AIAnalysisPage() {
  const [inputData, setInputData] = useState('');
  const [contextData, setContextData] = useState('');
  const [preferredStore, setPreferredStore] = useState('Any');
  
  const [progressStages, setProgressStages] = useState([]);

  const { data: searchSuggestions } = useQuery({
    queryKey: ['suggestions', inputData],
    queryFn: async () => {
      if (inputData.length < 3 || inputData.startsWith('http')) return [];
      const res = await apiClient.get(`/products?q=${encodeURIComponent(inputData)}`);
      return res.data.data || [];
    },
    enabled: inputData.length >= 3 && !inputData.startsWith('http'),
  });

  const mutation = useMutation({
    mutationFn: async (payload) => {
      const res = await apiClient.post('/products/analysis', payload);
      return res.data.data;
    },
    onMutate: () => {
      setProgressStages([
        'Analyzing product...',
        '✓ Input recognized',
        '✓ Product identified'
      ]);
      setTimeout(() => setProgressStages(prev => [...prev, '✓ Exact model checked', '✓ Image verified']), 800);
      setTimeout(() => setProgressStages(prev => [...prev, '✓ Marketplace offers checked', '✓ Prices verified']), 1500);
      setTimeout(() => setProgressStages(prev => [...prev, '✓ Discounts calculated', '✓ Best deal identified', '✓ AI research prepared']), 2200);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputData.trim()) return;

    let payload = { description: contextData, preferredStore: preferredStore };
    const isUrl = inputData.startsWith('http://') || inputData.startsWith('https://');
    
    if (isUrl) {
      payload.url = inputData.trim();
    } else {
      payload.query = inputData.trim();
    }
    
    mutation.mutate(payload);
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
            <Zap className="h-3.5 w-3.5" />
            <span>REAL Product Research & Deal Comparison Engine</span>
          </div>
          <h1 className="text-3xl font-black text-ink-900 tracking-tight sm:text-4xl">
            TREND-TECH AI PRODUCT RESEARCH
          </h1>
          <p className="mt-2 text-xs text-ink-500 font-medium">
            Enter a product name, model, or paste a store link to extract exact product identity, compare real verified offers across Indian marketplaces, and discover the absolute lowest verified price.
          </p>
        </div>

        {/* STEP 1: Input Form */}
        <section className="card bg-white p-6 shadow-sm border border-ink-100 rounded-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-xs font-bold text-ink-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Search className="h-3.5 w-3.5 text-accent-600" /> Product Name, Model, or Store URL
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="e.g. Samsung Galaxy S25 Ultra OR https://www.amazon.in/dp/..."
                    className="input-field text-xs py-2 w-full"
                    value={inputData}
                    onChange={(e) => setInputData(e.target.value)}
                    disabled={isLoading}
                    list="product-suggestions"
                    autoComplete="off"
                  />
                  {inputData.length > 2 && !inputData.startsWith('http') && searchSuggestions && searchSuggestions.length > 0 && (
                    <datalist id="product-suggestions">
                      {searchSuggestions.slice(0, 10).map((prod) => (
                        <option key={prod._id} value={prod.name} />
                      ))}
                    </datalist>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-ink-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Activity className="h-3.5 w-3.5 text-ink-400" /> Additional Details / Specs Context
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 256GB under ₹80,000"
                    className="input-field text-xs py-2 border-dashed w-full"
                    value={contextData}
                    onChange={(e) => setContextData(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-ink-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <TrendingUp className="h-3.5 w-3.5 text-ink-400" /> Preferred Store
                  </label>
                  <select
                    className="input-field text-xs py-2 w-full"
                    value={preferredStore}
                    onChange={(e) => setPreferredStore(e.target.value)}
                    disabled={isLoading}
                  >
                    <option value="Any">Any Verified Store</option>
                    <option value="Amazon">Amazon</option>
                    <option value="Flipkart">Flipkart</option>
                    <option value="Myntra">Myntra</option>
                    <option value="Croma">Croma</option>
                  </select>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !inputData.trim()}
              className="btn-primary w-full py-3 text-sm mt-4 flex items-center justify-center gap-2"
            >
              {isLoading ? 'Analyzing...' : 'Run Product Analysis & Deal Comparison'}
            </button>
          </form>
        </section>

        {/* LOADING PROGRESS */}
        {isLoading && (
          <section className="card bg-white p-8 border border-ink-100 rounded-2xl text-center shadow-sm animate-in fade-in duration-500">
            <div className="flex justify-center mb-6">
              <Zap className="h-10 w-10 text-accent-600 animate-pulse" />
            </div>
            <div className="space-y-3 max-w-sm mx-auto text-left">
              {progressStages.map((stage, idx) => (
                <p key={idx} className={`text-sm font-bold ${stage.startsWith('✓') ? 'text-green-600' : 'text-ink-600'} animate-in fade-in slide-in-from-bottom-2 duration-300 flex items-center gap-2`}>
                  {stage}
                </p>
              ))}
            </div>
          </section>
        )}

        {/* ERROR STATE */}
        {!isLoading && mutation.isError && (
          <section className="card bg-red-50 p-8 border border-red-200 rounded-2xl text-center space-y-4">
            <AlertTriangle className="h-10 w-10 text-red-500 mx-auto" />
            <h2 className="text-lg font-black text-red-900">Unable to analyze this product right now.</h2>
            <p className="text-sm text-red-700 font-medium">
              Please check your connection or try again later.
            </p>
            <button onClick={handleSubmit} className="btn-primary py-2 px-6 text-xs mt-2">
              Retry
            </button>
          </section>
        )}

        {/* LOGICAL ERROR STATE */}
        {!isLoading && !mutation.isError && data && data.status !== 'SUCCESS' && data.status !== 'SUCCESS_EXTERNAL' && (
          <section className="card bg-red-50 p-8 border border-red-200 rounded-2xl text-center space-y-3">
            <AlertTriangle className="h-10 w-10 text-red-500 mx-auto" />
            <h2 className="text-lg font-black text-red-900">{data.status === 'INVALID_URL' ? 'Invalid Product URL' : 'Product Not Found'}</h2>
            <p className="text-sm text-red-700 font-medium">
              {data.error || 'We could not securely match this to a verified product identity in our catalog.'}
            </p>
          </section>
        )}

        {/* SUCCESS RESULT STATE */}
        {!isLoading && !mutation.isError && data && (data.status === 'SUCCESS' || data.status === 'SUCCESS_EXTERNAL') && data.product && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* 1. PRODUCT IDENTIFIED */}
            <section className="card bg-white p-6 md:p-8 border border-ink-100 rounded-2xl flex flex-col md:flex-row gap-8 items-start">
              <div className="w-full md:w-1/3 flex-shrink-0">
                <div className="aspect-square bg-ink-50 rounded-2xl border border-ink-100 p-6 flex items-center justify-center relative">
                  {data.image.status === 'VERIFIED_EXACT' ? (
                    <img src={data.image.url} alt={data.product.name} className="h-full w-full object-contain" />
                  ) : (
                    <div className="text-center text-ink-400 space-y-2">
                      <HelpCircle className="h-8 w-8 mx-auto opacity-50" />
                      <p className="text-xs font-semibold">Image pending verification.</p>
                    </div>
                  )}
                  {data.identity.status === 'IDENTITY_VERIFIED' ? (
                    <span className="absolute top-3 right-3 bg-green-100 text-green-800 text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3" /> Catalog Verified
                    </span>
                  ) : data.identity.status === 'EXTERNAL_LIVE_VERIFIED' ? (
                    <span className="absolute top-3 right-3 bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3" /> External Live Result
                    </span>
                  ) : (
                    <span className="absolute top-3 right-3 bg-yellow-100 text-yellow-800 text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1">
                      <ShieldAlert className="h-3 w-3" /> Identity Ambiguous
                    </span>
                  )}
                </div>
              </div>

              <div className="w-full space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold uppercase tracking-widest text-ink-400">{data.product.brand}</span>
                    {data.sourceInfo && data.sourceInfo.marketplace && (
                      <span className="text-[10px] font-bold uppercase tracking-widest bg-ink-100 text-ink-700 px-2 py-0.5 rounded-full border border-ink-200">
                        SOURCE: {data.sourceInfo.marketplace}
                      </span>
                    )}
                  </div>
                  <h2 className="text-2xl font-black text-ink-900">{data.product.name}</h2>
                  <p className="text-sm text-ink-500 font-medium mt-1">
                    {data.product.category} • Variant: {data.product.variant}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {data.product.specifications && Object.entries(data.product.specifications).slice(0, 4).map(([k, v]) => (
                    <div key={k} className="p-3 bg-ink-50 rounded-xl border border-ink-100">
                      <span className="block text-[10px] font-bold text-ink-500 uppercase">{k}</span>
                      <span className="text-xs font-semibold text-ink-900">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* AI RESEARCH SECTIONS */}
            {data.research && (
              <section className="space-y-6">
                {/* AI VERDICT */}
                <div className="card bg-white p-6 border border-ink-100 rounded-2xl">
                  <h3 className="text-xs font-black text-ink-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Zap className="h-4 w-4 text-accent-600" /> AI Verdict
                  </h3>
                  <p className="text-sm font-medium text-ink-800 leading-relaxed bg-ink-50 p-4 rounded-xl border border-ink-100">
                    {data.research.verdict}
                  </p>
                  {data.research.bestFor && data.research.bestFor.length > 0 && (
                    <div className="mt-4 flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-bold text-ink-500 uppercase tracking-widest">Best For:</span>
                      {data.research.bestFor.map(b => (
                        <span key={b} className="text-xs font-bold bg-white border border-ink-200 text-ink-700 px-3 py-1 rounded-full shadow-sm">
                          {b}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* PROS */}
                  <div className="card bg-white p-6 border border-green-200 rounded-2xl">
                    <h3 className="text-xs font-black text-green-700 uppercase tracking-widest mb-4">Pros</h3>
                    <ul className="space-y-3">
                      {data.research.pros.map((p, idx) => (
                        <li key={idx} className="text-sm font-semibold text-green-900 flex items-start gap-2">
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* WATCH OUT FOR */}
                  <div className="card bg-white p-6 border border-amber-200 rounded-2xl">
                    <h3 className="text-xs font-black text-amber-700 uppercase tracking-widest mb-4">Watch Out For</h3>
                    <ul className="space-y-3">
                      {data.research.watchOutFor.map((w, idx) => (
                        <li key={idx} className="text-sm font-semibold text-amber-900 flex items-start gap-2">
                          {w}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* KEY SPECS */}
                <div className="card bg-white p-6 border border-ink-100 rounded-2xl">
                  <h3 className="text-xs font-black text-ink-400 uppercase tracking-widest mb-4">Key Specs</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {Object.entries(data.specs || {}).map(([k, v]) => (
                      <div key={k} className="bg-ink-50 p-3 rounded-xl border border-ink-100 flex flex-col justify-center">
                        <p className="text-[10px] font-bold text-ink-400 uppercase mb-1">{k}</p>
                        <p className="text-xs font-semibold text-ink-900 line-clamp-2" title={v}>{v}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* SOURCES */}
                {data.sources && data.sources.length > 0 && (
                  <div className="card bg-white p-6 border border-ink-100 rounded-2xl">
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
                  </div>
                )}
              </section>
            )}

            {/* 2. BEST VERIFIED DEAL */}
            {data.bestDeal && (
              <section className="bg-gradient-to-r from-accent-600 to-accent-800 text-white p-6 md:p-8 rounded-2xl shadow-lg border border-accent-700 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-2 text-center md:text-left w-full">
                  <div className="flex items-center justify-center md:justify-start gap-2 text-accent-200">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="text-xs font-bold uppercase tracking-widest">Best Verified Deal</span>
                  </div>
                  <h3 className="text-3xl font-black">{data.bestDeal.marketplace}</h3>
                  
                  <div className="flex items-end justify-center md:justify-start gap-3 mt-4">
                    <span className="text-4xl font-black">{formatINR(data.bestDeal.price)}</span>
                    {data.bestDeal.discountPercentage && (
                      <span className="text-lg text-accent-200 line-through mb-1">
                        {formatINR(data.bestDeal.mrp)}
                      </span>
                    )}
                  </div>
                  
                  {data.bestDeal.savings && (
                    <p className="text-sm font-semibold text-accent-100 bg-accent-900/40 inline-block px-3 py-1 rounded-full mt-2">
                      Save {formatINR(data.bestDeal.savings)} ({data.bestDeal.discountPercentage}% OFF)
                    </p>
                  )}
                  
                  {data.sourceInfo && data.sourceInfo.marketplace && data.sourceInfo.price && data.sourceInfo.marketplace !== data.bestDeal.marketplace && data.sourceInfo.price > data.bestDeal.price && (
                    <p className="text-xs font-bold text-amber-300 mt-2 block">
                      Save {formatINR(data.sourceInfo.price - data.bestDeal.price)} compared with your {data.sourceInfo.marketplace} link
                    </p>
                  )}
                  
                  {data.marketplaces.filter(mp => mp.isVerified && mp.price).length > 1 && (() => {
                    const verifiedPrices = data.marketplaces.filter(mp => mp.isVerified && mp.price).map(mp => mp.price);
                    const highestVerified = Math.max(...verifiedPrices);
                    const lowestVerified = Math.min(...verifiedPrices);
                    if (highestVerified > lowestVerified && data.bestDeal.price === lowestVerified) {
                      return (
                        <p className="text-xs font-medium text-accent-200 mt-2">
                          Save {formatINR(highestVerified - lowestVerified)} compared with the highest verified offer
                        </p>
                      );
                    }
                    return null;
                  })()}
                </div>

                <div className="w-full md:w-auto flex-shrink-0">
                  <a
                    href={data.bestDeal.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white text-accent-800 px-8 py-4 rounded-xl font-black text-lg w-full flex items-center justify-center gap-2 hover:bg-accent-50 transition-colors shadow-sm"
                  >
                    BUY NOW <ArrowRight className="h-5 w-5" />
                  </a>
                </div>
              </section>
            )}

            {/* PREFERRED STORE SECTION */}
            {data.preferredDeal && data.bestDeal && data.preferredDeal.marketplace !== data.bestDeal.marketplace && (
              <section className="bg-white p-6 border border-ink-100 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
                <div>
                  <div className="flex items-center gap-2 text-ink-500 mb-1">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-xs font-bold uppercase tracking-widest">Preferred Store</span>
                  </div>
                  <h3 className="text-xl font-black text-ink-900">{data.preferredDeal.marketplace}</h3>
                  <div className="flex items-end gap-2 mt-2">
                    <span className="text-2xl font-black text-ink-900">{formatINR(data.preferredDeal.price)}</span>
                    <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full mb-1">
                      +{formatINR(data.preferredDeal.price - data.bestDeal.price)} compared to Best Deal
                    </span>
                  </div>
                </div>
                <a
                  href={data.preferredDeal.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-outline px-6 py-3 text-sm whitespace-nowrap flex items-center gap-2"
                >
                  BUY NOW ON {data.preferredDeal.marketplace.toUpperCase()} <ExternalLink className="h-4 w-4" />
                </a>
              </section>
            )}

            {/* 3. COMPARE STORES */}
            <section className="card bg-white p-6 border border-ink-100 rounded-2xl space-y-4 overflow-x-auto">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h3 className="text-sm font-bold text-ink-900 uppercase flex items-center gap-2">
                  <Zap className="h-4 w-4 text-accent-600" /> Compare Stores
                </h3>
                <span className="text-xs font-semibold text-ink-500 bg-ink-50 px-3 py-1 rounded-full border border-ink-100">
                  {data.marketplaces.filter(mp => mp.isVerified).length === 1 
                    ? "1 verified marketplace offer" 
                    : `${data.marketplaces.filter(mp => mp.isVerified).length} verified marketplace offers compared`}
                </span>
              </div>
              
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-ink-100">
                    <th className="py-3 px-4 text-xs font-bold text-ink-500 uppercase">Marketplace</th>
                    <th className="py-3 px-4 text-xs font-bold text-ink-500 uppercase">Price</th>
                    <th className="py-3 px-4 text-xs font-bold text-ink-500 uppercase">Discount</th>
                    <th className="py-3 px-4 text-xs font-bold text-ink-500 uppercase">Savings</th>
                    <th className="py-3 px-4 text-xs font-bold text-ink-500 uppercase">Status</th>
                    <th className="py-3 px-4 text-xs font-bold text-ink-500 uppercase text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-50">
                  {data.marketplaces.map((mp, idx) => (
                    <tr key={mp._id || idx} className="hover:bg-ink-50/50">
                      <td className="py-4 px-4 font-bold text-ink-900 text-sm">{mp.marketplace}</td>
                      <td className="py-4 px-4 font-black text-ink-900">
                        {formatINR(mp.price)}
                        {mp.mrp && <span className="block text-[10px] text-ink-400 line-through font-medium">{formatINR(mp.mrp)}</span>}
                      </td>
                      <td className="py-4 px-4">
                        {mp.discountPercentage ? (
                          <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded">{mp.discountPercentage}% OFF</span>
                        ) : (
                          <span className="text-xs text-ink-400">—</span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        {mp.savings ? (
                          <span className="text-xs font-semibold text-ink-700">{formatINR(mp.savings)}</span>
                        ) : (
                          <span className="text-xs text-ink-400">—</span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded ${mp.availability === 'Available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {mp.availability}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        {mp.availability === 'Available' && mp.url ? (
                          <a href={mp.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 btn-secondary py-1.5 px-3 text-[11px] font-bold">
                            VIEW DEAL <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          <span className="text-xs font-semibold text-ink-400">Unavailable</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {data.marketplaces.length === 0 && (
                    <tr>
                      <td colSpan="6" className="py-12 text-center text-sm font-medium text-ink-500">
                        No verified deals currently available for this exact product model.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* COVERAGE FOOTER */}
              <div className="mt-4 pt-4 border-t border-ink-100 flex flex-wrap gap-4 text-[10px] font-semibold">
                <div className="flex items-center gap-2">
                  <span className="text-ink-500 uppercase">Checked:</span>
                  <div className="flex gap-2 text-green-700">
                    {data.coverage.checked.map(c => <span key={c} className="flex items-center gap-0.5"><CheckCircle2 className="h-3 w-3" /> {c}</span>)}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-ink-500 uppercase">Unavailable:</span>
                  <div className="flex gap-2 text-ink-400">
                    {data.coverage.unavailable.map(c => <span key={c}>— {c}</span>)}
                  </div>
                </div>
              </div>
            </section>

            {/* VERIFICATION DETAILS */}
            <section className="card bg-ink-900 p-6 border border-ink-800 rounded-2xl space-y-4 shadow-sm text-white">
              <h3 className="text-xs font-black text-ink-300 uppercase tracking-widest flex items-center gap-2 mb-4">
                <ShieldCheck className="h-4 w-4 text-green-400" /> Verification Details
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="space-y-1">
                  <p className="text-[10px] text-ink-400 uppercase font-bold tracking-widest">Product Identity</p>
                  <p className="text-xs font-black text-green-400">{data.identity.matchConfidence}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-ink-400 uppercase font-bold tracking-widest">Image</p>
                  <p className={`text-xs font-black ${data.image.status === 'VERIFIED_EXACT' ? 'text-green-400' : 'text-amber-400'}`}>
                    {data.image.status.replace('_', ' ')}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-ink-400 uppercase font-bold tracking-widest">Price</p>
                  <p className="text-xs font-black text-green-400">VERIFIED</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-ink-400 uppercase font-bold tracking-widest">Marketplace</p>
                  <p className="text-xs font-black text-green-400">VERIFIED</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-ink-400 uppercase font-bold tracking-widest">Store URL</p>
                  <p className="text-xs font-black text-green-400">VALIDATED</p>
                </div>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
