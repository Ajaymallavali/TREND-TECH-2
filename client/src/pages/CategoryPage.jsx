import { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Search, SlidersHorizontal, ArrowUpDown, Sparkles, ExternalLink,
  ChevronRight, Filter, ShoppingBag, Eye, Award, CheckCircle2, ArrowRight
} from 'lucide-react';
import { apiClient } from '../services/apiClient.js';
import ProductImage from '../components/ProductImage.jsx';
import TopProgressBar from '../components/TopProgressBar.jsx';

const formatINR = (val) => {
  if (val === null || val === undefined) return 'Price unavailable';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(val);
};

const CATEGORY_NAMES = {
  smartphone: 'Smartphones',
  laptop: 'Laptops',
  television: 'Smart TVs',
  tv: 'Smart TVs',
  headphones: 'Over-Ear Headphones',
  earbuds: 'True Wireless Earbuds',
  smartwatch: 'Smartwatches',
  monitor: 'Monitors',
  camera: 'Cameras',
  gaming: 'Gaming Consoles',
  'air-conditioner': 'Split ACs',
  refrigerator: 'Refrigerators',
  'washing-machine': 'Washing Machines',
  shoes: 'Shoes & Sneakers',
  bags: 'Bags & Luggage',
  'beauty-personal-care': 'Beauty & Personal Care',
  'mens-clothing': "Men's Clothing",
  'womens-clothing': "Women's Clothing",
};

