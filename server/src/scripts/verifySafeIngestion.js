import {
  evaluateCandidateIngestion,
  extractAmazonAsin,
  buildCanonicalAmazonUrl,
  validatePrice
} from '../services/safeIngestion.service.js';
import {
  classifyProductImage,
  normalizeImageUrl,
  IMAGE_VALIDATION_STATES
} from '../services/imagePipeline.service.js';
import { isAccessory, isSamePhysicalProduct } from '../services/productMatching.service.js';

function runIngestionTestSuite() {
  console.log('🧪 Running Phase 3A Safe Ingestion & Image Validation Verification Suite...\n');

  let passed = 0;
  let total = 0;

  const assert = (condition, description) => {
    total++;
    if (condition) {
      console.log(`  ✅ PASS: ${description}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${description}`);
    }
  };

  // Phase 3A Test 1: Unsplash generic image -> must NOT be VERIFIED_EXACT
  const unsplashUrl = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800';
  const unsplashState = classifyProductImage(unsplashUrl, { hasVerifiedAsin: true });
  assert(unsplashState !== IMAGE_VALIDATION_STATES.VERIFIED_EXACT, 'Phase 3A Test 1: Unsplash generic image is NOT labeled VERIFIED_EXACT');
  assert(unsplashState === IMAGE_VALIDATION_STATES.GENERIC, 'Phase 3A Test 1: Unsplash image classified as GENERIC');

  // Phase 3A Test 2: Same Unsplash URL with ?w=800 vs ?w=1200 -> duplicate normalized URL
  const norm1 = normalizeImageUrl('https://images.unsplash.com/photo-1695048133142?w=800&auto=format&fit=crop&q=80');
  const norm2 = normalizeImageUrl('https://images.unsplash.com/photo-1695048133142?w=1200&fit=crop');
  assert(norm1 === norm2, 'Phase 3A Test 2: URL query parameter differences normalize to exact same image key');

  // Phase 3A Test 3: Amazon product image associated with verified ASIN -> eligible for VERIFIED_EXACT
  const amazonProductUrl = 'https://m.media-amazon.com/images/I/81Os1SDWJA-L._SL1500_.jpg';
  const amazonState = classifyProductImage(amazonProductUrl, { hasVerifiedAsin: true });
  assert(amazonState === IMAGE_VALIDATION_STATES.VERIFIED_EXACT, 'Phase 3A Test 3: Amazon product CDN image with verified ASIN is VERIFIED_EXACT');

  // Phase 3A Test 4: Placeholder image -> rejected
  const placeholderState = classifyProductImage('https://example.com/images/default_placeholder.png');
  assert(placeholderState === IMAGE_VALIDATION_STATES.PLACEHOLDER, 'Phase 3A Test 4: Placeholder image classified as PLACEHOLDER');

  // Phase 3A Test 5: Broken image URL -> rejected
  const brokenState = classifyProductImage('not-a-valid-url-format');
  assert(brokenState === IMAGE_VALIDATION_STATES.BROKEN, 'Phase 3A Test 5: Malformed URL classified as BROKEN');

  // Phase 3A Test 6: Image belonging to another distinct product -> rejected
  const duplicateState = classifyProductImage(amazonProductUrl, { isDuplicateAcrossDistinctProducts: true });
  assert(duplicateState === IMAGE_VALIDATION_STATES.DUPLICATE, 'Phase 3A Test 6: Image shared across distinct products classified as DUPLICATE');

  // Accessory Rejection Tests
  assert(isAccessory('iPhone 15 Pro Max Silicone Case') === true, 'Rejects "iPhone 15 Pro Max Silicone Case" as accessory');
  assert(isAccessory('MacBook Pro Screen Protector') === true, 'Rejects "MacBook Pro Screen Protector" as accessory');

  // ASIN Validation & Price Tests
  assert(extractAmazonAsin('https://www.amazon.in/dp/B0CHX1W1XY') === 'B0CHX1W1XY', 'Extracts 10-char ASIN B0CHX1W1XY');
  assert(validatePrice(148900) === true, 'Validates positive numeric price ₹1,48,900');
  assert(validatePrice(0) === false, 'Rejects zero price ₹0');

  // Candidate Evaluation with Direct Verified Amazon Image
  const targetPhone = { name: 'Apple iPhone 15 Pro Max', brand: 'Apple', category: 'smartphone', specs: { Storage: '256GB' } };
  const candidatePhoneDirectImg = {
    name: 'Apple iPhone 15 Pro Max (256GB)',
    brand: 'Apple',
    category: 'smartphone',
    marketplace: 'Amazon India',
    url: 'https://www.amazon.in/dp/B0CHX1W1XY',
    price: 148900,
    image: 'https://m.media-amazon.com/images/I/81Os1SDWJA-L._SL1500_.jpg',
    specs: { Storage: '256GB' }
  };
  const evalResult = evaluateCandidateIngestion(targetPhone, candidatePhoneDirectImg, { dryRun: true });
  assert(evalResult.matchStatus === 'ACCEPTED' && evalResult.action === 'WOULD_CREATE_OR_UPDATE', 'Dry-run returns WOULD_CREATE_OR_UPDATE for direct verified Amazon CDN image');

  console.log(`\n📊 Test Results: ${passed} / ${total} tests passed.`);
  if (passed === total) {
    console.log('🎉 ALL PHASE 3A AUTOMATED VERIFICATION TESTS PASSED SUCCESSFULLY!');
  } else {
    console.error('⚠️ Some safe ingestion tests failed.');
    process.exit(1);
  }
}

runIngestionTestSuite();
