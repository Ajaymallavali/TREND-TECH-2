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
    
    // Check if domain ends with one of the approved domains
    const hostname = parsed.hostname.toLowerCase();
    const isApproved = APPROVED_DOMAINS.some(d => hostname === d || hostname.endsWith(`.${d}`));
    
    if (!isApproved) {
      return { isValid: false, reason: 'Domain not in approved marketplace list' };
    }
    
    // Basic structural checks to reject homepage/search
    if (parsed.pathname === '/' || parsed.pathname.includes('/search') || parsed.pathname.toLowerCase().includes('/s?k=')) {
      return { isValid: false, reason: 'URL appears to be a homepage or search page, not a product page' };
    }
    
    return { isValid: true, domain: hostname, url: parsed.toString() };
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
    // Basic text search
    const cleanQuery = query.toLowerCase().trim();
    // Try exact or prefix
    product = await Product.findOne({ name: { $regex: new RegExp(cleanQuery, 'i') } });
  }
  
  return product;
}
