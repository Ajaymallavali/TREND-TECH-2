/**
 * Client-Side Automated E-Commerce Store URL Generator
 * 
 * Ensures every store redirect link (Amazon, Flipkart, Croma, etc.) 
 * executes a live automated product search using the product's brand, name, and model.
 * Never lands on a 404 or dead product page.
 */

export function cleanProductTitle(product) {
  if (!product) return 'product';
  
  let brand = '';
  let name = '';
  let model = '';

  if (typeof product === 'string') {
    name = product.trim();
  } else if (typeof product === 'object' && product !== null) {
    const rawBrand = product.brand != null ? String(product.brand).trim() : '';
    if (rawBrand && rawBrand !== 'UNKNOWN' && rawBrand !== 'Unknown') {
      brand = rawBrand;
    }
    name = product.name != null ? String(product.name).trim() : '';
    const rawModel = product.model != null ? String(product.model).trim() : '';
    if (rawModel && rawModel !== 'UNKNOWN' && rawModel !== 'UNRESOLVED' && rawModel !== 'Unknown') {
      model = rawModel;
    }
  }

  // Remove generic category taxonomy prefixes
  const categoryPrefixes = [
    /^smartphone\s+/i,
    /^television\s+/i,
    /^laptops?\s+/i,
    /^desktops?\s+/i,
    /^audio\s+/i,
    /^cameras?\s+/i,
    /^washing machines?\s+/i,
    /^refrigerators?\s+/i,
    /^air conditioners?\s+/i,
    /^footwear\s+/i,
    /^tops\s+/i,
    /^bottoms\s+/i,
    /^bags?\s+/i,
    /^accessories\s+/i,
    /^gaming\s+/i,
    /^consoles\s+/i,
    /^computer accessories\s+/i
  ];

  for (const prefix of categoryPrefixes) {
    name = name.replace(prefix, '');
  }

  name = name.replace(/\bUNKNOWN\b/gi, '').trim();
  brand = brand.replace(/\bUNKNOWN\b/gi, '').trim();
  model = model.replace(/\bUNKNOWN\b/gi, '').trim();

  const parts = [];
  if (brand && !name.toLowerCase().includes(brand.toLowerCase())) {
    parts.push(brand);
  }
  if (name) {
    parts.push(name);
  }
  if (model && !name.toLowerCase().includes(model.toLowerCase()) && !parts.join(' ').toLowerCase().includes(model.toLowerCase())) {
    parts.push(model);
  }

  const rawWords = parts.join(' ').replace(/\s+/g, ' ').trim().split(/\s+/);
  const cleanWords = [];
  for (const w of rawWords) {
    if (w && (cleanWords.length === 0 || cleanWords[cleanWords.length - 1].toLowerCase() !== w.toLowerCase())) {
      cleanWords.push(w);
    }
  }
  const query = cleanWords.join(' ').trim();
  return query || 'product';
}

export function getStoreRedirectUrl(marketplaceName, product, rawUrl = '') {
  let mName = '';
  if (typeof marketplaceName === 'string') {
    mName = marketplaceName.toLowerCase().trim();
  } else if (marketplaceName && typeof marketplaceName === 'object') {
    mName = String(marketplaceName.name || marketplaceName.code || marketplaceName.marketplace || '').toLowerCase().trim();
  }

  const searchTerms = cleanProductTitle(product);
  const encodedQuery = encodeURIComponent(searchTerms);

  const cleanRawUrl = (typeof rawUrl === 'string') ? rawUrl.trim() : '';

  // If rawUrl is already a verified clean search URL without UNKNOWN or duplicate words, keep it
  const hasDuplicateWords = cleanRawUrl && /(?:^|[?&=%20+])(\w+)(?:%20|\+|\s+)\1(?=[?&=%20+]|$)/i.test(cleanRawUrl);
  if (cleanRawUrl && cleanRawUrl.includes('/s?') && !cleanRawUrl.includes('UNKNOWN') && !hasDuplicateWords && cleanRawUrl.includes('amazon.')) {
    return cleanRawUrl;
  }
  if (cleanRawUrl && cleanRawUrl.includes('/search?') && !cleanRawUrl.includes('UNKNOWN') && !hasDuplicateWords && cleanRawUrl.includes('flipkart.com')) {
    return cleanRawUrl;
  }

  // 1. Amazon India
  if (mName.includes('amazon')) {
    return `https://www.amazon.in/s?k=${encodedQuery}`;
  }

  // 2. Flipkart
  if (mName.includes('flipkart')) {
    return `https://www.flipkart.com/search?q=${encodedQuery}`;
  }

  // 3. Croma
  if (mName.includes('croma')) {
    return `https://www.croma.com/searchB?q=${encodedQuery}%3Arelevance`;
  }

  // 4. Reliance Digital
  if (mName.includes('reliance')) {
    return `https://www.reliancedigital.in/search?q=${encodedQuery}`;
  }

  // 5. Myntra
  if (mName.includes('myntra')) {
    return `https://www.myntra.com/${encodeURIComponent(searchTerms.replace(/\s+/g, '-'))}`;
  }

  // 6. Ajio
  if (mName.includes('ajio')) {
    return `https://www.ajio.com/search/?text=${encodedQuery}`;
  }

  // 7. Nykaa
  if (mName.includes('nykaa')) {
    return `https://www.nykaa.com/search/result/?q=${encodedQuery}`;
  }

  // 8. Samsung Store
  if (mName.includes('samsung')) {
    return `https://www.samsung.com/in/search/?searchvalue=${encodedQuery}`;
  }

  // 9. Apple Store
  if (mName.includes('apple')) {
    return `https://www.apple.com/in/search/${encodedQuery}`;
  }

  // 10. Vijay Sales
  if (mName.includes('vijay')) {
    return `https://www.vijaysales.com/search/${encodedQuery}`;
  }

  if (rawUrl && rawUrl.startsWith('http')) {
    return rawUrl;
  }

  return `https://www.amazon.in/s?k=${encodedQuery}`;
}
