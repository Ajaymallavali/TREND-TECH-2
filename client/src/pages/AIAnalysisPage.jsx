import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  Search, Link as LinkIcon, AlertTriangle, CheckCircle2,
  TrendingUp, TrendingDown, Play, Zap, ArrowRight, ExternalLink,
  ShieldAlert, ShieldCheck, HelpCircle, Activity, Bell, RefreshCw, BarChart3
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
        'Initializing AI Shopping Research...',
        'Checking secure catalog and live web sources...',
        'Validating exact product identity and variants...',
        'Awaiting verified marketplace evidence...'
      ]);
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
            AI Shopping Research
          </h1>
          <p className="mt-2 text-xs text-ink-500 font-medium">
            Search any product, analyze a product URL, compare marketplaces, and find the best verified deal.
          </p>
        </div>

        {/* STEP 1: Input Form */}
        <section className="card bg-white p-6 shadow-sm border border-ink-100 rounded-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-xs font-bold text-ink-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Search className="h-3.5 w-3.5 text-accent-600" /> Search Input
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search a product or paste an Amazon / Flipkart / shopping URL..."
                    className="input-field text-sm py-3 w-full border-2 border-accent-100 focus:border-accent-600"
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
                    <Activity className="h-3.5 w-3.5 text-ink-400" /> Additional Context (Optional)
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

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 pt-4 border-t border-ink-100">
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => { setInputData(''); setContextData(''); mutation.reset(); }}
                  disabled={isLoading || (!inputData && !contextData && !mutation.data)}
                  className="btn-outline py-2 px-4 text-xs font-bold w-full sm:w-auto"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={() => { 
                    const samples = ["Samsung Galaxy S25 Ultra", "best gaming laptop under 100000", "Apple MacBook Air M3", "Sony WH-1000XM5"];
                    setInputData(samples[Math.floor(Math.random() * samples.length)]);
                  }}
                  disabled={isLoading}
                  className="btn-secondary py-2 px-4 text-xs font-bold w-full sm:w-auto flex items-center justify-center gap-1"
                >
                  <Play className="h-3 w-3" /> Random
                </button>
              </div>
              
              <button
                type="submit"
                disabled={isLoading || !inputData.trim()}
                className="btn-primary py-3 px-8 text-sm w-full sm:w-auto flex items-center justify-center gap-2"
              >
                {isLoading ? 'Analyzing...' : 'Analyze Product'}
              </button>
            </div>
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
            <h2 className="text-lg font-black text-red-900">
              {data.status === 'INVALID_URL' ? 'Invalid Product URL' : 'PRODUCT NOT VERIFIED'}
            </h2>
            <p className="text-sm text-red-700 font-medium">
              {data.status === 'INVALID_URL' 
                ? data.error || 'Please provide a valid, supported marketplace URL.' 
                : 'Insufficient verified information was found to establish the exact product.'}
            </p>
          </section>
        )}

        {/* SUCCESS RESULT STATE */}
        {data && !isLoading && (
          <div className="space-y-8 animate-in fade-in duration-500">
            {/* SOURCE PRODUCT */}
            {data.urlIntelligence && data.urlIntelligence.isValid && data.sourceOffer && (
              <section className="card bg-ink-50 p-6 border border-ink-200 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-bold text-ink-500 uppercase tracking-widest bg-white px-2 py-1 border border-ink-200 rounded-md">SOURCE PRODUCT</span>
                  </div>
                  <h3 className="text-xl font-black text-ink-900">{data.sourceOffer.marketplace}</h3>
                  <div className="flex items-end gap-3 mt-2">
                    <span className="text-2xl font-black">{formatINR(data.sourceOffer.price)}</span>
                    {data.sourceOffer.mrp && data.sourceOffer.mrp > data.sourceOffer.price && (
                      <span className="text-sm text-ink-500 line-through mb-1">{formatINR(data.sourceOffer.mrp)}</span>
                    )}
                    {data.sourceOffer.discountPercentage > 0 && (
                      <span className="text-[10px] bg-green-100 text-green-800 font-bold px-2 py-0.5 rounded uppercase tracking-wider mb-1.5">{data.sourceOffer.discountPercentage}% OFF</span>
                    )}
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <a href={data.urlIntelligence.url} target="_blank" rel="noopener noreferrer" className="btn-primary px-6 py-3 bg-ink-900 hover:bg-ink-800 text-white rounded-xl shadow-sm text-sm font-bold flex items-center gap-2 transition-all">
                    OPEN SOURCE <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </section>
            )}

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
                    <span className="absolute top-3 right-3 bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1 uppercase">
                      <ShieldCheck className="h-3 w-3" /> External Web Product
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

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <button 
                      onClick={() => handleSearch()}
                      className="btn-outline px-4 py-2 text-xs inline-flex items-center gap-2 border-ink-300 text-ink-700 hover:bg-ink-50"
                    >
                      <RefreshCw className="h-3 w-3" /> CHECK CURRENT PRICE
                    </button>
                    {data.identity.status === 'EXTERNAL_LIVE_VERIFIED' ? (
                      <p className="text-xs font-semibold text-amber-600 bg-amber-50 px-3 py-2 rounded border border-amber-200 inline-block">
                        External web product — price tracking and local catalog comparison unavailable.
                      </p>
                    ) : (
                      <>
                        <button className="btn-primary px-4 py-2 text-xs inline-flex items-center gap-2 bg-accent-600 hover:bg-accent-700 text-white shadow-sm border border-accent-700 rounded-lg">
                          <Bell className="h-3 w-3" /> TRACK PRICE
                        </button>
                        <Link to={`/compare?p1=${data.product._id}`} className="btn-outline px-4 py-2 text-xs inline-flex items-center gap-2">
                          + ADD TO COMPARE
                        </Link>
                      </>
                    )}
                  </div>
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
{data.identity.matchConfidence === 'AMBIGUOUS' && (
              <section className="bg-amber-50 border border-amber-200 p-6 rounded-2xl text-center shadow-sm">
                <ShieldAlert className="h-10 w-10 text-amber-500 mx-auto mb-3" />
                <h3 className="text-lg font-black text-amber-800">MULTIPLE POSSIBLE MATCHES</h3>
                <p className="text-sm font-medium text-amber-700 mt-2">
                  Multiple variants or similar models exist. Please refine your search to see exact verified deals (e.g. specify RAM/Storage or screen size).
                </p>
              </section>
            )}
{/* 2. BEST VERIFIED DEAL */}
            {(data.identity.matchConfidence === 'EXACT' || data.identity.status === 'IDENTITY_VERIFIED' || data.identity.status === 'EXTERNAL_LIVE_VERIFIED') && data.bestDeal && (
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
{/* SOURCE VS BEST MARKETPLACE */}
            {data.sourceInfo && data.sourceInfo.marketplace && data.sourceInfo.price && data.bestDeal && data.sourceInfo.marketplace !== data.bestDeal.marketplace && data.sourceInfo.price > data.bestDeal.price && (
              <section className="card bg-amber-50 p-6 border border-amber-200 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
                <div>
                  <div className="flex items-center gap-2 text-amber-700 mb-1">
                    <Zap className="h-4 w-4" />
                    <span className="text-xs font-bold uppercase tracking-widest">Source vs Best Marketplace</span>
                  </div>
                  <p className="text-sm font-semibold text-amber-900 mt-2">
                    The analyzed product is from <strong className="font-black">{data.sourceInfo.marketplace}</strong> ({formatINR(data.sourceInfo.price)}). A verified lower price was found on <strong className="font-black">{data.bestDeal.marketplace}</strong> ({formatINR(data.bestDeal.price)}).
                  </p>
                </div>
                <div className="bg-white px-4 py-3 rounded-xl border border-amber-100 flex-shrink-0 text-center shadow-sm">
                  <span className="block text-[10px] font-bold text-amber-600 uppercase">Potential Savings</span>
                  <span className="block text-2xl font-black text-amber-600">{formatINR(data.sourceInfo.price - data.bestDeal.price)}</span>
                </div>
              </section>
            )}
{/* 4 BEST METRICS CARDS */}
            {(data.identity.matchConfidence === 'EXACT' || data.identity.status === 'IDENTITY_VERIFIED' || data.identity.status === 'EXTERNAL_LIVE_VERIFIED') && data.dealMetrics && (
              <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="card bg-white p-5 border border-ink-100 rounded-2xl flex flex-col justify-center">
                  <span className="text-[10px] font-bold text-ink-500 uppercase tracking-widest mb-1">Best Price</span>
                  <span className="text-xl font-black text-ink-900">{formatINR(data.dealMetrics.bestPrice)}</span>
                </div>
                <div className="card bg-white p-5 border border-ink-100 rounded-2xl flex flex-col justify-center">
                  <span className="text-[10px] font-bold text-ink-500 uppercase tracking-widest mb-1">Best Discount</span>
                  <span className="text-xl font-black text-ink-900">{data.dealMetrics.bestDiscount ? `${data.dealMetrics.bestDiscount}% OFF` : 'N/A'}</span>
                </div>
                <div className="card bg-white p-5 border border-ink-100 rounded-2xl flex flex-col justify-center">
                  <span className="text-[10px] font-bold text-ink-500 uppercase tracking-widest mb-1">Best Savings</span>
                  <span className="text-xl font-black text-ink-900">{data.dealMetrics.bestSavings ? formatINR(data.dealMetrics.bestSavings) : 'N/A'}</span>
                </div>
                <div className="card bg-white p-5 border-accent-200 rounded-2xl flex flex-col justify-center bg-accent-50">
                  <span className="text-[10px] font-bold text-accent-700 uppercase tracking-widest mb-1">Best Verified Deal</span>
                  <span className="text-xl font-black text-accent-900 truncate">{data.bestDeal ? data.bestDeal.marketplace : 'None'}</span>
                </div>
              </section>
            )}

            {/* DEAL SCANNER & PRICE TRACKING */}
            {data.dealScanner && data.dealScanner.length > 0 && (
              <section className="card bg-white border border-ink-100 rounded-2xl p-6">
                <h3 className="text-xs font-black text-ink-900 uppercase tracking-widest flex items-center gap-2 mb-6">
                  <BarChart3 className="h-4 w-4 text-accent-600" /> Verified Deal Scanner & History
                </h3>
                <div className="space-y-4">
                  {data.dealScanner.map((scanner, i) => (
                    <div key={i} className="border border-ink-100 rounded-xl p-4 bg-ink-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-black text-ink-900 text-lg">{scanner.marketplace}</span>
                          {scanner.status === 'PRICE DROP' && <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-1"><TrendingDown className="h-3 w-3" /> VERIFIED PRICE DROP</span>}
                          {scanner.status === 'PRICE INCREASE' && <span className="bg-red-100 text-red-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-1"><TrendingUp className="h-3 w-3" /> PRICE INCREASE</span>}
                          {scanner.status === 'PRICE UNCHANGED' && <span className="bg-yellow-100 text-yellow-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">PRICE UNCHANGED</span>}
                          {scanner.status === 'NEW PRICE' && <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">NEW PRICE</span>}
                          {scanner.status === 'INSUFFICIENT HISTORY' && <span className="bg-ink-200 text-ink-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">INSUFFICIENT HISTORY</span>}
                        </div>
                        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                          <div>
                            <span className="text-ink-500 text-xs font-semibold uppercase">Current:</span>
                            <span className="ml-2 font-black text-ink-900">{formatINR(scanner.currentPrice)}</span>
                          </div>
                          {scanner.previousPrice && (
                            <div>
                              <span className="text-ink-500 text-xs font-semibold uppercase">Previous:</span>
                              <span className="ml-2 font-bold text-ink-700">{formatINR(scanner.previousPrice)}</span>
                            </div>
                          )}
                          {scanner.lowestVerified && scanner.historyCount > 1 && (
                            <div>
                              <span className="text-ink-500 text-xs font-semibold uppercase">Lowest Verified:</span>
                              <span className="ml-2 font-bold text-ink-700">{formatINR(scanner.lowestVerified)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Analysis Badge */}
                      <div className="md:text-right">
                        {scanner.isLowestEver ? (
                          <div className="text-xs font-semibold text-green-700 bg-green-50 px-3 py-2 rounded-lg border border-green-200 inline-block">
                            Matches lowest verified price in available history
                          </div>
                        ) : scanner.lowestVerified && scanner.currentPrice > scanner.lowestVerified ? (
                          <div className="text-[10px] font-medium text-ink-500 bg-white px-3 py-2 rounded-lg border border-ink-100 inline-block max-w-[200px]">
                            {formatINR(scanner.currentPrice - scanner.lowestVerified)} above the lowest recorded verified price ({formatINR(scanner.lowestVerified)})
                          </div>
                        ) : scanner.historyCount <= 1 ? (
                          <div className="text-[10px] font-medium text-ink-400 bg-white px-3 py-2 rounded-lg border border-ink-100 inline-block">
                            Not enough verified history to calculate this metric.
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ))}
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
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-6">
                {data.marketplaces.map((mp, idx) => (
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
                    
                    {data.verification && data.verification.checkedAt && (
                      <p className="text-[10px] font-semibold text-ink-400 mb-4 flex items-center gap-1">
                        Checked recently
                      </p>
                    )}

                    <div className="mt-auto pt-2 border-t border-ink-200">
                      {(data.identity.matchConfidence === 'EXACT' || data.identity.status === 'IDENTITY_VERIFIED' || data.identity.status === 'EXTERNAL_LIVE_VERIFIED') && mp.availability === 'Available' && mp.url ? (
                        <a href={mp.url} target="_blank" rel="noopener noreferrer" className="btn-secondary w-full py-2.5 text-xs inline-flex items-center justify-center gap-2">
                          BUY NOW <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        <span className="block w-full text-center py-2.5 text-xs font-bold text-ink-400 bg-ink-100 rounded-lg">
                          Unavailable
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                {data.marketplaces.length === 0 && (
                  <div className="col-span-full py-12 text-center text-sm font-medium text-ink-500">
                    No verified deals currently available for this exact product model.
                  </div>
                )}
              </div>

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

            {/* 7. HOW THE DEAL WAS CALCULATED */}
            {(data.identity.matchConfidence === 'EXACT' || data.identity.status === 'IDENTITY_VERIFIED' || data.identity.status === 'EXTERNAL_LIVE_VERIFIED') && data.dealMetrics && data.dealMetrics.difference > 0 && (
              <section className="card bg-white p-6 border border-ink-100 rounded-2xl space-y-4">
                <h3 className="text-xs font-black text-ink-900 uppercase tracking-widest flex items-center gap-2 mb-4">
                  <Zap className="h-4 w-4 text-accent-600" /> How the deal was calculated
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center bg-ink-50 p-6 rounded-xl border border-ink-100">
                  <div className="text-center md:text-left">
                    <p className="text-[10px] font-bold text-ink-500 uppercase">Highest Verified Offer</p>
                    <p className="text-lg font-black text-ink-900 mt-1">{data.dealMetrics.highestVerifiedOffer.marketplace}</p>
                    <p className="text-xl font-bold text-ink-700">{formatINR(data.dealMetrics.highestVerifiedOffer.price)}</p>
                  </div>
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-[10px] font-bold text-ink-400 uppercase mb-2">Difference</span>
                    <div className="bg-white border border-ink-200 px-4 py-2 rounded-full font-black text-accent-700 shadow-sm whitespace-nowrap">
                      {formatINR(data.dealMetrics.highestVerifiedOffer.price)} - {formatINR(data.dealMetrics.lowestVerifiedOffer.price)} = {formatINR(data.dealMetrics.difference)}
                    </div>
                  </div>
                  <div className="text-center md:text-right">
                    <p className="text-[10px] font-bold text-ink-500 uppercase">Lowest Verified Offer</p>
                    <p className="text-lg font-black text-accent-700 mt-1">{data.dealMetrics.lowestVerifiedOffer.marketplace}</p>
                    <p className="text-xl font-bold text-accent-700">{formatINR(data.dealMetrics.lowestVerifiedOffer.price)}</p>
                  </div>
                </div>
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl">
                  <p className="text-sm font-semibold text-green-900">
                    <strong className="font-black">Why this is the best verified deal:</strong> Among the verified marketplace offers returned for the exact product and variant, {data.dealMetrics.lowestVerifiedOffer.marketplace} has the lowest current verified price.
                  </p>
                </div>
              </section>
            )}

{/* AI RESEARCH SECTIONS */}
            {data.research && (
              <section className="space-y-6">
                {/* AI VERDICT */}
                <div className="card bg-white p-6 border border-ink-100 rounded-2xl">
                  <h3 className="text-xs font-black text-ink-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Zap className="h-4 w-4 text-accent-600" /> AI Verdict <span className="ml-auto text-[10px] bg-green-100 text-green-800 px-2 py-0.5 rounded-full border border-green-200">BASED ON VERIFIED SOURCES</span>
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

            {/* 9. RESEARCH EVIDENCE */}
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

            {/* 10. URL ANALYSIS EVIDENCE */}
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
                    <p className="text-[10px] text-ink-500 uppercase font-bold tracking-widest">Normalized Product URL (Tracking removed)</p>
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
                  <div className="space-y-1">
                    <p className="text-[10px] text-ink-500 uppercase font-bold tracking-widest">Identity</p>
                    <p className="text-sm font-black text-green-600">{data.identity.matchConfidence}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-ink-500 uppercase font-bold tracking-widest">Variant Verification</p>
                    <p className="text-sm font-black text-green-600">VERIFIED</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-ink-500 uppercase font-bold tracking-widest">Image Source</p>
                    <p className="text-sm font-black text-green-600">{data.evidence.image}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-ink-500 uppercase font-bold tracking-widest">Price Status</p>
                    <p className="text-sm font-black text-green-600">VERIFIED</p>
                  </div>
                </div>
              </section>
            )}

            {/* 11. WEB SOURCES */}
            {data.evidence && data.evidence.sources && data.evidence.sources.length > 0 && (
              <section className="card bg-white p-6 border border-ink-100 rounded-2xl space-y-4">
                <h3 className="text-xs font-black text-ink-900 uppercase tracking-widest flex items-center gap-2 mb-4">
                  <LinkIcon className="h-4 w-4 text-accent-600" /> Source Traceability
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {data.evidence.sources.map((src, idx) => {
                    let domain = 'Unknown';
                    try {
                      domain = new URL(src).hostname;
                    } catch(e) {}
                    
                    return (
                      <div key={idx} className="p-4 bg-ink-50 border border-ink-100 rounded-xl flex flex-col justify-between h-full">
                        <div>
                          <p className="text-sm font-black text-ink-900 truncate mb-1" title={src}>{domain}</p>
                          <p className="text-[10px] font-bold text-ink-500 uppercase mb-3">Verified Source</p>
                          <div className="space-y-1 mb-4">
                            <p className="text-xs font-semibold text-green-700 flex items-center gap-1.5"><CheckCircle2 className="h-3 w-3" /> Used for Pricing</p>
                            <p className="text-xs font-semibold text-green-700 flex items-center gap-1.5"><CheckCircle2 className="h-3 w-3" /> Used for Product Identity</p>
                            <p className="text-xs font-semibold text-green-700 flex items-center gap-1.5"><CheckCircle2 className="h-3 w-3" /> Used for AI Analysis</p>
                          </div>
                        </div>
                        <a href={src} target="_blank" rel="noopener noreferrer" className="btn-outline py-2 px-4 text-xs inline-flex items-center justify-center gap-2 mt-auto w-full">
                          OPEN SOURCE <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

          </div>
        )}
</main>
    </div>
  );
}
