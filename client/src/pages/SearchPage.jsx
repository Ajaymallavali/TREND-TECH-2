import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, SlidersHorizontal, ArrowUpDown, Sparkles, Star, ShoppingBag, Eye, Heart } from 'lucide-react';
import { apiClient } from '../services/apiClient.js';
import ProductImage from '../components/ProductImage.jsx';
import AIShoppingSearch from '../components/shopping/AIShoppingSearch.jsx';
import { useSavedProducts } from '../hooks/useSavedProducts.js';

const formatINR = (val) => {
  if (val === null || val === undefined) return 'Price unavailable';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(val);
};

const BRANDS = ['Apple', 'Samsung', 'Sony', 'OnePlus', 'Asus', 'Lenovo', 'HP', 'LG', 'boAt', 'Amazfit', 'Noise', 'Fire-Boltt', 'Fossil', 'Fitbit', 'Dell', 'Acer', 'MSI', 'Xiaomi', 'TCL', 'VU', 'Canon', 'Nikon', 'Fujifilm', 'GoPro', 'DJI', 'Realme', 'Nothing', 'Vivo', 'Oppo', 'iQOO', 'Poco', 'Microsoft', 'Nintendo', 'Valve', 'Razer', 'Logitech'];

const CATEGORIES = [
  { id: 'smartphone', name: 'Smartphones' },
  { id: 'laptop', name: 'Laptops' },
  { id: 'television', name: 'TVs' },
  { id: 'headphones', name: 'Audio' },
  { id: 'smartwatch', name: 'Wearables' },
  { id: 'monitor', name: 'Monitors' },
  { id: 'tablet', name: 'Tablets' },
  { id: 'camera', name: 'Cameras' },
  { id: 'gaming', name: 'Gaming' },
];

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || '';
  const categoryParam = searchParams.get('category') || '';
  const { isSaved, toggleSave } = useSavedProducts();
  
  const [searchInput, setSearchInput] = useState(queryParam);
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [selectedBrand, setSelectedBrand] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minRating, setMinRating] = useState('');
  const [sortBy, setSortBy] = useState('price_asc');

  // Sync inputs with URL params
  useEffect(() => {
    setSearchInput(queryParam);
    setSelectedCategory(categoryParam);
  }, [queryParam, categoryParam]);

  const { data: products = [], isLoading, error } = useQuery({
    queryKey: ['search-products', queryParam, selectedCategory, selectedBrand, minPrice, maxPrice, minRating, sortBy],
    queryFn: async () => {
      const params = {};
      if (queryParam) params.q = queryParam;
      if (selectedCategory) params.category = selectedCategory;
      if (selectedBrand) params.brand = selectedBrand;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      if (minRating) params.rating = minRating;
      if (sortBy) params.sortBy = sortBy;

      const res = await apiClient.get('/products', { params });
      return res.data.data;
    },
  });

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    const newParams = new URLSearchParams(searchParams);
    if (searchInput) {
      newParams.set('q', searchInput);
    } else {
      newParams.delete('q');
    }
    setSearchParams(newParams);
  };

  const handleCategorySelect = (catId) => {
    const nextCat = selectedCategory === catId ? '' : catId;
    setSelectedCategory(nextCat);
    const newParams = new URLSearchParams(searchParams);
    if (nextCat) {
      newParams.set('category', nextCat);
    } else {
      newParams.delete('category');
    }
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setSelectedBrand('');
    setMinPrice('');
    setMaxPrice('');
    setMinRating('');
    setSortBy('price_asc');
  };

  return (
    <div className="min-h-screen bg-ink-50">
      {/* Header bar */}
      

      {/* Main Container */}
      <main className="mx-auto max-w-6xl px-6 py-8">
        
        <div className="mb-8">
          <AIShoppingSearch compact={true} />
        </div>

        
        {/* Category Tabs Pill Row */}
        <div className="flex flex-wrap gap-2 mb-6">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategorySelect(cat.id)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold border transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-accent-600 border-accent-600 text-white'
                  : 'bg-white border-ink-100 text-ink-700 hover:bg-ink-50'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-6 lg:flex-row">
          
          {/* Filters Sidebar */}
          <aside className="w-full lg:w-64 flex-shrink-0 space-y-4">
            <div className="card bg-white p-5 space-y-6">
              
              <div className="flex items-center justify-between border-b border-ink-50 pb-3">
                <h3 className="font-bold text-ink-900 flex items-center gap-1.5 text-sm">
                  <SlidersHorizontal className="h-4 w-4 text-ink-500" /> Filters
                </h3>
                <button onClick={clearFilters} className="text-[10px] font-bold text-accent-700 hover:underline">
                  Reset All
                </button>
              </div>

              {/* Brands Filter */}
              <div>
                <label className="block text-xs font-bold text-ink-600 uppercase tracking-wider mb-2">Brand</label>
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="input-field text-xs py-1.5"
                >
                  <option value="">All Brands</option>
                  {BRANDS.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              {/* Price Range Filter */}
              <div>
                <label className="block text-xs font-bold text-ink-600 uppercase tracking-wider mb-2">Price Range (₹)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    className="input-field text-xs py-1 px-2 text-center"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                  />
                  <span className="text-ink-300">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    className="input-field text-xs py-1 px-2 text-center"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                  />
                </div>
              </div>

              {/* Ratings Filter */}
              <div>
                <label className="block text-xs font-bold text-ink-600 uppercase tracking-wider mb-2">Ratings</label>
                <div className="space-y-2">
                  {[4.5, 4.2, 4.0].map((star) => (
                    <label key={star} className="flex items-center gap-2 text-xs text-ink-700 cursor-pointer">
                      <input
                        type="radio"
                        name="ratingFilter"
                        checked={minRating === String(star)}
                        onChange={() => setMinRating(String(star))}
                        className="text-accent-600 focus:ring-accent-500"
                      />
                      <span className="flex items-center gap-0.5">
                        {star} <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" /> & Above
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Sort Order */}
              <div>
                <label className="block text-xs font-bold text-ink-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <ArrowUpDown className="h-3.5 w-3.5" /> Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="input-field text-xs py-1.5"
                >
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="discount_desc">Biggest Discount</option>
                  <option value="rating_desc">Top Rated</option>
                </select>
              </div>

            </div>
          </aside>

          {/* Results Grid */}
          <section className="flex-grow">
            
            <div className="mb-4 flex items-center justify-between">
              <span className="text-xs text-ink-400 font-semibold">
                {isLoading ? 'Searching...' : `${products.length} electronics match filters`}
              </span>
            </div>

            {isLoading ? (
              <div className="flex flex-col justify-center items-center py-20 gap-3">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent-600 border-t-transparent" />
                <span className="text-sm font-medium text-ink-500">Searching catalog...</span>
              </div>
            ) : error ? (
              <div className="card text-center py-12 border-dashed border-2 border-red-200 bg-red-50/10">
                <p className="text-red-700 font-semibold">Search request failed. Please check filters.</p>
              </div>
            ) : products.length === 0 ? (
              <div className="card text-center py-16 bg-white border border-ink-100 rounded-2xl">
                <ShoppingBag className="mx-auto h-12 w-12 text-ink-300" />
                <h3 className="mt-4 text-base font-bold text-ink-900">No electronics found</h3>
                <p className="mt-1 text-xs text-ink-400">Try loosening your filters or modifying the search terms.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
                {products.map((p) => {
                  const saved = isSaved(p._id);
                  return (
                    <div
                      key={p._id}
                      className="card group flex flex-col justify-between hover:border-accent-300 transition-colors bg-white p-4 relative"
                    >
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleSave(p._id);
                        }}
                        className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-white/90 shadow hover:bg-white transition-colors"
                        title={saved ? 'Remove from saved' : 'Save product'}
                      >
                        <Heart className={`w-4 h-4 ${saved ? 'fill-red-500 text-red-500' : 'text-ink-400 hover:text-red-500'}`} />
                      </button>

                      <Link to={`/product/${p._id}`}>
                        <div className="mb-4 w-full">
                          <ProductImage
                            src={p.image}
                            alt={p.name}
                            category={p.category}
                            aspectClassName="aspect-video"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-ink-400">
                            {p.brand}
                          </span>
                          <span className="flex items-center gap-0.5 text-[10px] font-bold text-yellow-600 bg-yellow-50 border border-yellow-100 rounded px-1.5 py-0.5">
                            {p.rating?.toFixed(1) || '4.5'} <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                          </span>
                        </div>
                        <h3 className="mt-1 font-bold text-sm text-ink-900 group-hover:text-accent-600 transition-colors line-clamp-1 leading-snug">
                          {p.name}
                        </h3>
                        <p className="mt-1 line-clamp-2 text-[11px] text-ink-500 leading-relaxed">
                          {p.description}
                        </p>
                      </Link>

                      <div className="mt-4 pt-3 border-t border-ink-50">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <span className="block text-[9px] text-ink-400 font-bold uppercase">Lowest Price</span>
                            <span className="text-base font-black text-accent-700">
                              {formatINR(p.minPrice)}
                            </span>
                          </div>
                          <span className="rounded bg-ink-50 px-2 py-0.5 text-[10px] font-semibold text-ink-600">
                            {p.listingsCount} sellers
                          </span>
                        </div>

                        <div className="flex flex-col gap-2">
                          <Link
                            to={`/product/${p._id}`}
                            className="btn-primary py-2 text-center w-full block text-xs font-semibold flex items-center justify-center gap-1"
                          >
                            <Eye className="h-3.5 w-3.5" /> View Details
                          </Link>
                          <div className="grid grid-cols-2 gap-2">
                            <Link
                              to={`/compare?products=${p._id}`}
                              className="btn-secondary py-1.5 text-center text-[10px] font-semibold text-ink-700 border border-ink-200 hover:bg-ink-50 flex items-center justify-center"
                            >
                              Compare
                            </Link>
                            <Link
                              to={`/analysis?q=${encodeURIComponent('Analyze ' + p.name)}`}
                              className="w-full py-1.5 text-center text-[10px] font-bold text-accent-700 bg-accent-50 border border-accent-100 hover:bg-accent-100 rounded flex items-center justify-center gap-1 transition-colors uppercase tracking-widest"
                            >
                              <Sparkles className="w-3 h-3" /> AI
                            </Link>
                          </div>
                        </div>
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
