import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  TrendingUp, Search as SearchIcon, Sparkles, Star, Heart, Laptop, Smartphone,
  Tv, Headphones, Watch, Monitor, Tablet, Camera, Gamepad, ExternalLink,
  Wind, Shirt, ShoppingBag, Sparkle, Eye, ArrowRight
} from 'lucide-react';
import { useAuthStore } from '../store/authStore.js';
import { apiClient } from '../services/apiClient.js';
import ProductImage from '../components/ProductImage.jsx';
import TopProgressBar from '../components/TopProgressBar.jsx';
import { useSavedProducts } from '../hooks/useSavedProducts.js';

const formatINR = (val) => {
  if (val === null || val === undefined) return 'Price unavailable';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(val);
};

// Spatially Organized Category Groups (Reference 1 Layout)
const CATEGORY_GROUPS = [
  {
    title: 'Electronics & Gadgets',
    categories: [
      { id: 'smartphone', name: 'Smartphones', icon: Smartphone },
      { id: 'laptop', name: 'Laptops', icon: Laptop },
      { id: 'tablet', name: 'Tablets', icon: Tablet },
      { id: 'television', name: 'Smart TVs', icon: Tv },
      { id: 'smartwatch', name: 'Smartwatches', icon: Watch },
      { id: 'headphones', name: 'Headphones', icon: Headphones },
      { id: 'earbuds', name: 'Earbuds', icon: Headphones },
      { id: 'monitor', name: 'Monitors', icon: Monitor },
      { id: 'camera', name: 'Cameras', icon: Camera },
      { id: 'gaming', name: 'Gaming', icon: Gamepad },
    ]
  },
  {
    title: 'Home & Appliances',
    categories: [
      { id: 'air-conditioner', name: 'Split ACs', icon: Wind },
      { id: 'washing-machine', name: 'Washing Machines', icon: Wind },
      { id: 'refrigerator', name: 'Refrigerators', icon: Wind },
    ]
  },
  {
    title: 'Fashion & Style',
    categories: [
      { id: 'shoes', name: 'Shoes & Sneakers', icon: Shirt },
      { id: 'bags', name: 'Bags & Luggage', icon: ShoppingBag },
      { id: 'mens-clothing', name: "Men's Clothing", icon: Shirt },
      { id: 'womens-clothing', name: "Women's Clothing", icon: Shirt },
    ]
  },
  {
    title: 'Beauty & Personal Care',
    categories: [
      { id: 'beauty-personal-care', name: 'Personal Care', icon: Sparkle },
    ]
  }
];

const POPULAR_SEARCHES = ['iPhone 16 Pro', 'MacBook Air M3', 'Sony WH-1000XM5', 'LG OLED TV', 'Nike Air Force 1', 'PS5 Slim'];

