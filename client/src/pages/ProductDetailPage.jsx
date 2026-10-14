import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, ExternalLink, TrendingDown, AlertCircle, Heart, Bell, Sparkles, CheckCircle2, XCircle, Award, ShieldCheck } from 'lucide-react';
import { apiClient } from '../services/apiClient.js';
import { useAuthStore } from '../store/authStore.js';
import PriceHistoryChart from '../components/PriceHistoryChart.jsx';
import ProductImage from '../components/ProductImage.jsx';
import HistoricalOfferReport from '../components/HistoricalOfferReport.jsx';
import AnnualPurchaseBarChart from '../components/AnnualPurchaseBarChart.jsx';
import { getStoreRedirectUrl } from '../utils/storeUrlHelper';

const formatINR = (val) => {
  if (val === null || val === undefined) return 'Price unavailable';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(val);
};

const getStatusIndicator = (lastUpdated, realTime, priceStatus) => {
  if (priceStatus === 'unavailable' || !lastUpdated) {
    return { label: 'UNAVAILABLE', color: 'bg-ink-50 text-ink-600 border-ink-200' };
  }
  const diff = Date.now() - new Date(lastUpdated).getTime();
  const minutes = Math.max(0, Math.round(diff / 60000));
  if (minutes < 15) {
    return { label: 'DATABASE (Verified)', color: 'bg-green-50 text-green-700 border-green-100' };
  } else if (minutes < 1440) {
    return { label: 'RECENT', color: 'bg-blue-50 text-blue-700 border-blue-100' };
  } else {
    return { label: 'CACHED DATABASE', color: 'bg-amber-50 text-amber-700 border-amber-100' };
  }
};

const getActionLabel = (priceStatus, price) => {
  if (price === null || price === undefined || priceStatus === 'unavailable') return 'Search at Retailer';
  if (priceStatus === 'verified') return 'Buy Now';
  return 'View Deal';
};

import { motion } from 'framer-motion';

const staggerContainer = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

