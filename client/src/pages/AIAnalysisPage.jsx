import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { TrendingUp, Zap } from 'lucide-react';
import { apiClient } from '../services/apiClient';

import AIAnalysisInput from '../components/ai-analysis/AIAnalysisInput';
import AnalysisProgress from '../components/ai-analysis/AnalysisProgress';
import AnalysisError from '../components/ai-analysis/AnalysisError';
import AIAnalysisEmptyState from '../components/ai-analysis/AIAnalysisEmptyState';
import URLAnalysisResult from '../components/ai-analysis/URLAnalysisResult';
import ProductSearchResult from '../components/ai-analysis/ProductSearchResult';
import RecommendationResult from '../components/ai-analysis/RecommendationResult';
import ComparisonResult from '../components/ai-analysis/ComparisonResult';
import ExternalProductResult from '../components/ai-analysis/ExternalProductResult';
import PartialMatchResult from '../components/ai-analysis/PartialMatchResult';

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
    if (e) e.preventDefault();
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

  const handleClear = () => {
    setInputData('');
    setContextData('');
    mutation.reset();
  };

  React.useEffect(() => {
    const handleExactSearch = (e) => {
      setInputData(e.detail);
      setTimeout(() => {
        const form = document.querySelector('form');
        if (form) form.requestSubmit();
      }, 50);
    };
    window.addEventListener('ai-search-exact', handleExactSearch);
    return () => window.removeEventListener('ai-search-exact', handleExactSearch);
  }, []);

  const data = mutation.data;
  const isLoading = mutation.isPending;
  const isApiError = mutation.isError;

  return (
    <div className="min-h-screen bg-ink-50">
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

      <main className="mx-auto max-w-5xl px-6 py-10 space-y-10">
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

        <AIAnalysisInput
          inputData={inputData}
          setInputData={setInputData}
          contextData={contextData}
          setContextData={setContextData}
          preferredStore={preferredStore}
          setPreferredStore={setPreferredStore}
          handleSubmit={handleSubmit}
          handleClear={handleClear}
          isLoading={isLoading}
          searchSuggestions={searchSuggestions}
        />

        {isLoading && <AnalysisProgress stages={progressStages} />}

        {!isLoading && <AnalysisError isApiError={isApiError} data={data} onRetry={handleSubmit} />}

        {!isLoading && !isApiError && !data && (
          <AIAnalysisEmptyState onSelectExample={(example) => {
            setInputData(example);
            setTimeout(() => {
              document.querySelector('form').requestSubmit();
            }, 100);
          }} />
        )}

        {/* RESULTS DISPATCHER */}
        {!isLoading && !isApiError && data && (
          <>
            <URLAnalysisResult data={data} formatINR={formatINR} />
            <ProductSearchResult data={data} formatINR={formatINR} />
            <ExternalProductResult data={data} formatINR={formatINR} />
            <RecommendationResult data={data} formatINR={formatINR} />
            <ComparisonResult data={data} formatINR={formatINR} />
            <PartialMatchResult data={data} />
          </>
        )}
      </main>
    </div>
  );
}
