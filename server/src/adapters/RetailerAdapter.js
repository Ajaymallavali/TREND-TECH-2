export class RetailerAdapter {
  constructor(marketplaceName, code) {
    this.marketplaceName = marketplaceName;
    this.code = code;
  }

  /**
   * Fetch products for a specific category or query from the retailer.
   * @param {string} category 
   * @returns {Promise<Array>} List of raw products
   */
  async fetchProducts(category) {
    throw new Error('fetchProducts must be implemented');
  }

  /**
   * Fetch detailed specifications and live price for a specific product ID.
   * @param {string} productId 
   * @returns {Promise<Object>} Detailed product info
   */
  async fetchProductDetails(productId) {
    throw new Error('fetchProductDetails must be implemented');
  }

  /**
   * Normalize raw product object to canonical platform format.
   * @param {Object} rawProduct 
   * @returns {Object} Normalized product
   */
  normalizeProduct(rawProduct) {
    return {
      name: rawProduct.name || '',
      brand: rawProduct.brand || '',
      model: rawProduct.model || rawProduct.name || '',
      category: rawProduct.category || 'electronics',
      image: rawProduct.image || '',
      specifications: rawProduct.specifications || {},
    };
  }

  /**
   * Normalize raw price strings or numbers into floats in INR.
   * @param {any} rawPrice 
   * @returns {number} Normalized price
   */
  normalizePrice(rawPrice) {
    if (typeof rawPrice === 'number') return rawPrice;
    if (!rawPrice) return 0;
    // Strip ₹, Rs, commas, and parse
    const clean = String(rawPrice).replace(/[₹\s,]|Rs\.?/gi, '');
    return parseFloat(clean) || 0;
  }

  /**
   * Standardize stock/availability representations.
   * @param {any} rawAvailability 
   * @returns {boolean} Is available
   */
  checkAvailability(rawAvailability) {
    if (typeof rawAvailability === 'boolean') return rawAvailability;
    if (!rawAvailability) return false;
    const str = String(rawAvailability).toLowerCase();
    return str.includes('in stock') || str.includes('available') || str.includes('yes');
  }
}
