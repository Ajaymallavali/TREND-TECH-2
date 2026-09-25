import { RetailerAdapter } from './RetailerAdapter.js';

export class AmazonIndiaAdapter extends RetailerAdapter {
  constructor() {
    super('Amazon India', 'amazon_in');
  }

  async fetchProducts(query) {
    // Return mock search result listings
    return [
      { name: `${query} on Amazon`, price: 49999, originalPrice: 59999, isAvailable: true, url: 'https://www.amazon.in/s?k=' + encodeURIComponent(query) }
    ];
  }

  async fetchProductDetails(sku) {
    return {
      sku,
      currentPrice: 48999,
      originalPrice: 59999,
      isAvailable: true,
    };
  }
}

export class FlipkartAdapter extends RetailerAdapter {
  constructor() {
    super('Flipkart', 'flipkart');
  }

  async fetchProducts(query) {
    return [
      { name: `${query} on Flipkart`, price: 48500, originalPrice: 58999, isAvailable: true, url: 'https://www.flipkart.com/search?q=' + encodeURIComponent(query) }
    ];
  }

  async fetchProductDetails(sku) {
    return {
      sku,
      currentPrice: 47990,
      originalPrice: 58999,
      isAvailable: true,
    };
  }
}

export class CromaAdapter extends RetailerAdapter {
  constructor() {
    super('Croma', 'croma');
  }

  async fetchProducts(query) {
    return [
      { name: `${query} on Croma`, price: 49000, originalPrice: 59900, isAvailable: true, url: 'https://www.croma.com/searchB?q=' + encodeURIComponent(query) }
    ];
  }

  async fetchProductDetails(sku) {
    return {
      sku,
      currentPrice: 49000,
      originalPrice: 59900,
      isAvailable: true,
    };
  }
}

export class RelianceDigitalAdapter extends RetailerAdapter {
  constructor() {
    super('Reliance Digital', 'reliancedigital');
  }

  async fetchProducts(query) {
    return [
      { name: `${query} on Reliance Digital`, price: 49500, originalPrice: 59999, isAvailable: true, url: 'https://www.reliancedigital.in/search?q=' + encodeURIComponent(query) }
    ];
  }

  async fetchProductDetails(sku) {
    return {
      sku,
      currentPrice: 49200,
      originalPrice: 59999,
      isAvailable: true,
    };
  }
}

export class VijaySalesAdapter extends RetailerAdapter {
  constructor() {
    super('Vijay Sales', 'vijaysales');
  }

  async fetchProducts(query) {
    return [
      { name: `${query} on Vijay Sales`, price: 48999, originalPrice: 59900, isAvailable: true, url: 'https://www.vijaysales.com/search/' + encodeURIComponent(query) }
    ];
  }

  async fetchProductDetails(sku) {
    return {
      sku,
      currentPrice: 48999,
      originalPrice: 59900,
      isAvailable: true,
    };
  }
}

export class TataNeuAdapter extends RetailerAdapter {
  constructor() {
    super('Tata Neu', 'tataneu');
  }

  async fetchProducts(query) {
    return [
      { name: `${query} on Tata Neu`, price: 49200, originalPrice: 59999, isAvailable: true, url: 'https://www.tataneu.com/search?q=' + encodeURIComponent(query) }
    ];
  }

  async fetchProductDetails(sku) {
    return {
      sku,
      currentPrice: 49100,
      originalPrice: 59999,
      isAvailable: true,
    };
  }
}

// Factory function to get adapter by code
export function getAdapter(code) {
  switch (code.toLowerCase()) {
    case 'amazon_in':
      return new AmazonIndiaAdapter();
    case 'flipkart':
      return new FlipkartAdapter();
    case 'croma':
      return new CromaAdapter();
    case 'reliancedigital':
      return new RelianceDigitalAdapter();
    case 'vijaysales':
      return new VijaySalesAdapter();
    case 'tataneu':
      return new TataNeuAdapter();
    default:
      return null;
  }
}
