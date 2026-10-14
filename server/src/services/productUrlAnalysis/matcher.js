import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { URL } from 'url';
import { Product } from '../../models/Product.model.js';
import { MarketplaceProduct } from '../../models/MarketplaceProduct.model.js';
import { isDBConnected } from '../../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let catalogSnapshot = null;
function getCatalogSnapshot() {
  if (catalogSnapshot) return catalogSnapshot;
  try {
    const candidates = [
      path.resolve(__dirname, '../../data/catalogSnapshot.json'),
      path.resolve(process.cwd(), 'server/src/data/catalogSnapshot.json'),
      path.resolve(process.cwd(), 'client/dist/catalogSnapshot.json'),
    ];
    for (const c of candidates) {
      if (fs.existsSync(c)) {
        catalogSnapshot = JSON.parse(fs.readFileSync(c, 'utf8'));
        break;
      }
    }
  } catch {}
  return catalogSnapshot;
}

const APPROVED_DOMAINS = [
  'amazon.in', 'amazon.com', 'flipkart.com', 'myntra.com', 
  'ajio.com', 'nykaa.com', 'apple.com', 'samsung.com', 
  'croma.com', 'reliancedigital.in'
];

export function validateStoreUrl(storeUrl, { allowSearchUrls = false } = {}) {
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
    
    if (urlType !== 'EXACT PRODUCT PAGE' && !(allowSearchUrls && urlType === 'PRODUCT SEARCH PAGE')) {
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
  let product = null;

  if (!isDBConnected()) {
    const snap = getCatalogSnapshot();
    if (snap && snap.data) {
      if (query) {
        const qLower = query.toLowerCase().trim();
        const matches = snap.data.filter(
          (p) =>
            (p.name && p.name.toLowerCase().includes(qLower)) ||
            (p.brand && p.brand.toLowerCase().includes(qLower))
        );
        if (matches.length === 1) return matches[0];
        if (matches.length > 1) return matches.slice(0, 5);
      }
      if (storeUrl) {
        const match = snap.data.find((p) =>
          (p.offers || []).some((o) => o.url && o.url.includes(storeUrl))
        );
        if (match) return match;
      }
    }
    return null;
  }
  
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
    let cleanQuery = query.toLowerCase().trim();

    // Strip common intent prefixes so queries like "Analyze Smartphone Reno" match catalog products
    const intentPrefixes = [
      /^analyze\s+deals?\s+for\s+/i,
      /^analyze\s+product\s+/i,
      /^analyze\s+price\s+(?:of|for)\s+/i,
      /^analyze\s+/i,
      /^compare\s+deals?\s+for\s+/i,
      /^compare\s+price\s+of\s+/i,
      /^compare\s+/i,
      /^check\s+price\s+(?:of|for)\s+/i,
      /^check\s+deals?\s+for\s+/i,
      /^check\s+/i,
      /^find\s+best\s+price\s+for\s+/i,
      /^find\s+deals?\s+for\s+/i,
      /^find\s+/i,
      /^search\s+for\s+/i,
      /^search\s+/i,
      /^show\s+me\s+deals?\s+for\s+/i,
      /^show\s+me\s+/i,
      /^best\s+deals?\s+for\s+/i,
      /^best\s+price\s+for\s+/i,
      /^reviews?\s+of\s+/i,
      /^reviews?\s+/i,
      /^price\s+of\s+/i,
      /^deals?\s+for\s+/i
    ];

    for (const prefix of intentPrefixes) {
      cleanQuery = cleanQuery.replace(prefix, '').trim();
    }

    // Also strip generic category prefixes from query (e.g. "smartphone razr" -> "razr", "television bravia" -> "bravia")
    const categoryPrefixes = [
      /^smartphones?\s+/i,
      /^foldable\s+phones?\s+/i,
      /^televisions?\s+/i,
      /^tvs?\s+/i,
      /^laptops?\s+/i,
      /^desktops?\s+/i,
      /^smartwatch(?:es)?\s+/i,
      /^audios?\s+/i,
      /^headphones?\s+/i,
      /^earbuds?\s+/i,
      /^cameras?\s+/i,
    ];

    let strippedQuery = cleanQuery;
    for (const pref of categoryPrefixes) {
      strippedQuery = strippedQuery.replace(pref, '').trim();
    }

    // Try exact product name match first
    const exactNameMatch = await Product.findOne({
      $or: [
        { name: new RegExp(`^${cleanQuery}$`, 'i') },
        { name: new RegExp(`^${strippedQuery}$`, 'i') }
      ]
    }).lean();
    if (exactNameMatch) {
      return exactNameMatch;
    }

    // Filter out filler words for keyword matching
    const stopWords = new Set(['a', 'an', 'the', 'in', 'on', 'at', 'for', 'of', 'with', 'and', 'or', 'to', 'is', 'it', 'deal', 'deals', 'price', 'analyze', 'review', 'buy', 'me']);
    const rawTokens = cleanQuery.split(/[\s,+/_-]+/);
    const keywords = rawTokens.filter(t => t.length > 1 && !stopWords.has(t));
    const strippedTokens = strippedQuery.split(/[\s,+/_-]+/).filter(t => t.length > 1 && !stopWords.has(t));

    // Combine distinct query search terms
    const allSearchTokens = Array.from(new Set([...keywords, ...strippedTokens]));

    if (allSearchTokens.length > 0) {
      const regexList = allSearchTokens.map(kw => new RegExp(kw, 'i'));

      // Try finding products matching keywords in name, model, tags, or brand
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
        const exactMatch = products.find(p => 
          p.name.toLowerCase() === cleanQuery || 
          p.name.toLowerCase() === strippedQuery
        );
        if (exactMatch) {
          return exactMatch;
        }

        if (products.length === 1) {
          return products[0];
        }

        // Intelligent ranking for multiple candidates
        const isAccessoryQuery = /case|cover|glass|protector|strap|cable|charger|adapter/i.test(cleanQuery);

        const scored = products.map(p => {
          let score = 0;
          const pName = (p.name || '').toLowerCase();
          const pBrand = (p.brand || '').toLowerCase();
          const pModel = (p.model || '').toLowerCase();
          const pCat = (p.category || '').toLowerCase();

          // Heavily deprioritize accessories if user is looking for a primary device
          if (!isAccessoryQuery && (pCat === 'accessories' || /case|cover|protector|strap|cable/i.test(pName))) {
            score -= 100;
          }

          // Exact word boundary matches
          for (const kw of allSearchTokens) {
            const kwReg = new RegExp(`\\b${kw}\\b`, 'i');
            if (kwReg.test(pName)) score += 10;
            if (kwReg.test(pModel)) score += 8;
            if (kwReg.test(pBrand)) score += 5;
          }

          // Flagship / Ultra / Pro preference for top-tier queries
          if (pName.includes('ultra') || pName.includes('pro max') || pName.includes('pro')) {
            score += 3;
          }

          // Prefer verified products with complete specs
          if (p.sourceStatus === 'LIVE_VERIFIED') score += 2;
          if (p.specs && Object.keys(p.specs).length > 3) score += 2;

          // If query exactly matches a product tag or previous alias, give strong bonus
          if (p.tags && Array.isArray(p.tags)) {
            if (p.tags.some(t => t.toLowerCase() === cleanQuery)) {
              score += 40; // Exact match for query terms like "smartphone razr"
            } else if (p.tags.some(t => t.toLowerCase() === strippedQuery)) {
              score += 15;
            }
          }

          return { product: p, score };
        });

        scored.sort((a, b) => b.score - a.score);

        // If top scored item is strong, return it directly so user gets the AI analysis immediately
        if (scored.length > 0 && scored[0].score > 0) {
          return scored[0].product;
        }

        return products.slice(0, 5);
      }
    }
  }
  
  return product;
}