export default function ProductDetailPage() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const [selectedMarketplaces, setSelectedMarketplaces] = useState([]);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertTargetPrice, setAlertTargetPrice] = useState('');
  const [alertEmail, setAlertEmail] = useState(user?.email || '');

  // 1. Fetch Product details and store listings
  const { data: details, isLoading: detailsLoading, error: detailsError } = useQuery({
    queryKey: ['product-details', id],
    queryFn: async () => {
      const res = await apiClient.get(`/products/${id}`);
      return res.data.data;
    },
  });

  // 2. Fetch Price History for the chart
  const { data: history = [], isLoading: historyLoading } = useQuery({
    queryKey: ['product-history', id],
    queryFn: async () => {
      const res = await apiClient.get(`/products/${id}/history`);
      return res.data.data;
    },
  });

  // 3. Fetch Wishlist status
  const { data: wishlistData, refetch: refetchWishlist } = useQuery({
    queryKey: ['wishlist'],
    queryFn: async () => {
      const res = await apiClient.get('/wishlist');
      return res.data.data;
    },
    enabled: !!user,
  });

  const inWishlist = wishlistData?.some((item) => item.product._id === id);

  const toggleWishlist = async () => {
    if (!user) {
      alert('Please log in to add items to your wishlist.');
      return;
    }
    try {
      if (inWishlist) {
        await apiClient.delete(`/wishlist/${id}`);
      } else {
        await apiClient.post('/wishlist', { productId: id });
      }
      refetchWishlist();
    } catch (err) {
      alert('Failed to update wishlist');
    }
  };

  const handleCreateAlert = async (e) => {
    e.preventDefault();
    if (!alertTargetPrice) return;
    try {
      await apiClient.post('/price-alerts', {
        productId: id,
        targetPrice: parseFloat(alertTargetPrice),
        email: alertEmail,
      });
      alert('Price alert created successfully!');
      setShowAlertModal(false);
      setAlertTargetPrice('');
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to create price alert');
    }
  };

  // Initialize selected marketplaces once history loads (select all stores present across history)
  useEffect(() => {
    if (history.length > 0 && selectedMarketplaces.length === 0) {
      const allStores = Array.from(
        new Set(history.flatMap((item) => Object.keys(item).filter((key) => key !== 'date')))
      );
      setSelectedMarketplaces(allStores);
    }
  }, [history, selectedMarketplaces.length]);

  if (detailsLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-accent-600 border-t-transparent"></div>
      </div>
    );
  }

  if (detailsError || !details) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-ink-50 p-6 text-center">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <h1 className="mt-4 text-xl font-semibold text-ink-900 font-sans">Product not found</h1>
        <p className="mt-2 text-ink-500">The product you are looking for does not exist or has been removed.</p>
        <Link to="/" className="btn-primary mt-6 inline-flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>
      </div>
    );
  }

  const { name, brand, description, image, specs, tags, marketplaces = [] } = details;

  // Available unique marketplaces in price history for toggling
  const availableMarketplaces = history.length > 0
    ? Array.from(new Set(history.flatMap((item) => Object.keys(item).filter((key) => key !== 'date'))))
    : [];

  const lowestListing = marketplaces.find((l) => l.isBestDeal) || null;
  const normalDeals = marketplaces.filter((l) => l.currentPrice && l.priceType !== 'bank_offer' && l.priceType !== 'exchange_offer');
  const lowestNormalListing = normalDeals.length > 0 ? normalDeals[0] : null;
  const hasRealTime = marketplaces.some((l) => l.lastUpdated);

  return (
    <div className="min-h-screen bg-ink-50 pb-20">
      {/* Header Bar */}
      

      <motion.main variants={staggerContainer} initial="hidden" animate="show" className="mx-auto mt-8 max-w-6xl px-6 space-y-8">
        {/* Product Identity */}
        <motion.div variants={fadeInUp} className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xs font-black uppercase tracking-widest text-accent-700">{brand}</span>
            <h1 className="mt-1 text-2xl font-black text-ink-950 sm:text-3xl tracking-tight">{name}</h1>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={toggleWishlist}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-bold shadow-xs active:scale-95 transition-all ${
                inWishlist
                  ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                  : 'bg-white text-ink-700 border-ink-200 hover:bg-ink-50 hover:border-ink-300'
              }`}
            >
              <Heart className={`h-4 w-4 ${inWishlist ? 'fill-red-600 text-red-600' : ''}`} />
              <span>{inWishlist ? 'Saved' : 'Save'}</span>
            </button>
            <button
              onClick={() => setShowAlertModal(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-accent-200 bg-accent-50 px-3.5 py-2 text-xs font-bold text-accent-800 shadow-xs hover:bg-accent-100 active:scale-95 transition-all"
            >
              <Bell className="h-4 w-4 text-accent-600" />
              <span>Price Alert</span>
            </button>
            <Link
              to={`/analysis?q=${encodeURIComponent('Analyze ' + name)}`}
              className="inline-flex items-center gap-1.5 rounded-xl border border-purple-200 bg-purple-50 px-3.5 py-2 text-xs font-bold text-purple-800 shadow-xs hover:bg-purple-100 active:scale-95 transition-all"
            >
              <Sparkles className="h-4 w-4 text-purple-600" />
              <span>AI Analysis</span>
            </Link>
            {marketplaces.length > 0 && (() => {
              const indicator = getStatusIndicator(marketplaces[0].lastUpdated, hasRealTime, marketplaces[0].priceStatus);
              return (
                <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold shadow-2xs ${indicator.color}`}>
                  <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
                  <span>{indicator.label}</span>
                </span>
              );
            })()}
          </div>
        </motion.div>

        {/* Top Section: About, Specs & Insights */}
        <motion.div variants={fadeInUp} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* About / Product card */}
          <div className="card flex flex-col md:flex-row gap-6 items-center lg:col-span-2 shadow-card hover:border-accent-200 transition-all">
            <div className="w-full md:w-2/5 aspect-square bg-ink-50/50 rounded-xl p-4 border border-ink-100/60 flex items-center justify-center overflow-hidden">
              <ProductImage src={image} alt={name} category={details.category} aspectClassName="aspect-square" className="max-h-[220px] mx-auto hover:scale-105 transition-transform duration-300" />
            </div>
            <div className="flex-grow flex-shrink flex-basis-0 space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-ink-400">About this product</h3>
              <p className="text-sm leading-relaxed text-ink-600 font-normal">{description}</p>
              
              {tags && tags.length > 0 && (
                <div className="mt-4 pt-2 flex flex-wrap gap-1.5 border-t border-ink-50">
                  {tags.map((tag) => (
                    <span key={tag} className="rounded-md bg-ink-50 border border-ink-100/70 px-2 py-0.5 text-[10px] font-semibold text-ink-600">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Specifications list */}
          <div className="card flex flex-col justify-between">
            <div>
              <h3 className="font-semibold text-ink-900">Key Specifications</h3>
              {specs && Object.keys(specs).length > 0 ? (
                <div className="mt-4 border-t border-ink-50 divide-y divide-ink-50">
                  {Object.entries(specs).slice(0, 4).map(([key, val]) => (
                    <div key={key} className="flex justify-between py-2 text-xs">
                      <dt className="font-medium text-ink-400">{key}</dt>
                      <dd className="font-semibold text-ink-900">{val}</dd>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-xs text-ink-400">No key specifications listed.</p>
              )}
            </div>

            {lowestListing && (
              <div className="mt-4 bg-accent-50/20 border border-accent-100/50 flex items-start gap-2.5 p-3 rounded-lg">
                <TrendingDown className="h-4 w-4 text-accent-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-[10px] font-bold text-ink-900 uppercase">Savings Insight</h4>
                  <p className="text-[10px] text-ink-500 leading-snug mt-0.5">
                    Cheapest at <strong>{lowestListing.marketplace}</strong> for <strong>{formatINR(lowestListing.currentPrice)}</strong>.
                  </p>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Smart Product & Reel AI Analysis Section */}
        {details.aiAnalysis && (
          <motion.div variants={fadeInUp} className="card space-y-6">
            <div className="flex flex-wrap items-center justify-between border-b border-ink-50 pb-4 gap-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-accent-600" />
                <h3 className="text-lg font-bold text-ink-900">Smart Product & Reel AI Analysis</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-accent-50 px-3 py-1 text-xs font-semibold text-accent-700 border border-accent-100 flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-accent-600" />
                  Verified marketplace data
                </span>
                {marketplaces.length > 0 && marketplaces[0].lastUpdated && (
                  <span className="text-[11px] text-ink-400">
                    Last updated: {new Date(marketplaces[0].lastUpdated).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>

            {/* AI Scores Grid */}
            {details.aiAnalysis.scores && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-ink-500 mb-3">AI Evaluation Scores (0-100)</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                  {Object.entries({
                    'Performance': details.aiAnalysis.scores.performance,
                    'Features': details.aiAnalysis.scores.features,
                    'Build Quality': details.aiAnalysis.scores.buildQuality,
                    'Ease of Use': details.aiAnalysis.scores.easeOfUse,
                    'Price Value': details.aiAnalysis.scores.priceToPerformance,
                    'Availability': details.aiAnalysis.scores.availability,
                  }).map(([label, score]) => (
                    <div key={label} className="rounded-xl border border-ink-100 bg-ink-50/50 p-3 text-center">
                      <span className="text-[11px] font-medium text-ink-500 block truncate">{label}</span>
                      <span className="text-xl font-extrabold text-ink-900 mt-1 block">
                        {typeof score === 'number' ? score : 'N/A'}
                      </span>
                      <div className="mt-2 h-1.5 w-full bg-ink-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-accent-600 rounded-full"
                          style={{ width: `${typeof score === 'number' ? Math.min(100, Math.max(0, score)) : 0}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Key Strengths & Key Limitations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* Key Strengths */}
              <div className="rounded-xl border border-green-100 bg-green-50/30 p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-green-800 mb-3 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-green-600" /> Key Strengths
                </h4>
                <ul className="space-y-2.5">
                  {details.aiAnalysis.keyStrengths?.map((item, idx) => (
                    <li key={idx} className="text-xs">
                      <span className="font-semibold text-green-950 block">{item.title}</span>
                      <span className="text-green-700 text-[11px] leading-relaxed">{item.detail}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Key Limitations */}
              <div className="rounded-xl border border-amber-100 bg-amber-50/30 p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 mb-3 flex items-center gap-1.5">
                  <XCircle className="h-4 w-4 text-amber-600" /> Key Limitations
                </h4>
                <ul className="space-y-2.5">
                  {details.aiAnalysis.keyLimitations?.map((item, idx) => (
                    <li key={idx} className="text-xs">
                      <span className="font-semibold text-amber-950 block">{item.title}</span>
                      <span className="text-amber-700 text-[11px] leading-relaxed">{item.detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* See Better Options */}
            {details.aiAnalysis.betterOptions && details.aiAnalysis.betterOptions.length > 0 && (
              <div className="pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-ink-500 mb-3">See Better Options in DB</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {details.aiAnalysis.betterOptions.map((opt) => (
                    <Link
                      key={opt._id}
                      to={`/product/${opt._id}`}
                      className="group rounded-xl border border-ink-100 bg-white p-3 hover:border-accent-200 hover:shadow-sm transition-all flex items-center gap-3"
                    >
                      <div className="h-12 w-12 flex-shrink-0">
                        <ProductImage src={opt.image} alt={opt.name} category={opt.category} aspectClassName="aspect-square" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] font-bold text-accent-600 uppercase block">{opt.brand}</span>
                        <h5 className="text-xs font-semibold text-ink-900 truncate group-hover:text-accent-600">{opt.name}</h5>
                        <span className="text-xs font-bold text-ink-700 block mt-0.5">
                          {opt.lowestPrice ? formatINR(opt.lowestPrice) : 'Check Offers'}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Top Overall Category Rankings */}
            {details.aiAnalysis.topCategoryOverall && details.aiAnalysis.topCategoryOverall.length > 0 && (
              <div className="pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-ink-500 mb-3 flex items-center gap-1.5">
                  <Award className="h-4 w-4 text-accent-600" /> Top Overall Category Ranking
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
                  {details.aiAnalysis.topCategoryOverall.map((ranked, idx) => (
                    <Link
                      key={ranked._id}
                      to={`/product/${ranked._id}`}
                      className="group rounded-xl border border-ink-100 bg-white p-3 hover:border-accent-200 transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between text-[10px] font-bold text-ink-400 mb-2">
                          <span>#{idx + 1} Rank</span>
                          <span className="rounded bg-accent-50 px-1.5 py-0.5 text-accent-700">{ranked.overallScore} / 100</span>
                        </div>
                        <ProductImage src={ranked.image} alt={ranked.name} category={ranked.category} aspectClassName="aspect-square" />
                        <h5 className="text-xs font-semibold text-ink-900 truncate mt-2 group-hover:text-accent-600">{ranked.name}</h5>
                      </div>
                      <span className="text-xs font-bold text-accent-700 mt-2 block">
                        {ranked.lowestPrice ? formatINR(ranked.lowestPrice) : 'Check Offers'}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Historical Deal & Offer Intelligence Report */}
        {details.historicalOfferReport && (
          <motion.div variants={fadeInUp}>
            <HistoricalOfferReport report={details.historicalOfferReport} />
          </motion.div>
        )}

        {/* Middle Section: Compare Prices Rank Table */}
        <motion.div variants={fadeInUp} className="card">
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h3 className="font-semibold text-ink-900">Compare Prices</h3>
              <p className="text-xs text-ink-400">
                {marketplaces.length > 0
                  ? `Showing ${marketplaces.length} best available prices`
                  : 'No verified marketplace prices are currently available.'}
              </p>
            </div>
          </div>

          {marketplaces.length === 0 ? (
            <div className="border border-dashed border-ink-200 rounded-xl p-8 text-center text-sm text-ink-400">
              No verified marketplace prices are currently available.
            </div>
          ) : (
            <>
              {lowestNormalListing && (
                <div className="mb-6 rounded-2xl border border-accent-200/80 bg-gradient-to-r from-accent-50/60 via-white to-emerald-50/30 p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xs">
                  <div>
                    <span className="inline-flex items-center gap-1 rounded-md bg-accent-100/90 px-2 py-0.5 text-[10px] font-black text-accent-800 uppercase tracking-wider">
                      🏆 Lowest Verified Price
                    </span>
                    <div className="mt-2 text-2xl font-black text-ink-950">
                      {formatINR(lowestNormalListing.currentPrice)}
                    </div>
                    <div className="text-xs text-ink-500 mt-1">
                      Available at <span className="font-bold text-ink-800">{lowestNormalListing.marketplace}</span> with no conditional requirements
                    </div>
                  </div>
                  <a
                    href={getStoreRedirectUrl(lowestNormalListing.marketplace, details, lowestNormalListing.url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary py-2.5 px-6 text-xs font-bold self-stretch sm:self-auto text-center flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <span>{getActionLabel(lowestNormalListing.priceStatus, lowestNormalListing.currentPrice)}</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-ink-100 text-[11px] font-bold text-ink-400 uppercase tracking-wider">
                      <th className="py-3 px-3">Rank</th>
                      <th className="py-3 px-3">Store</th>
                      <th className="py-3 px-3">Price</th>
                      <th className="py-3 px-3 text-right">Discount</th>
                      <th className="py-3 px-3 text-center">Availability</th>
                      <th className="py-3 px-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink-50">
                    {marketplaces.map((listing, index) => {
                      const rank = index + 1;
                      const isBestDeal = listing.isBestDeal;

                      const discountText = (listing.originalPrice && listing.currentPrice && listing.originalPrice > listing.currentPrice)
                        ? `${listing.discountPercentage}% OFF`
                        : null;

                      const btnLabel = getActionLabel(listing.priceStatus, listing.currentPrice);

                      return (
                        <tr
                          key={listing._id || listing.marketplace}
                          className={`text-sm transition-colors ${
                            isBestDeal
                              ? 'bg-accent-50/30 font-semibold text-accent-950 border-y border-accent-200/60'
                              : 'text-ink-700 hover:bg-ink-50/40'
                          }`}
                        >
                          <td className="py-3.5 px-3 font-mono text-xs font-bold">
                            {isBestDeal ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent-100 text-accent-800 text-[10px] font-black">
                                🏆 #1
                              </span>
                            ) : (
                              <span className="text-ink-400">#{rank}</span>
                            )}
                          </td>
                          <td className="py-3.5 px-3">
                            <div className="flex items-center gap-2">
                              {listing.logoUrl ? (
                                <div className="relative h-5 flex items-center">
                                  <img
                                    src={listing.logoUrl}
                                    alt={listing.marketplace}
                                    className="h-full w-auto max-w-[80px] object-contain"
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                      if (e.target.nextSibling) {
                                        e.target.nextSibling.style.display = 'inline';
                                      }
                                    }}
                                  />
                                  <span style={{ display: 'none' }} className="text-xs font-bold text-ink-800">
                                    {listing.marketplace}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-xs font-bold text-ink-800">{listing.marketplace}</span>
                              )}
                            </div>
                          </td>
                          <td className="py-3.5 px-3">
                            <span className="text-ink-950 font-black">
                              {formatINR(listing.currentPrice)}
                              {listing.priceType === 'bank_offer' && '*'}
                            </span>
                            {listing.priceType === 'bank_offer' && listing.offerCondition && (
                              <span className="block text-[10px] text-ink-400 font-normal mt-0.5">
                                *{listing.offerCondition}
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-3 text-right">
                            {discountText ? (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                                {discountText}
                              </span>
                            ) : (
                              <span className="text-xs text-ink-400 font-medium">Standard</span>
                            )}
                          </td>
                          <td className="py-3.5 px-3 text-center">
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                                listing.availability
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/50'
                                  : 'bg-red-50 text-red-700 border border-red-200/50'
                              }`}
                            >
                              <span className={`h-1.5 w-1.5 rounded-full ${listing.availability ? 'bg-emerald-500' : 'bg-red-500'}`} />
                              <span>{listing.availability ? 'In Stock' : 'Out of Stock'}</span>
                            </span>
                          </td>
                          <td className="py-3.5 px-3 text-center">
                            <a
                              href={getStoreRedirectUrl(listing.marketplace, details, listing.url)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`inline-flex items-center justify-center rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all shadow-xs ${
                                isBestDeal
                                  ? 'bg-accent-600 text-white hover:bg-accent-700 hover:shadow-md'
                                  : 'bg-ink-900 text-white hover:bg-ink-800'
                              }`}
                            >
                              <span>{btnLabel}</span>
                              <ExternalLink className="h-3 w-3 ml-1.5" />
                            </a>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </motion.div>

        {/* Bottom Section: Price History Chart & Checkboxes */}
        <motion.div variants={fadeInUp} className="card shadow-card">
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-ink-50 pb-3">
            <div>
              <h3 className="font-bold text-ink-900 text-base">30-Day Price Trend</h3>
              <p className="text-xs text-ink-400">Chronological price fluctuations observed across verified retailers</p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-ink-50 text-[10px] font-bold text-ink-600 border border-ink-100 self-start sm:self-auto">
              <span>Timeframe: Last 30 Days</span>
            </span>
          </div>

          {availableMarketplaces.length > 0 && (
            <div className="mb-5 flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-ink-400 uppercase tracking-wider mr-1">
                Toggle Stores:
              </span>
              {availableMarketplaces.map((mName) => {
                const isChecked = selectedMarketplaces.includes(mName);
                return (
                  <button
                    key={mName}
                    type="button"
                    onClick={() => {
                      if (isChecked) {
                        setSelectedMarketplaces(
                          selectedMarketplaces.filter((name) => name !== mName)
                        );
                      } else {
                        setSelectedMarketplaces([...selectedMarketplaces, mName]);
                      }
                    }}
                    className={`inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-bold transition-all shadow-2xs active:scale-95 ${
                      isChecked
                        ? 'bg-ink-900 text-white border border-ink-900 shadow-xs'
                        : 'bg-white text-ink-500 border border-ink-200 hover:border-ink-300 hover:text-ink-900'
                    }`}
                  >
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{
                        backgroundColor:
                          mName.includes('Amazon') ? '#FF9900' :
                          mName.includes('Flipkart') ? '#2874F0' :
                          mName.includes('Croma') ? '#00BFA5' :
                          mName.includes('Reliance') ? '#E31837' : '#1ea864'
                      }}
                    />
                    <span>{mName}</span>
                  </button>
                );
              })}
            </div>
          )}

          {historyLoading ? (
            <div className="flex h-[350px] items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent-600 border-t-transparent"></div>
            </div>
          ) : (
            <PriceHistoryChart data={history} selectedMarketplaces={selectedMarketplaces} />
          )}
        </motion.div>

        {/* Annual Purchasing Activity & Demand Volume Bar Graph */}
        {details.annualPurchases && (
          <motion.div variants={fadeInUp}>
            <AnnualPurchaseBarChart data={details.annualPurchases} productName={name} />
          </motion.div>
        )}
      </motion.main>

      {/* Price Alert Modal */}
      {showAlertModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl border border-ink-100">
            <h3 className="text-lg font-bold text-ink-900">Set Price Alert</h3>
            <p className="mt-1 text-xs text-ink-500">
              We'll send you an email notification as soon as the price for this product drops below your target price.
            </p>
            <form onSubmit={handleCreateAlert} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-ink-600 mb-1">Target Price (INR)</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-sm text-ink-400 font-semibold">₹</span>
                  <input
                    type="number"
                    required
                    className="input-field pl-7"
                    placeholder="e.g. 75000"
                    value={alertTargetPrice}
                    onChange={(e) => setAlertTargetPrice(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-ink-600 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  className="input-field"
                  placeholder="name@example.com"
                  value={alertEmail}
                  onChange={(e) => setAlertEmail(e.target.value)}
                  disabled={!!user}
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAlertModal(false)}
                  className="btn-secondary text-xs px-4 py-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary text-xs px-4 py-2"
                >
                  Create Alert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
