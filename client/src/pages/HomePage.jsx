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
import AIShoppingSearch from '../components/shopping/AIShoppingSearch.jsx';
import { useSavedProducts } from '../hooks/useSavedProducts.js';
import { getStoreRedirectUrl } from '../utils/storeUrlHelper';

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

export default function HomePage({ mode }) {
  const [searchInput, setSearchInput] = useState('');
  const navigate = useNavigate();
  const { user, status, logout } = useAuthStore();
  const { isSaved, toggleSave } = useSavedProducts();

  const filteredGroups = CATEGORY_GROUPS.filter(group => {
    if (mode === 'trend') return group.title === 'Fashion & Style' || group.title === 'Beauty & Personal Care';
    if (mode === 'tech') return group.title === 'Electronics & Gadgets' || group.title === 'Home & Appliances';
    if (mode === 'deals') return false; // Show nothing or everything, but deals will just focus on Deals section.
    return true;
  });

  // Fetch real deals from server
  const { data: deals = [], isLoading: dealsLoading } = useQuery({
    queryKey: ['home-deals'],
    queryFn: async () => {
      const res = await apiClient.get('/products');
      const products = res.data.data || [];
      return products
        .filter((p) => p.dealStatus && p.dealStatus !== 'STABLE' && p.minPrice && p.image)
        .map((p) => {
          let storeName = p.dealSource || 'Amazon India';
          if (typeof storeName === 'string' && storeName.startsWith('http')) {
            const check = storeName.toLowerCase();
            if (check.includes('croma')) storeName = 'Croma';
            else if (check.includes('flipkart')) storeName = 'Flipkart';
            else if (check.includes('amazon')) storeName = 'Amazon India';
            else if (check.includes('reliance')) storeName = 'Reliance Digital';
            else if (check.includes('vijay')) storeName = 'Vijay Sales';
            else storeName = 'Verified Store';
          }
          return {
            product: p,
            marketplace: storeName,
            url: p.dealSourceUrl || (typeof p.dealSource === 'string' && p.dealSource.startsWith('http') ? p.dealSource : `/product/${p._id}`),
            currentPrice: p.minPrice,
            originalPrice: p.maxPrice > p.minPrice ? p.maxPrice : null,
            discountPercentage: p.discountPercentage || 0,
            dealStatus: p.dealStatus,
          };
        })
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

      {/* Hero / Search Section with subtle ambient glow */}
      <section className="relative mx-auto max-w-5xl px-4 sm:px-6 pt-12 pb-14 text-center">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-64 bg-gradient-to-b from-accent-100/30 via-accent-50/10 to-transparent blur-2xl pointer-events-none -z-10" />

        <div className="inline-flex items-center gap-2 rounded-full bg-accent-50 px-4 py-1.5 text-xs font-bold text-accent-800 border border-accent-200/80 shadow-xs">
          <Sparkles className="h-3.5 w-3.5 text-accent-600 animate-pulse" />
          <span>India's Smartest Shopping Intelligence Platform (₹ INR)</span>
        </div>
        
        {mode === 'trend' ? (
          <>
            <h1 className="mt-5 text-3xl font-black tracking-tight text-ink-900 sm:text-5xl leading-tight">
              Trend Fashion Hub.<br className="hidden sm:inline" /> Discover Verified Style.
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-xs sm:text-sm text-ink-500 font-medium leading-relaxed">
              Explore the latest in fashion, sneakers, and lifestyle deals across top stores.
            </p>
          </>
        ) : mode === 'tech' ? (
          <>
            <h1 className="mt-5 text-3xl font-black tracking-tight text-ink-900 sm:text-5xl leading-tight">
              Tech Electronics Hub.<br className="hidden sm:inline" /> Compare Verified Prices.
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-xs sm:text-sm text-ink-500 font-medium leading-relaxed">
              Track live, verified prices across Amazon India, Flipkart, Croma, Reliance Digital, and Vijay Sales.
            </p>
          </>
        ) : mode === 'deals' ? (
          <>
            <h1 className="mt-5 text-3xl font-black tracking-tight text-ink-900 sm:text-5xl leading-tight">
              Live Verified Deals.<br className="hidden sm:inline" /> Never Overpay Again.
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-xs sm:text-sm text-ink-500 font-medium leading-relaxed">
              Genuine verified price drops and marketplace discounts tracked in real time.
            </p>
          </>
        ) : (
          <>
            <h1 className="mt-5 text-3xl font-black tracking-tight text-ink-900 sm:text-5xl leading-tight">
              Compare Verified Prices in India.<br className="hidden sm:inline" /> Buy Smarter.
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-xs sm:text-sm text-ink-500 font-medium leading-relaxed">
              Real-time price comparisons across Amazon India, Flipkart, Croma, Reliance Digital, Vijay Sales, and more.
            </p>
          </>
        )}
        
        {/* AI Shopping Search */}
        <AIShoppingSearch />

        {/* Feature Pills */}
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3 text-[11px] font-semibold text-ink-500">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-ink-100 shadow-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-accent-500 animate-ping" />
            <span>2,160+ Real-Time Offers</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-ink-100 shadow-xs">
            <span>⚡ Multi-Store Comparison</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-ink-100 shadow-xs">
            <span>🛡️ Verified Direct Links</span>
          </span>
        </div>
      </section>

      {/* MAIN CONTENT AREA */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 pb-20 space-y-12">
        
        {/* REDESIGNED CATEGORY SECTIONS */}
        {mode !== 'deals' && (
          <section className="space-y-9">
            {filteredGroups.map((group) => (
            <div key={group.title} className="space-y-3.5">
              <div className="flex items-center justify-between">
                <h2 className="text-base sm:text-lg font-bold text-ink-900 tracking-tight flex items-center gap-2.5">
                  <span className="h-2 w-2 rounded-full bg-accent-600" />
                  <span>{group.title}</span>
                </h2>
                <span className="text-[11px] font-bold text-ink-400 uppercase tracking-widest">
                  {group.categories.length} Categories
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-10 gap-3">
                {group.categories.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <Link
                      key={cat.id}
                      to={`/category/${cat.id}`}
                      className="group rounded-2xl border border-ink-100 bg-white p-3.5 flex flex-col items-center justify-center text-center shadow-card hover:border-accent-300 hover:shadow-md hover:-translate-y-1 transition-all duration-200 cursor-pointer select-none"
                    >
                      <div className="rounded-xl bg-accent-50/80 p-3 text-accent-700 group-hover:bg-accent-600 group-hover:text-white transition-all transform group-hover:scale-110 shadow-xs">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="mt-2.5 text-[11px] font-bold text-ink-800 leading-tight group-hover:text-accent-600 transition-colors line-clamp-1">
                        {cat.name}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </section>
        )}

        {/* Comparison Callout Banner */}
        {mode !== 'deals' && (
        <section className="rounded-2xl border border-accent-200/70 bg-gradient-to-r from-accent-50/60 via-white to-emerald-50/40 p-6 sm:p-7 flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-card">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-accent-100 text-[10px] font-black text-accent-800 uppercase tracking-wider">
              Tool Preview
            </div>
            <h3 className="text-base sm:text-lg font-bold text-ink-900">Side-by-Side Spec & Deal Comparison</h3>
            <p className="text-xs text-ink-500 max-w-xl leading-relaxed">Compare specifications, key differences, and multi-store pricing across 2 to 4 products instantly.</p>
          </div>
          <Link to="/compare" className="btn-primary text-xs py-2.5 px-5 self-start md:self-auto flex items-center gap-2 shadow-xs shrink-0">
            <span>Open Comparison Tool</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
        )}

        {/* TODAY'S BEST DEALS SECTION */}
        <section className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-ink-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-red-500 animate-ping" />
                <h2 className="text-lg sm:text-xl font-bold text-ink-900 tracking-tight">
                  Today's Top Verified Deals
                </h2>
                <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-red-600 border border-red-200/60">
                  Live Drops
                </span>
              </div>
              <p className="text-xs text-ink-400 mt-1">Multi-store discounts verified from live market observations.</p>
            </div>
            <Link to="/deals" className="text-xs font-bold text-accent-700 hover:text-accent-900 flex items-center gap-1 self-start sm:self-auto">
              <span>View all deals</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {deals.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-ink-200 bg-white p-10 text-center shadow-xs">
              <span className="text-xs font-semibold text-ink-600">No verified deals available at this moment.</span>
              <p className="text-[11px] text-ink-400 mt-1">Our price intelligence engine monitors retail marketplaces continuously.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {deals.map((deal) => (
                <div
                  key={deal.product._id}
                  className="rounded-2xl border border-ink-100 bg-white hover:border-accent-200 hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between p-4 shadow-card group"
                >
                  <div>
                    {/* Image Area with floating badges */}
                    <div className="mb-3.5 aspect-square w-full overflow-hidden rounded-xl bg-ink-50/50 relative border border-ink-100/60 flex items-center justify-center p-3">
                      <ProductImage
                        src={deal.product.image}
                        alt={deal.product.name}
                        category={deal.product.category}
                        aspectClassName="aspect-square"
                        className="max-h-[140px] mx-auto group-hover:scale-105 transition-transform duration-300"
                      />
                      {deal.discountPercentage > 0 && (
                        <span className="absolute top-2.5 left-2.5 rounded-lg bg-red-600 px-2 py-0.5 text-[9px] font-extrabold text-white uppercase tracking-wider shadow-xs">
                          {deal.discountPercentage}% OFF
                        </span>
                      )}
                      <span className="absolute top-2.5 right-2.5 max-w-[110px] truncate rounded-md bg-white/95 backdrop-blur-xs px-2 py-0.5 text-[9px] font-bold text-ink-700 border border-ink-100 shadow-2xs">
                        {deal.marketplace}
                      </span>
                    </div>

                    <span className="text-[10px] font-bold uppercase tracking-wider text-ink-400">
                      {deal.product.brand}
                    </span>
                    <Link to={`/product/${deal.product._id}`}>
                      <h3 className="mt-1 font-bold text-ink-900 text-xs leading-snug line-clamp-2 group-hover:text-accent-600 transition-colors">
                        {deal.product.name}
                      </h3>
                    </Link>
                  </div>

                  <div className="mt-4 pt-3 border-t border-ink-50">
                    <div className="flex items-baseline justify-between mb-2.5">
                      <div>
                        <span className="block text-[9px] text-ink-400 font-bold uppercase tracking-wider">Lowest Deal Price</span>
                        <span className="text-base font-extrabold text-ink-950">{formatINR(deal.currentPrice)}</span>
                      </div>
                      {deal.originalPrice && (
                        <div className="text-right">
                          <span className="block text-[9px] text-ink-400 font-bold uppercase tracking-wider">List Price</span>
                          <span className="text-xs font-semibold text-ink-400 line-through">{formatINR(deal.originalPrice)}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 mt-2">
                      <div className="grid grid-cols-2 gap-2">
                        <a
                          href={getStoreRedirectUrl(deal.marketplace, deal.product, deal.url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-primary py-2 text-center text-[11px] font-bold flex items-center justify-center gap-1 shadow-xs"
                        >
                          <span>Buy Deal</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                        <Link
                          to={`/compare?products=${deal.product._id}`}
                          className="btn-secondary py-2 text-center text-[11px] font-semibold text-ink-700 flex items-center justify-center"
                        >
                          Compare
                        </Link>
                      </div>
                      <Link
                        to={`/analysis?q=${encodeURIComponent('Analyze deal for ' + deal.product.name)}`}
                        className="w-full py-1.5 text-center text-[10px] font-bold text-accent-700 bg-accent-50/70 border border-accent-200/60 hover:bg-accent-100/70 rounded-lg flex items-center justify-center gap-1 transition-colors uppercase tracking-wider"
                      >
                        <Sparkles className="w-3 h-3 text-accent-600" /> Analyze with AI
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
