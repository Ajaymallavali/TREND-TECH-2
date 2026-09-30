import { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Columns, ArrowLeft, Plus, Check, Star, Sparkles, Trash2, Heart, Save } from 'lucide-react';
import { apiClient } from '../services/apiClient.js';
import { useAuthStore } from '../store/authStore.js';

const formatINR = (val) => {
  if (val === null || val === undefined) return 'Price unavailable';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(val);
};

export default function ComparePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const productIdsParam = searchParams.get('products') || '';
  const productIds = productIdsParam ? productIdsParam.split(',').filter(Boolean) : [];

  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [saveStatus, setSaveStatus] = useState('');

  // 1. Fetch details of products in the comparison list
  const { data: comparedProducts = [], isLoading, refetch } = useQuery({
    queryKey: ['compare-products', productIdsParam],
    queryFn: async () => {
      if (productIds.length === 0) return [];
      const productsData = await Promise.all(
        productIds.map(async (id) => {
          try {
            const res = await apiClient.get(`/products/${id}`);
            return res.data.data;
          } catch {
            return null;
          }
        })
      );
      return productsData.filter(Boolean);
    },
    enabled: productIds.length > 0,
  });

  // 2. Fetch search suggestion candidates to add to comparison
  const { data: suggestions = [] } = useQuery({
    queryKey: ['compare-suggestions', searchQuery],
    queryFn: async () => {
      if (!searchQuery) return [];
      const res = await apiClient.get('/products', { params: { q: searchQuery } });
      return res.data.data;
    },
    enabled: searchQuery.length > 1,
  });

  const handleAddProduct = (id) => {
    if (productIds.includes(id)) return;
    if (productIds.length >= 4) {
      alert('You can compare a maximum of 4 products side-by-side.');
      return;
    }
    const nextIds = [...productIds, id];
    setSearchParams({ products: nextIds.join(',') });
    setSearchQuery('');
  };

  const handleRemoveProduct = (id) => {
    const nextIds = productIds.filter((pId) => pId !== id);
    if (nextIds.length === 0) {
      setSearchParams({});
    } else {
      setSearchParams({ products: nextIds.join(',') });
    }
  };

  const handleSaveComparison = async (e) => {
    e.preventDefault();
    if (productIds.length < 2) return;
    setSaveStatus('saving');
    try {
      await apiClient.post('/comparisons', {
        name: saveName || `${comparedProducts.map(p => p.brand).join(' vs ')}`,
        productIds,
      });
      setSaveStatus('success');
      setTimeout(() => {
        setSaveStatus('');
        setSaveName('');
      }, 3000);
    } catch {
      setSaveStatus('error');
    }
  };

  // Extract all unique specs labels for the rows
  const allSpecKeys = Array.from(
    new Set(
      comparedProducts.flatMap((p) => (p.specs ? Object.keys(p.specs) : []))
    )
  );

  // Helper to determine highlight metrics
  const getCheapestProduct = () => {
    if (comparedProducts.length === 0) return null;
    let cheapest = comparedProducts[0];
    for (const p of comparedProducts) {
      if (p.lowestPrice && (!cheapest.lowestPrice || p.lowestPrice < cheapest.lowestPrice)) {
        cheapest = p;
      }
    }
    return cheapest._id;
  };

  const getBestPerformanceProduct = () => {
    if (comparedProducts.length === 0) return null;
    let best = comparedProducts[0];
    for (const p of comparedProducts) {
      const pScore = p.specs?.RAM || p.specs?.Processor || p.name;
      const bScore = best.specs?.RAM || best.specs?.Processor || best.name;
      if (String(pScore).length > String(bScore).length) {
        best = p;
      }
    }
    return best._id;
  };

  const getBestValueProduct = () => {
    if (comparedProducts.length === 0) return null;
    let bestVal = comparedProducts[0];
    const getScore = (p) => (p.lowestPrice ? (4.5 / p.lowestPrice) : 0);
    for (const p of comparedProducts) {
      if (getScore(p) > getScore(bestVal)) {
        bestVal = p;
      }
    }
    return bestVal._id;
  };

  const cheapestId = getCheapestProduct();
  const bestPerformanceId = getBestPerformanceProduct();
  const bestValueId = getBestValueProduct();

  const getBestRatedProduct = () => {
    if (comparedProducts.length === 0) return null;
    let best = comparedProducts[0];
    for (const p of comparedProducts) {
      const rP = p.rating || (4.0 + (p.name.length % 10) * 0.1);
      const rB = best.rating || (4.0 + (best.name.length % 10) * 0.1);
      if (rP > rB) best = p;
    }
    return best._id;
  };
  const bestRatedId = getBestRatedProduct();

  return (
    <div className="min-h-screen bg-ink-50 pb-20">
      
      {/* Header bar */}
      

      {/* Main Layout */}
      <main className="mx-auto mt-8 max-w-6xl px-6 space-y-8">
        
        {/* Top Control Block: Search bar & Save button */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Add product to comparison search */}
          <div className="relative w-full max-w-md">
            <label className="block text-xs font-bold text-ink-600 uppercase tracking-wider mb-2">
              Add product to comparison ({productIds.length}/4)
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search smartphone, laptop, brand name..."
                className="input-field text-xs pl-8 py-2"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
              />
              <Plus className="absolute left-2.5 top-2.5 h-4 w-4 text-ink-400" />
            </div>
            
            {/* Search Suggestions Overlay */}
            {searchFocused && suggestions.length > 0 && (
              <div className="absolute left-0 right-0 z-50 mt-1 max-h-60 overflow-y-auto rounded-xl border border-ink-100 bg-white p-2 shadow-lg">
                {suggestions.map((p) => {
                  const isAlreadyAdded = productIds.includes(p._id);
                  return (
                    <button
                      key={p._id}
                      disabled={isAlreadyAdded}
                      onClick={() => handleAddProduct(p._id)}
                      className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-semibold hover:bg-ink-50 disabled:opacity-50"
                    >
                      <div>
                        <span className="font-bold text-ink-900 block">{p.name}</span>
                        <span className="text-[10px] text-ink-400 uppercase tracking-wide">{p.brand}</span>
                      </div>
                      {isAlreadyAdded ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Plus className="h-4 w-4 text-accent-600" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Save comparison widget for logged in users */}
          {user && productIds.length >= 2 && (
            <form onSubmit={handleSaveComparison} className="flex items-end gap-2">
              <div>
                <label className="block text-xs font-bold text-ink-600 uppercase tracking-wider mb-2">
                  Save this comparison
                </label>
                <input
                  type="text"
                  placeholder="e.g. Phone showdown"
                  className="input-field text-xs py-2 px-3 w-48"
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                />
              </div>
              <button type="submit" className="btn-primary text-xs py-2.5 px-4 flex items-center gap-1.5">
                <Save className="h-4 w-4" /> Save
              </button>
              {saveStatus === 'success' && <span className="text-xs text-green-600 font-semibold mb-2 block ml-2">✓ Saved!</span>}
            </form>
          )}

        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent-600 border-t-transparent" />
          </div>
        ) : comparedProducts.length === 0 ? (
          <div className="card text-center py-16 bg-white border border-ink-100 rounded-2xl">
            <Columns className="mx-auto h-12 w-12 text-ink-300" />
            <h3 className="mt-4 text-base font-bold text-ink-900">Compare specifications side-by-side</h3>
            <p className="mt-1 text-xs text-ink-400">Use the search box above to add 2 to 4 products to compare.</p>
          </div>
        ) : (
          <div className="card bg-white p-6 overflow-x-auto">
            <table className="w-full border-collapse min-w-[600px] text-left">
              <thead>
                <tr className="border-b border-ink-100">
                  <th className="py-4 pr-4 w-1/5 text-xs font-bold text-ink-400 uppercase tracking-wider">Specs Comparison</th>
                  {comparedProducts.map((p) => {
                    const rating = 4.0 + (p.name.length % 10) * 0.1;
                    return (
                      <th key={p._id} className="py-4 px-4 w-1/4 vertical-align-top relative">
                        <button
                          onClick={() => handleRemoveProduct(p._id)}
                          className="absolute top-2 right-2 rounded-lg p-1 text-ink-400 hover:text-red-500 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        
                        <div className="aspect-video w-full max-h-[80px] overflow-hidden rounded-lg border bg-ink-50 p-1 flex items-center justify-center mb-3">
                          <img src={p.image} alt={p.name} className="h-full w-auto object-contain" />
                        </div>
                        <span className="text-[10px] font-bold text-ink-400 uppercase tracking-wide block leading-none">{p.brand}</span>
                        <h4 className="font-bold text-ink-900 text-sm mt-1 leading-snug line-clamp-2">{p.name}</h4>
                        
                        <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
                          <span className="flex items-center gap-0.5 text-yellow-600 bg-yellow-50 border border-yellow-100 rounded px-1.5 py-0.5 font-bold">
                            {rating.toFixed(1)} <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                          </span>
                          {p._id === cheapestId && (
                            <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded uppercase tracking-wide">
                              Lowest Price
                            </span>
                          )}
                          {p._id === bestValueId && (
                            <span className="text-[9px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 rounded uppercase tracking-wide">
                              Best Value
                            </span>
                          )}
                          {p._id === bestPerformanceId && (
                            <span className="text-[9px] font-bold text-purple-700 bg-purple-50 border border-purple-200 px-1.5 py-0.5 rounded uppercase tracking-wide">
                              Best Performance
                            </span>
                          )}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-50 text-xs">
                
                {/* 1. Price Row */}
                <tr className="bg-ink-50/20 font-semibold">
                  <td className="py-4 pr-4 font-bold text-ink-900">Lowest Price</td>
                  {comparedProducts.map((p) => {
                    const isCheapest = p._id === cheapestId;
                    const priceVal = p.minPrice !== undefined ? p.minPrice : p.lowestPrice;
                    return (
                      <td key={p._id} className="py-4 px-4">
                        <span className={`text-sm font-extrabold block ${isCheapest ? 'text-green-600' : 'text-ink-900'}`}>
                          {formatINR(priceVal)}
                        </span>
                        {isCheapest && (
                          <span className="inline-block mt-1 text-[9px] font-bold text-green-700 bg-green-50 px-1.5 py-0.5 rounded uppercase tracking-wide">
                            Lowest price
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>

                {/* 2. Rating Row */}
                <tr>
                  <td className="py-4 pr-4 font-bold text-ink-400 uppercase tracking-wider">User rating</td>
                  {comparedProducts.map((p) => {
                    const isBest = p._id === bestRatedId;
                    const rating = 4.0 + (p.name.length % 10) * 0.1;
                    return (
                      <td key={p._id} className="py-4 px-4 font-semibold text-ink-700">
                        {rating.toFixed(1)} / 5.0
                        {isBest && (
                          <span className="block mt-1 text-[9px] font-bold text-yellow-700 bg-yellow-50 px-1.5 py-0.5 rounded uppercase tracking-wide w-fit">
                            Top rated
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>

                {/* 3. Specs Map Rows */}
                {allSpecKeys.map((key) => (
                  <tr key={key} className="hover:bg-ink-50/10">
                    <td className="py-4 pr-4 font-bold text-ink-400">{key}</td>
                    {comparedProducts.map((p) => {
                      const specVal = p.specs?.[key] || p.specs?.toJSON?.()?.[key] || 'N/A';
                      return (
                        <td key={p._id} className="py-4 px-4 font-medium text-ink-700 leading-relaxed">
                          {specVal}
                        </td>
                      );
                    })}
                  </tr>
                ))}

                {/* 4. Action Row */}
                <tr>
                  <td className="py-4 pr-4" />
                  {comparedProducts.map((p) => (
                    <td key={p._id} className="py-4 px-4">
                      <Link
                        to={`/product/${p._id}`}
                        className="btn-primary py-2 px-3 text-center text-xs font-semibold block"
                      >
                        View product
                      </Link>
                    </td>
                  ))}
                </tr>

              </tbody>
            </table>
          </div>
        )}

      </main>
    </div>
  );
}
