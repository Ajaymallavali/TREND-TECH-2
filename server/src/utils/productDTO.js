import { determineProductCategory } from './categoryMapper.js';
import { evaluateProductDealSignal } from '../services/deal.service.js';
import { isValidMarketplaceUrl } from './urlValidator.js';

export function isValidListing(l) {
  return (
    l &&
    l.marketplace &&
    isValidMarketplaceUrl(l.url)
  );
}

export function formatProductDTO(product, listings = []) {
  const validListings = listings.filter(isValidListing);

  const pricedListings = validListings.filter(
    (l) => l.currentPrice > 0 && (l.currency === 'INR' || !l.currency) && l.isAvailable
  );

  const prices = pricedListings.map((l) => l.currentPrice);
  const minPriceVal = prices.length > 0 ? Math.min(...prices) : null;
  const maxPriceVal = pricedListings.map((l) => l.originalPrice).filter(Boolean).reduce((a, b) => Math.max(a, b), minPriceVal || 0);

  const formattedOffers = validListings.map((l) => {
    const mp = l.marketplace;
    return {
      _id: l._id,
      id: l._id,
      marketplace: mp ? {
        _id: mp._id,
        name: mp.name,
        code: mp.code,
        logoUrl: mp.logoUrl,
        baseUrl: mp.baseUrl
      } : null,
      url: l.url,
      currentPrice: l.currentPrice,
      originalPrice: l.originalPrice || null,
      currency: l.currency || 'INR',
      isAvailable: l.isAvailable,
      lastUpdated: l.lastUpdated
    };
  });

  // Sort available offers by price ascending
  const availableOffersWithPrice = formattedOffers.filter(o => o.isAvailable && o.currentPrice > 0 && o.url);
  availableOffersWithPrice.sort((a, b) => a.currentPrice - b.currentPrice);
  const bestDealUrl = availableOffersWithPrice.length > 0 ? availableOffersWithPrice[0].url : (formattedOffers.length > 0 ? formattedOffers[0].url : null);

  const dealResult = evaluateProductDealSignal(product, validListings, []);

  return {
    _id: product._id,
    name: product.name,
    brand: product.brand,
    description: product.description || '',
    category: determineProductCategory(product),
    categoryId: product.categoryId || null,
    image: product.image || null,
    imageStatus: product.imageStatus || (product.image ? 'VERIFIED_MARKETPLACE' : 'UNVERIFIED'),
    specs: product.specs || {},
    tags: product.tags || [],
    minPrice: minPriceVal,
    maxPrice: maxPriceVal,
    discountPercentage: dealResult.discountPercentage || 0,
    dealStatus: dealResult.dealStatus || 'STABLE',
    dealSource: bestDealUrl,
    offersCount: validListings.length,
    offers: formattedOffers,
  };
}