export default function CategoryPage() {
  const { category: categoryParam, brand: brandParam } = useParams();
  const navigate = useNavigate();

  const currentCategory = (categoryParam || 'smartphone').toLowerCase();
  const currentBrand = brandParam ? brandParam.trim() : '';
  const categoryTitle = CATEGORY_NAMES[currentCategory] || currentCategory.toUpperCase();

  const [searchQuestion, setSearchQuestion] = useState('');
  const [budgetFilter, setBudgetFilter] = useState('all');
  const [useCaseFilter, setUseCaseFilter] = useState('all');
  const [sortBy, setSortBy] = useState('price_asc');
  const [isNavigating, setIsNavigating] = useState(false);

  // Fetch products & brand summary for this category
  const { data: apiResponse = {}, isLoading, isFetching, isError, refetch } = useQuery({
    queryKey: ['category-products', currentCategory, currentBrand, sortBy, budgetFilter],
    queryFn: async () => {
      const params = { category: currentCategory, sortBy };
      if (currentBrand) params.brand = currentBrand;
      if (budgetFilter === 'above60k') params.minPrice = 60000;
      if (budgetFilter === 'under60k') params.maxPrice = 60000;
      if (budgetFilter === 'under40k') params.maxPrice = 40000;
      if (budgetFilter === 'under25k') params.maxPrice = 25000;

      const res = await apiClient.get('/products', { params });
      return res.data || {};
    },
  });

  const products = apiResponse.data || [];
  const brandSummary = apiResponse.brandSummary || [];

  // Extract unique brands for fallback sidebar
  const brands = useMemo(() => {
    if (brandSummary.length > 0) return brandSummary.map((b) => b.name);
    const set = new Set();
    products.forEach((p) => {
      if (p.brand) set.add(p.brand);
    });
    return Array.from(set).sort();
  }, [products, brandSummary]);

  // Apply frontend budget & use case filters
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const price = p.minPrice || 0;
      // Budget filter
      if (budgetFilter === 'above60k' && price < 60000) return false;
      if (budgetFilter === 'under60k' && (price > 60000 || price === 0)) return false;
      if (budgetFilter === 'under40k' && (price > 40000 || price === 0)) return false;
      if (budgetFilter === 'under25k' && (price > 25000 || price === 0)) return false;

      // Use case filter keyword check
      if (useCaseFilter === 'camera') {
        const text = `${p.name} ${p.description || ''}`.toLowerCase();
        if (!text.includes('camera') && !text.includes('mp') && !text.includes('photo')) return false;
      }
      if (useCaseFilter === 'performance') {
        const text = `${p.name} ${p.description || ''}`.toLowerCase();
        if (!text.includes('pro') && !text.includes('m3') && !text.includes('snapdragon') && !text.includes('core')) return false;
      }

      return true;
    });
  }, [products, budgetFilter, useCaseFilter]);

  const handleQuestionSubmit = (e) => {
    e.preventDefault();
    if (searchQuestion.trim()) {
      setIsNavigating(true);
      navigate(`/search?q=${encodeURIComponent(searchQuestion)}&category=${currentCategory}`);
    }
  };

  return (
    <div className="min-h-screen bg-ink-50 font-sans text-ink-900">
      <TopProgressBar />

      {/* Header bar */}
      <header className="border-b border-ink-100 bg-white sticky top-0 z-30 shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-3.5">
          <Link to="/" className="flex items-center gap-2 group">
            <span className="text-xl font-black tracking-tight text-ink-900 group-hover:text-accent-600 transition-colors">
              TREND-TECH
            </span>
            <span className="rounded bg-accent-50 px-2 py-0.5 text-[10px] font-bold text-accent-700 border border-accent-100">
              INDIA
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <Link to="/analysis" className="text-xs font-semibold text-accent-700 hover:text-accent-950 flex items-center gap-1.5 bg-accent-50/60 px-3 py-1.5 rounded-lg border border-accent-100">
              <Sparkles className="h-3.5 w-3.5" /> AI Analysis
            </Link>
            <Link to="/search" className="text-xs font-semibold text-ink-600 hover:text-ink-900">
              Search Catalog
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-6 space-y-6">

        {/* BREADCRUMB */}
        <nav className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-ink-400">
          <Link to="/" className="hover:text-ink-700 transition-colors">HOME</Link>
          <ChevronRight className="h-3 w-3 text-ink-300" />
          <span className="text-ink-600">ELECTRONICS</span>
          <ChevronRight className="h-3 w-3 text-ink-300" />
          <Link to={`/category/${currentCategory}`} className="hover:text-ink-700 transition-colors text-accent-600">{categoryTitle}</Link>
          {currentBrand && (
            <>
              <ChevronRight className="h-3 w-3 text-ink-300" />
              <span className="text-ink-900">{currentBrand.toUpperCase()}</span>
            </>
          )}
        </nav>

        {/* PAGE HEADER */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ink-100 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-ink-900 tracking-tight">
                {currentBrand ? `${currentBrand} ${categoryTitle}` : `Top ${categoryTitle} Overall`}
              </h1>
              <span className="rounded-full bg-accent-600 px-3 py-0.5 text-xs font-extrabold text-white">
                Products found: {filteredProducts.length} | Verified: {filteredProducts.filter(p => p.identityStatus === 'IDENTITY_VERIFIED').length} | Pending verification: {filteredProducts.filter(p => p.identityStatus !== 'IDENTITY_VERIFIED').length}
              </span>
              {currentBrand && (
                <Link
                  to={`/category/${currentCategory}`}
                  className="text-xs font-semibold text-ink-500 hover:text-accent-600 underline ml-2"
                >
                  View All {categoryTitle}
                </Link>
              )}
            </div>
            <p className="mt-1 text-xs text-ink-500 font-medium">
              Ranked dynamically by verified marketplace availability, current INR prices, and technical specs.
            </p>
          </div>

          {/* AI QUESTION BAR */}
          <form onSubmit={handleQuestionSubmit} className="w-full sm:w-80 relative flex items-center">
            <input
              type="text"
              placeholder="Ask AI: Which has best camera?"
              value={searchQuestion}
              onChange={(e) => setSearchQuestion(e.target.value)}
              className="w-full rounded-xl border border-ink-200 bg-white py-2 pl-3.5 pr-10 text-xs font-medium text-ink-800 placeholder-ink-400 shadow-sm focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
            />
            <button
              type="submit"
              disabled={isNavigating}
              className="absolute right-1.5 p-1 rounded-lg bg-accent-600 text-white hover:bg-accent-700 transition-colors"
            >
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>

        {/* BRAND SELECTION SECTION (Part 11, Part 24 Required UX) */}
        {brandSummary.length > 0 && !currentBrand && (
          <section className="bg-white rounded-2xl border border-ink-100 p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-ink-400 flex items-center gap-1.5">
                <Award className="h-3.5 w-3.5 text-accent-600" />
                <span>Top {categoryTitle} Brands</span>
              </h2>
              <span className="text-[11px] font-semibold text-ink-400">Select a brand to filter</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {brandSummary.map((b) => (
                <Link
                  key={b.name}
                  to={`/category/${currentCategory}/brand/${encodeURIComponent(b.name.toLowerCase())}`}
                  className="group rounded-xl border border-ink-100 bg-ink-50/50 hover:bg-accent-50 hover:border-accent-200 px-3.5 py-2 flex items-center gap-2 transition-all cursor-pointer shadow-2xs"
                >
                  <span className="text-xs font-bold text-ink-900 group-hover:text-accent-700 transition-colors">
                    {b.name}
                  </span>
                  <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-extrabold text-ink-500 border border-ink-100 group-hover:border-accent-200 group-hover:text-accent-700">
                    {b.count}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* CONTENT LAYOUT: SIDEBAR + PRODUCT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">

          {/* LEFT SIDEBAR FILTERS (Reference 2 Layout) */}
          <aside className="lg:col-span-1 space-y-4">
            <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-sm space-y-6">

              {/* FEATURED */}
              <div>
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-ink-400 mb-2">Featured</h3>
                <button
                  onClick={() => { setBudgetFilter('all'); setUseCaseFilter('all'); navigate(`/category/${currentCategory}`); }}
                  className={`w-full text-left text-xs font-semibold py-2 px-3 rounded-lg transition-colors flex items-center justify-between ${
                    budgetFilter === 'all' && useCaseFilter === 'all' && !currentBrand
                      ? 'bg-accent-50 text-accent-700 font-bold border border-accent-100'
                      : 'text-ink-700 hover:bg-ink-50'
                  }`}
                >
                  <span>Top {categoryTitle} Overall</span>
                  <Award className="h-3.5 w-3.5 text-accent-600" />
                </button>
              </div>

              {/* BY BUDGET */}
              <div>
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-ink-400 mb-2">By Budget</h3>
                <div className="space-y-1">
                  {[
                    { id: 'above60k', label: 'Above ₹60,000' },
                    { id: 'under60k', label: 'Under ₹60,000' },
                    { id: 'under40k', label: 'Under ₹40,000' },
                    { id: 'under25k', label: 'Under ₹25,000' },
                  ].map((b) => (
                    <button
                      key={b.id}
                      onClick={() => setBudgetFilter(budgetFilter === b.id ? 'all' : b.id)}
                      className={`w-full text-left text-xs font-medium py-1.5 px-3 rounded-lg transition-colors ${
                        budgetFilter === b.id
                          ? 'bg-accent-50 text-accent-700 font-semibold border border-accent-100'
                          : 'text-ink-600 hover:bg-ink-50 hover:text-ink-900'
                      }`}
                    >
                      {b.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* BY USE CASE */}
              <div>
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-ink-400 mb-2">By Use Case</h3>
                <div className="space-y-1">
                  {[
                    { id: 'camera', label: 'Camera & Content' },
                    { id: 'performance', label: 'Performance & Gaming' },
                  ].map((u) => (
                    <button
                      key={u.id}
                      onClick={() => setUseCaseFilter(useCaseFilter === u.id ? 'all' : u.id)}
                      className={`w-full text-left text-xs font-medium py-1.5 px-3 rounded-lg transition-colors ${
                        useCaseFilter === u.id
                          ? 'bg-accent-50 text-accent-700 font-semibold border border-accent-100'
                          : 'text-ink-600 hover:bg-ink-50 hover:text-ink-900'
                      }`}
                    >
                      {u.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* BY BRAND */}
              {brands.length > 0 && (
                <div>
                  <h3 className="text-[11px] font-bold uppercase tracking-wider text-ink-400 mb-2">By Brand</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {brands.map((b) => {
                      const isActive = currentBrand.toLowerCase() === b.toLowerCase();
                      return (
                        <button
                          key={b}
                          onClick={() => {
                            if (isActive) {
                              navigate(`/category/${currentCategory}`);
                            } else {
                              navigate(`/category/${currentCategory}/brand/${encodeURIComponent(b.toLowerCase())}`);
                            }
                          }}
                          className={`rounded-md px-2.5 py-1 text-[11px] font-semibold border transition-colors ${
                            isActive
                              ? 'bg-ink-900 border-ink-900 text-white'
                              : 'bg-ink-50 border-ink-100 text-ink-600 hover:bg-ink-100'
                          }`}
                        >
                          {b}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* SORT ORDER */}
              <div>
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-ink-400 mb-2">Sort Order</h3>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full rounded-xl border border-ink-200 bg-white py-1.5 px-2.5 text-xs font-medium text-ink-800 focus:border-accent-500 focus:outline-none"
                >
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="discount_desc">Biggest Discount</option>
                  <option value="rating_desc">Top Rated</option>
                </select>
              </div>

            </div>
          </aside>

          {/* RIGHT PRODUCT GRID (Reference 2: 3-Column Desktop Grid) */}
          <section className="lg:col-span-3">

            {isError ? (
              <div className="rounded-2xl border border-red-200 bg-red-50/50 p-8 text-center space-y-3">
                <ShoppingBag className="mx-auto h-10 w-10 text-red-400 mb-1" />
                <h3 className="text-base font-bold text-red-900">Unable to load this category</h3>
                <p className="text-xs text-red-600">A network error occurred while fetching verified product data.</p>
                <button
                  onClick={() => refetch()}
                  className="btn-primary text-xs py-2 px-4 bg-red-600 hover:bg-red-700 text-white"
                >
                  Retry
                </button>
              </div>
            ) : isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {[1, 2, 3, 4, 5, 6].map((idx) => (
                  <div key={idx} className="rounded-2xl border border-ink-100 bg-white p-4 space-y-3 animate-pulse">
                    <div className="h-40 bg-ink-100 rounded-xl" />
                    <div className="h-4 bg-ink-100 rounded w-3/4" />
                    <div className="h-3 bg-ink-100 rounded w-1/2" />
                    <div className="h-8 bg-ink-100 rounded-lg pt-2" />
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-ink-200 bg-white p-12 text-center">
                <ShoppingBag className="mx-auto h-10 w-10 text-ink-300 mb-2" />
                <h3 className="text-base font-bold text-ink-900">No products available yet</h3>
                <p className="mt-1 text-xs text-ink-400">Our market intelligence engine monitors verified store prices continuously.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredProducts.map((product, idx) => {
                  const rankNum = (idx + 1).toString().padStart(2, '0');
                  const offers = product.offers || [];
                  const validOffers = offers.filter((o) => o.isAvailable && o.currentPrice > 0 && o.url);
                  validOffers.sort((a, b) => a.currentPrice - b.currentPrice);
                  const bestOffer = validOffers.length > 0 ? validOffers[0] : null;
                  const directDealUrl = bestOffer ? bestOffer.url : (product.dealSource && product.dealSource.startsWith('http') ? product.dealSource : null);

                  return (
                    <div
                      key={product._id}
                      className="group rounded-2xl border border-ink-100 bg-white p-4 shadow-sm hover:border-accent-200 hover:shadow-md transition-all flex flex-col justify-between relative"
                    >
                      <div>
                        {/* Rank Badge */}
                        <div className="flex items-center justify-between mb-3">
                          <span className="rounded-full bg-ink-900 px-2.5 py-0.5 text-[10px] font-black text-white tracking-widest">
                            #{rankNum}
                          </span>
                          <span className="text-[10px] font-bold text-ink-400 uppercase tracking-wider">
                            {product.brand}
                          </span>
                        </div>

                        {/* Product Image Area (object-fit: contain) */}
                        <Link to={`/product/${product._id}`} className="block mb-3">
                          <ProductImage
                            src={product.image}
                            alt={product.name}
                            category={product.category}
                            aspectClassName="aspect-square"
                            className="max-h-[160px] mx-auto"
                          />
                        </Link>

                        {/* Title & Description */}
                        <Link to={`/product/${product._id}`} className="block">
                          <h3 className="text-sm font-bold text-ink-900 group-hover:text-accent-600 transition-colors line-clamp-2 leading-snug">
                            {product.name}
                          </h3>
                        </Link>
                        <p className="mt-1.5 text-[11px] text-ink-500 line-clamp-2 leading-relaxed font-normal">
                          {product.description}
                        </p>
                      </div>

                      {/* Footer: Price & Direct View Deal Button */}
                      <div className="mt-4 pt-3 border-t border-ink-50 flex items-center justify-between gap-2">
                        <div>
                          <span className="block text-[9px] text-ink-400 font-bold uppercase">Lowest Price</span>
                          <span className="text-base font-extrabold text-ink-950">
                            {formatINR(product.minPrice)}
                          </span>
                        </div>

                        {directDealUrl ? (
                          <a
                            href={directDealUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-primary py-1.5 px-3 text-xs font-semibold flex items-center gap-1 shadow-sm"
                          >
                            <span>View Deal</span>
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        ) : (
                          <Link
                            to={`/product/${product._id}`}
                            className="btn-primary py-1.5 px-3.5 text-xs font-semibold flex items-center gap-1 shadow-sm"
                          >
                            <span>View</span>
                            <ChevronRight className="h-3.5 w-3.5" />
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </section>
        </div>

      </main>
    </div>
  );
}
