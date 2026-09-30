const { URL } = require('url');

const APPROVED_DOMAINS = [
  'amazon.in', 'amazon.com', 'flipkart.com', 'myntra.com', 
  'ajio.com', 'nykaa.com', 'apple.com', 'samsung.com', 
  'croma.com', 'reliancedigital.in'
];

function analyzeUrlIntelligence(storeUrl) {
  if (!storeUrl) return { isValid: false, reason: 'No URL provided' };
  try {
    const parsed = new URL(storeUrl);
    if (parsed.protocol !== 'https:') {
      return { isValid: false, reason: 'Only HTTPS protocol is supported' };
    }
    
    let hostname = parsed.hostname.toLowerCase();
    if (hostname.startsWith('www.')) {
      hostname = hostname.substring(4);
    }
    
    const isApproved = APPROVED_DOMAINS.some(d => hostname === d || hostname.endsWith(`.${d}`));
    
    if (!isApproved) {
      return { isValid: false, reason: 'Domain not in approved marketplace list' };
    }
    
    let marketplace = 'Unknown';
    if (hostname.includes('amazon')) marketplace = 'Amazon';
    else if (hostname.includes('flipkart')) marketplace = 'Flipkart';
    else if (hostname.includes('myntra')) marketplace = 'Myntra';
    else if (hostname.includes('ajio')) marketplace = 'Ajio';
    else if (hostname.includes('nykaa')) marketplace = 'Nykaa';
    else if (hostname.includes('croma')) marketplace = 'Croma';
    else if (hostname.includes('apple')) marketplace = 'Apple';
    else if (hostname.includes('samsung')) marketplace = 'Samsung';
    else if (hostname.includes('reliancedigital')) marketplace = 'Reliance Digital';
    
    let urlType = 'UNKNOWN PAGE';
    let productId = null;
    let variantId = null;
    
    const pathname = parsed.pathname;
    
    // Determine type & identifiers
    if (pathname === '/' || pathname === '') {
      urlType = 'HOME PAGE';
    } else if (pathname.includes('/search') || pathname.toLowerCase().includes('/s') && parsed.searchParams.has('k')) {
      urlType = 'PRODUCT SEARCH PAGE';
    } else if (pathname.includes('/c/') || pathname.includes('/category/')) {
      urlType = 'CATEGORY PAGE';
    } else if (pathname.includes('/seller/') || pathname.includes('/store/')) {
      urlType = 'SELLER PAGE';
    } else {
      urlType = 'EXACT PRODUCT PAGE';
      
      if (marketplace === 'Amazon') {
        const dpMatch = pathname.match(/\/(dp|gp\/product)\/([A-Z0-9]{10})/i);
        if (dpMatch) productId = dpMatch[2]; // ASIN
      } else if (marketplace === 'Flipkart') {
        const pidMatch = parsed.searchParams.get('pid');
        if (pidMatch) productId = pidMatch;
        const lidMatch = parsed.searchParams.get('lid');
        if (lidMatch) variantId = lidMatch;
      }
    }
    
    if (urlType !== 'EXACT PRODUCT PAGE') {
      return { isValid: false, reason: 'Product URL required' };
    }
    
    // Normalization: strip tracking params
    const safeParams = ['pid', 'lid', 'id', 'sku', 'variant'];
    const keysToDelete = [];
    for (const key of parsed.searchParams.keys()) {
      if (!safeParams.includes(key.toLowerCase())) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach(k => parsed.searchParams.delete(k));
    
    // Remove trailing slash
    let normalizedUrl = parsed.toString();
    if (normalizedUrl.endsWith('/')) {
      normalizedUrl = normalizedUrl.slice(0, -1);
    }
    
    return {
      isValid: true,
      originalUrl: storeUrl,
      normalizedUrl,
      marketplace,
      urlType,
      identifiers: {
        productId,
        variantId
      }
    };
  } catch (e) {
    return { isValid: false, reason: 'Malformed URL' };
  }
}

console.log(analyzeUrlIntelligence('https://www.amazon.in/Samsung-Galaxy-Ultra-Titanium-Storage/dp/B0CX21C8S1/ref=sr_1_1?crid=2XYY68521QY&dib=eyJ2IjoiMSJ9'));
console.log(analyzeUrlIntelligence('https://www.flipkart.com/samsung-galaxy-s24-ultra-5g-titanium-gray-256-gb/p/itm5b0f49673cc09?pid=MOBGX2FQR8GJ7K7R&lid=LSTMOBGX2FQR8GJ7K7R6R4W5O&marketplace=FLIPKART&q=s24+ultra&store=tyy%2F4io'));
