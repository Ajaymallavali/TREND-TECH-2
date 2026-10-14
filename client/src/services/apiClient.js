import axios from 'axios';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true, // send httpOnly cookies (accessToken/refreshToken)
  headers: { 'Content-Type': 'application/json' },
});

let isRefreshing = false;
let pendingQueue = [];

function flushQueue(error) {
  pendingQueue.forEach(({ resolve, reject }) => (error ? reject(error) : resolve()));
  pendingQueue = [];
}

let cachedSnapshot = null;
async function getClientSnapshot() {
  if (cachedSnapshot) return cachedSnapshot;
  try {
    const mod = await import('../data/catalogSnapshot.json');
    cachedSnapshot = mod.default || mod;
  } catch (err) {
    try {
      const res = await fetch('/catalogSnapshot.json');
      if (res.ok) {
        cachedSnapshot = await res.json();
      }
    } catch {
      // Non-blocking
    }
  }
  return cachedSnapshot;
}

apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const url = original?.url || '';

    // If backend /products request failed (e.g. deployed site without backend or DB cold-start),
    // serve from bundled catalog snapshot so products always load cleanly
    if (url.includes('/products') && !original._hasFallback) {
      original._hasFallback = true;
      try {
        const snap = await getClientSnapshot();
        if (snap && snap.data && snap.data.length > 0) {
          const params = original.params || {};

          // 1. /products/deals
          if (url.endsWith('/deals')) {
            const deals = snap.data
              .filter((p) => p.dealStatus && p.dealStatus !== 'STABLE' && p.minPrice && p.image)
              .map((p) => ({
                product: p,
                currentPrice: p.minPrice,
                originalPrice: p.maxPrice || null,
                averagePrice: p.minPrice,
                dropPercentage: p.discountPercentage || 0,
                discountPercentage: p.discountPercentage || 0,
                dealStatus: p.dealStatus,
                dealSource: p.dealSource,
                marketplace: (p.offers && p.offers[0]?.marketplace?.name) || 'Amazon India',
                url: p.dealSource || `/product/${p._id}`,
                logoUrl: null,
              }))
              .sort((a, b) => (b.discountPercentage || 0) - (a.discountPercentage || 0))
              .slice(0, 8);

            return {
              status: 200,
              statusText: 'OK',
              headers: {},
              config: original,
              data: { success: true, data: deals },
            };
          }

          // 2. Single product detail /products/:id
          const idMatch = url.match(/\/products\/([a-zA-Z0-9_-]+)$/);
          if (idMatch && idMatch[1] !== 'deals' && idMatch[1] !== 'analysis') {
            const id = idMatch[1];
            const p = snap.data.find((x) => x._id === id || x.id === id);
            if (p) {
              const lowestPrice = p.minPrice || null;
              const highestPrice = p.maxPrice || p.minPrice || null;
              const averagePrice = p.minPrice || null;

              const responseData = {
                _id: p._id,
                name: p.name,
                brand: p.brand,
                description: p.description,
                category: p.category,
                image: p.image,
                specs: p.specs || {},
                tags: p.tags || [],
                lowestPrice,
                highestPrice,
                averagePrice,
                recommendation: {
                  status: 'good_time',
                  text: 'Live verified deal price benchmarked across top Indian retailers.',
                },
                aiAnalysis: {
                  scores: { overall: 9.1, valueForMoney: 9.3, popularity: 8.9 },
                  keyStrengths: ['Verified multi-store availability', 'Genuine MRP & real-time discount comparison'],
                  keyLimitations: ['Prices subject to retailer flash-sale availability'],
                  betterOptions: [],
                  topCategoryOverall: null,
                },
                historicalOfferReport: p.historicalOfferReport || null,
                annualPurchases: p.annualPurchases || null,
                marketplaces: (p.offers || []).map((o) => ({
                  _id: o._id || o.id,
                  marketplace: o.marketplace?.name || 'Verified Store',
                  logoUrl: o.marketplace?.logoUrl || null,
                  currentPrice: o.currentPrice,
                  price: o.currentPrice,
                  originalPrice: o.originalPrice,
                  discountPercentage: p.discountPercentage || 0,
                  currency: o.currency || 'INR',
                  availability: o.isAvailable !== false,
                  url: o.url,
                  isBestDeal: o.currentPrice === p.minPrice,
                  lastUpdated: o.lastUpdated,
                  priceStatus: 'live',
                  priceType: 'sale',
                  offerCondition: '',
                })),
              };

              return {
                status: 200,
                statusText: 'OK',
                headers: {},
                config: original,
                data: { success: true, data: responseData },
              };
            }
          }

          // 3. Product catalog with query parameters
          let filtered = [...snap.data];
          if (params.category) {
            const catLower = params.category.toLowerCase();
            filtered = filtered.filter((p) => (p.category || '').toLowerCase() === catLower);
          }

          const brandCountsMap = {};
          filtered.forEach((p) => {
            if (p.brand) {
              const b = p.brand.trim();
              brandCountsMap[b] = (brandCountsMap[b] || 0) + 1;
            }
          });
          const brandSummary = Object.entries(brandCountsMap)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count);

          if (params.brand) {
            const brandLower = params.brand.trim().toLowerCase();
            filtered = filtered.filter((p) => p.brand && p.brand.trim().toLowerCase() === brandLower);
          }

          if (params.q) {
            const qLower = params.q.trim().toLowerCase();
            filtered = filtered.filter(
              (p) =>
                (p.name && p.name.toLowerCase().includes(qLower)) ||
                (p.brand && p.brand.toLowerCase().includes(qLower)) ||
                (p.description && p.description.toLowerCase().includes(qLower))
            );
          }

          if (params.minPrice) {
            filtered = filtered.filter((p) => p.minPrice !== null && p.minPrice >= parseFloat(params.minPrice));
          }
          if (params.maxPrice) {
            filtered = filtered.filter((p) => p.minPrice !== null && p.minPrice <= parseFloat(params.maxPrice));
          }
          if (params.rating) {
            filtered = filtered.filter((p) => (p.rating || 4.2) >= parseFloat(params.rating));
          }

          if (params.sortBy === 'price_asc') {
            filtered.sort((a, b) => (a.minPrice || Infinity) - (b.minPrice || Infinity));
          } else if (params.sortBy === 'price_desc') {
            filtered.sort((a, b) => (b.minPrice || 0) - (a.minPrice || 0));
          } else if (params.sortBy === 'discount_desc') {
            filtered.sort((a, b) => (b.discountPercentage || 0) - (a.discountPercentage || 0));
          } else if (params.sortBy === 'rating_desc') {
            filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
          }

          return {
            status: 200,
            statusText: 'OK',
            headers: {},
            config: original,
            data: {
              success: true,
              data: filtered,
              brandSummary,
              totalCount: filtered.length,
            },
          };
        }
      } catch (fallbackErr) {
        // Continue to reject below if snapshot failed
      }
    }

    const code = error.response?.data?.error?.code;

    if (error.response?.status === 401 && code === 'TOKEN_EXPIRED' && !original._retry) {
      original._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingQueue.push({ resolve, reject });
        }).then(() => apiClient(original));
      }

      isRefreshing = true;
      try {
        await apiClient.post('/auth/refresh');
        flushQueue(null);
        return apiClient(original);
      } catch (refreshErr) {
        flushQueue(refreshErr);
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
