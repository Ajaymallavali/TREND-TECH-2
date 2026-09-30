import mongoose from 'mongoose';
import { URL } from 'url';

const APPROVED_DOMAINS = [
  'amazon.in', 'amazon.com', 'flipkart.com', 'myntra.com', 
  'ajio.com', 'nykaa.com', 'apple.com', 'samsung.com', 
  'croma.com', 'reliancedigital.in'
];

export function validateStoreUrl(storeUrl) {
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
    } else if (pathname.includes('/search') || (pathname.toLowerCase().includes('/s') && parsed.searchParams.has('k'))) {
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
      return { isValid: false, reason: `URL Type: ${urlType}. Product URL required.` };
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
      domain: hostname,
      url: normalizedUrl,
      originalUrl: storeUrl,
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

export async function findProductByUrlOrQuery(storeUrl, query) {
  const Product = mongoose.model('Product');
  const MarketplaceProduct = mongoose.model('MarketplaceProduct');
  
  let product = null;
  
  if (storeUrl) {
    const val = validateStoreUrl(storeUrl);
    if (val.isValid) {
      // Find marketplace product matching url exactly or by pathname
      const parsed = new URL(val.url);
      const urlRegex = new RegExp(parsed.pathname.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      
      const mp = await MarketplaceProduct.findOne({ url: urlRegex, isAvailable: true }).populate('product');
      if (mp && mp.product) {
        product = mp.product;
      }
    }
  }
  
  if (!product && query) {
    const cleanQuery = query.toLowerCase().trim();
    // Keywords for advanced matching
    const keywords = cleanQuery.split(/\s+/);
    const regexList = keywords.map(kw => new RegExp(kw, 'i'));

    // Try finding products matching all keywords in the name or tags
    const products = await Product.find({
      $and: regexList.map(r => ({
        $or: [
          { name: { $regex: r } },
          { model: { $regex: r } },
          { tags: { $regex: r } },
          { brand: { $regex: r } }
        ]
      }))
    }).lean();

    if (products.length > 0) {
      // Prioritize exact name matches
      const exactNameMatch = products.find(p => p.name.toLowerCase() === cleanQuery);
      if (exactNameMatch) {
        product = exactNameMatch;
      } else if (products.length === 1) {
        product = products[0];
      } else {
        // Partial match: return array
        return products.slice(0, 5); // Return top 5 matches
      }
    }
  }
  
  return product;
}