export default function HomePage() {
  const [searchInput, setSearchInput] = useState('');
  const navigate = useNavigate();
  const { user, status, logout } = useAuthStore();
  const { isSaved, toggleSave } = useSavedProducts();

  // Fetch real deals from server
  const { data: deals = [], isLoading: dealsLoading } = useQuery({
    queryKey: ['home-deals'],
    queryFn: async () => {
      const res = await apiClient.get('/products');
      const products = res.data.data || [];
      return products
        .filter((p) => p.dealStatus && p.dealStatus !== 'STABLE' && p.minPrice)
        .map((p) => ({
          product: p,
          marketplace: p.dealSource || 'Amazon India',
          url: p.dealSourceUrl || `/product/${p._id}`,
          currentPrice: p.minPrice,
          originalPrice: p.maxPrice > p.minPrice ? p.maxPrice : null,
          discountPercentage: p.discountPercentage || 0,
          dealStatus: p.dealStatus,
        }))
        .slice(0, 8);
    },
  });

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchInput)}`);
    }
  };

  return (
    <div className="min-h-screen bg-ink-50 font-sans text-ink-900">
      <TopProgressBar />

      {/* Navigation Header */}
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
            <Link to="/compare" className="text-xs font-semibold text-ink-600 hover:text-ink-900">
              Compare
            </Link>

            {status === 'authenticated' ? (
              <>
                <Link to="/dashboard" className="text-xs font-semibold text-ink-600 hover:text-ink-900">
                  Dashboard
                </Link>
                <button onClick={logout} className="btn-secondary py-1.5 px-3.5 text-xs">
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-xs font-semibold text-ink-600 hover:text-ink-900">
                  Log in
                </Link>
                <Link to="/register" className="btn-primary py-1.5 px-3.5 text-xs">
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero / Search Section */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 py-12 text-center">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-accent-50 px-3.5 py-1 text-xs font-bold text-accent-700 border border-accent-100 shadow-sm">
          <Sparkles className="h-3.5 w-3.5 text-accent-600" />
          <span>India's Smartest Shopping Intelligence Platform (₹ INR)</span>
        </div>
        <h1 className="mt-4 text-3xl font-black tracking-tight text-ink-900 sm:text-5xl leading-tight">
          Compare Verified Prices in India.<br className="hidden sm:inline" /> Buy Smarter.
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-xs sm:text-sm text-ink-500 font-medium leading-relaxed">
          Track real-time prices across Amazon India, Flipkart, Croma, Reliance Digital, Vijay Sales, Tata Neu, and Myntra.
        </p>
        
        {/* Search Input */}
        <form onSubmit={handleSearch} className="mx-auto mt-6 max-w-lg flex gap-2">
          <div className="relative flex-grow">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
              <SearchIcon className="h-4 w-4 text-ink-400" />
            </div>
            <input
              className="w-full rounded-xl border border-ink-200 bg-white py-2.5 pl-10 pr-4 text-xs font-medium text-ink-900 placeholder-ink-400 shadow-sm focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
              placeholder="Search phones, laptops, TVs, headphones..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          <button type="submit" className="btn-primary px-5 text-xs font-semibold shadow-sm">
            Search
          </button>
        </form>

        {/* Popular Searches */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-ink-400">
          <span className="font-semibold text-ink-500">Popular:</span>
          {POPULAR_SEARCHES.map((term) => (
            <Link
              key={term}
              to={`/search?q=${encodeURIComponent(term)}`}
              className="rounded-full bg-white border border-ink-100 px-3 py-1 text-[11px] font-medium text-ink-600 hover:border-accent-300 hover:text-accent-600 transition-colors shadow-2xs"
            >
              {term}
            </Link>
          ))}
        </div>
      </section>

      {/* MAIN CONTENT AREA */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 pb-20 space-y-12">
        
        {/* REDESIGNED CATEGORY SECTIONS (Reference 1 Layout) */}
        <section className="space-y-8">
          {CATEGORY_GROUPS.map((group) => (
            <div key={group.title} className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-ink-900 tracking-tight flex items-center gap-2">
                <span>{group.title}</span>
                <span className="h-1 w-8 bg-accent-600 rounded-full inline-block" />
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-10 gap-3">
                {group.categories.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <Link
                      key={cat.id}
                      to={`/category/${cat.id}`}
                      className="group rounded-2xl border border-ink-100 bg-white p-3 flex flex-col items-center justify-center text-center shadow-2xs hover:border-accent-300 hover:shadow-md transition-all cursor-pointer select-none"
                    >
                      <div className="rounded-xl bg-accent-50/70 p-3 text-accent-600 group-hover:bg-accent-600 group-hover:text-white transition-all transform group-hover:scale-105">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="mt-2.5 text-[11px] font-bold text-ink-800 leading-tight group-hover:text-accent-600 transition-colors">
                        {cat.name}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </section>

        {/* Specs Comparison CTA */}
        <section className="rounded-2xl border border-accent-100 bg-gradient-to-r from-accent-50/40 via-white to-accent-50/20 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
          <div>
            <h3 className="text-base font-bold text-ink-900">Side-by-Side Product Comparison</h3>
            <p className="text-xs text-ink-500 mt-1">Select and compare 2-4 electronics specifications, highlights, and pricing values side-by-side.</p>
          </div>
          <Link to="/compare" className="btn-primary text-xs py-2 px-5 self-start md:self-auto flex items-center gap-1.5 shadow-sm">
            <span>Open Comparison Tool</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </section>

        {/* TODAY'S BEST DEALS SECTION */}
        <section>
          <div className="mb-6 flex items-baseline justify-between">
            <div>
              <h2 className="text-lg font-bold text-ink-900 flex items-center gap-2">
                <span>🔥 Today's Best Electronics Deals</span>
                <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-red-600 animate-pulse">
                  Verified Discounts
                </span>
              </h2>
              <p className="text-xs text-ink-400 mt-1">Verified marketplace discounts based on real observed prices.</p>
            </div>
          </div>

          {deals.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-ink-200 bg-white p-8 text-center">
              <span className="text-xs font-semibold text-ink-500">No verified deals available yet.</span>
              <p className="text-[11px] text-ink-400 mt-1">Price observation engine monitors real marketplace prices continuously.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {deals.map((deal) => (
                <div key={deal.product._id} className="rounded-2xl border border-red-100 bg-white hover:border-red-300 hover:shadow-md transition-all flex flex-col justify-between p-4 shadow-2xs">
                  <div>
                    <div className="mb-4 aspect-square w-full overflow-hidden rounded-xl bg-ink-50 relative border border-ink-100/50 flex items-center justify-center p-2">
                      <ProductImage src={deal.product.image} alt={deal.product.name} category={deal.product.category} aspectClassName="aspect-square" className="max-h-[140px] mx-auto" />
                      <span className="absolute top-2 left-2 rounded bg-red-600 px-2 py-0.5 text-[9px] font-bold text-white uppercase tracking-wider shadow-2xs">
                        {deal.discountPercentage}% OFF
                      </span>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-ink-400">
                      {deal.product.brand}
                    </span>
                    <Link to={`/product/${deal.product._id}`}>
                      <h3 className="mt-1 font-bold text-ink-900 text-xs leading-snug line-clamp-2 hover:text-accent-600 transition-colors">
                        {deal.product.name}
                      </h3>
                    </Link>
                  </div>

                  <div className="mt-4 pt-3 border-t border-ink-50">
                    <div className="flex items-baseline justify-between mb-2">
                      <div>
                        <span className="block text-[9px] text-ink-400 font-bold uppercase">Deal Price ({deal.marketplace})</span>
                        <span className="text-base font-extrabold text-red-600">{formatINR(deal.currentPrice)}</span>
                      </div>
                      {deal.originalPrice && (
                        <div className="text-right">
                          <span className="block text-[9px] text-ink-400 font-bold uppercase">List Price</span>
                          <span className="text-xs font-semibold text-ink-400 line-through">{formatINR(deal.originalPrice)}</span>
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      <a
                        href={deal.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary py-2 text-center text-xs font-semibold bg-red-600 hover:bg-red-700 text-white flex items-center justify-center gap-1 shadow-2xs"
                      >
                        <span>View Deal</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      <Link
                        to={`/product/${deal.product._id}`}
                        className="btn-secondary py-2 text-center text-xs font-semibold text-ink-700 border border-ink-200 hover:bg-ink-50 flex items-center justify-center"
                      >
                        Compare
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </main>
    </div>
  );
}
