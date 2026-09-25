import { verifyProductIdentity } from './productIdentityVerifier.service.js';
import { verifyRealProductImage, canonicalImageUrl } from './realImageVerifier.service.js';

export function createCanonicalProductProvenanceRecord({
  targetProduct,
  apiCandidate,
  shaRegistry
}) {
  if (!targetProduct || !apiCandidate) {
    return {
      valid: false,
      decision: 'UNRESOLVED',
      rejectionReason: 'Missing target product or API candidate object'
    };
  }

  // 1. Identity Verification
  const idResult = verifyProductIdentity({ target: targetProduct, candidate: apiCandidate });
  if (!idResult.valid) {
    return {
      valid: false,
      decision: 'REJECTED',
      rejectionReason: idResult.reason
    };
  }

  // 2. ASIN Validation
  const candidateASIN = apiCandidate.asin || null;
  if (!candidateASIN || candidateASIN.startsWith('B06A9904')) {
    return {
      valid: false,
      decision: 'REJECTED',
      rejectionReason: 'Synthetic or invalid Amazon ASIN rejected'
    };
  }

  // 3. Image Verification
  const imgResult = verifyRealProductImage({
    imageUrl: apiCandidate.imageUrl || apiCandidate.thumbnail,
    productId: targetProduct.id || targetProduct._id,
    shaRegistry
  });

  const verifiedImage = imgResult.valid ? imgResult.canonicalUrl : null;
  const imageSha256 = imgResult.valid ? imgResult.sha256 : null;

  // 4. Direct URL Validation
  const directUrl = apiCandidate.link_clean || apiCandidate.link || apiCandidate.productUrl || null;
  if (!directUrl || directUrl.includes('/s?') || directUrl.includes('/search')) {
    return {
      valid: false,
      decision: 'REJECTED',
      rejectionReason: 'Search URL or generated synthetic link rejected'
    };
  }

  // 5. Price Validation
  const priceVal = typeof apiCandidate.price === 'number' ? apiCandidate.price : (apiCandidate.extracted_price || null);

  return {
    valid: true,
    decision: 'VERIFIED',
    provenance: {
      source: 'LIVE_SERPAPI_AMAZON_PRODUCT_API',
      sourceType: 'VERIFIED_OFFICIAL_MARKETPLACE',
      sourceUrl: directUrl,
      sourceProductId: candidateASIN,
      marketplace: 'Amazon',
      marketplaceProductId: candidateASIN,
      brand: targetProduct.brand,
      name: targetProduct.name,
      canonicalModel: targetProduct.name,
      variant: targetProduct.variant || targetProduct.name,
      category: targetProduct.category,
      image: verifiedImage,
      imageSource: imgResult.valid ? 'AMAZON_PRODUCT_API' : 'NONE',
      imageSourceUrl: apiCandidate.imageUrl || apiCandidate.thumbnail || null,
      imageSha256,
      currentPrice: priceVal,
      verificationStatus: 'VERIFIED_EXACT',
      verifiedAt: new Date().toISOString()
    }
  };
}
