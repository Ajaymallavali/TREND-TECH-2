import { classifyProductImage, IMAGE_VALIDATION_STATES, normalizeImageUrl } from '../services/imagePipeline.service.js';
import { extractAmazonAsin, buildCanonicalAmazonUrl } from '../services/safeIngestion.service.js';

async function testAmazonImageExtraction() {
  console.log('🧪 TREND-TECH PHASE 3C — AMAZON VERIFIED IMAGE EXTRACTION DIAGNOSTIC\n');

  // Test target product: Sony WH-1000XM5 (ASIN B09XS7JWHH)
  const targetProduct = {
    name: 'Sony WH-1000XM5',
    brand: 'Sony',
    category: 'headphones',
    asin: 'B09XS7JWHH',
    url: 'https://www.amazon.in/dp/B09XS7JWHH'
  };

  // Simulating actual Amazon Product-Detail / SerpAPI Amazon Product API Response Shape
  const mockSerpApiAmazonProductResponse = {
    search_metadata: { engine: 'google_shopping', status: 'Success' },
    product_results: {
      title: 'Sony WH-1000XM5 Wireless Industry Leading Noise Cancelling Headphones (Black)',
      asin: 'B09XS7JWHH',
      main_image: 'https://m.media-amazon.com/images/I/51SKmu2G9FL._SL1500_.jpg',
      thumbnail_images: [
        'https://m.media-amazon.com/images/I/51SKmu2G9FL._SL1500_.jpg',
        'https://m.media-amazon.com/images/I/61+pt52A77L._SL1500_.jpg',
        'https://m.media-amazon.com/images/I/71u9sW4j2TL._SL1500_.jpg'
      ],
      price: { value: 29990, currency: 'INR' },
      store_name: 'Amazon India'
    }
  };

  console.log(`Target Product:        ${targetProduct.name}`);
  console.log(`Target ASIN:           ${targetProduct.asin}`);
  console.log(`Target Canonical URL:  ${targetProduct.url}`);
  console.log('---------------------------------------------------------------');

  const prodResults = mockSerpApiAmazonProductResponse.product_results;
  const discoveredFields = {
    main_image: prodResults.main_image,
    thumbnail_images_count: prodResults.thumbnail_images.length,
    first_thumbnail: prodResults.thumbnail_images[0]
  };

  console.log('Discovered Amazon Image Fields:');
  console.log('  └─ main_image:       ', discoveredFields.main_image);
  console.log('  └─ thumbnails count: ', discoveredFields.thumbnail_images_count);

  // Select primary product image associated with verified ASIN
  const selectedImageUrl = prodResults.main_image || prodResults.thumbnail_images[0];
  const verifiedAsin = extractAmazonAsin(targetProduct.url) || prodResults.asin;
  const hasVerifiedAsin = verifiedAsin === 'B09XS7JWHH';

  // Run Phase 3A/3C Image Classifier
  const validationState = classifyProductImage(selectedImageUrl, {
    hasVerifiedAsin,
    isVerifiedDirectOffer: true
  });

  const normalizedUrl = normalizeImageUrl(selectedImageUrl);

  console.log('---------------------------------------------------------------');
  console.log(`Selected Image URL:    ${selectedImageUrl}`);
  console.log(`Normalized Image URL:  ${normalizedUrl}`);
  console.log(`Image Source:          Amazon Direct Product CDN (m.media-amazon.com)`);
  console.log(`Image Validation State:${validationState}`);
  console.log(`Passes VERIFIED_EXACT: ${validationState === IMAGE_VALIDATION_STATES.VERIFIED_EXACT ? 'YES ✅' : 'NO ❌'}`);
  console.log('---------------------------------------------------------------\n');
}

testAmazonImageExtraction().catch((err) => {
  console.error('Fatal diagnostic error:', err);
  process.exit(1);
});
