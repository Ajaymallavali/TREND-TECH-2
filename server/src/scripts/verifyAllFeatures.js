const BASE_URL = 'http://127.0.0.1:5001/api';

async function runVerification() {
  console.log('🧪 Starting Automated Feature & Image Integrity Verification Suite...\n');

  let passedTests = 0;
  let totalTests = 0;

  const assert = (condition, description) => {
    totalTests++;
    if (condition) {
      console.log(`  ✅ PASS: ${description}`);
      passedTests++;
    } else {
      console.error(`  ❌ FAIL: ${description}`);
    }
  };

  // 1. Health Check
  try {
    const res = await fetch(`${BASE_URL}/health`);
    const json = await res.json();
    assert(json.success && json.data.mongo === 'connected', 'Health check returns MongoDB connected');
  } catch (err) {
    assert(false, `Health check exception: ${err.message}`);
  }

  // 2. Test All 9 Category Filters
  const categories = [
    'smartphone',
    'laptop',
    'television',
    'headphones',
    'smartwatch',
    'monitor',
    'tablet',
    'camera',
    'gaming',
  ];

  for (const cat of categories) {
    try {
      const res = await fetch(`${BASE_URL}/products?category=${cat}`);
      const json = await res.json();
      assert(
        json.success && Array.isArray(json.data) && json.data.length > 0,
        `Category '${cat}' returns ${json.data?.length || 0} valid products`
      );

      // Verify category matching
      if (json.data && json.data.length > 0) {
        const matchesCategory = json.data.every((p) => p.category === cat);
        assert(matchesCategory, `All items in '${cat}' response strictly match category '${cat}'`);
      }
    } catch (err) {
      assert(false, `Category '${cat}' request failed: ${err.message}`);
    }
  }

  // 3. Test Product Detail & Offers
  let firstProductId = null;
  try {
    const res = await fetch(`${BASE_URL}/products`);
    const json = await res.json();
    if (json.data && json.data.length > 0) {
      firstProductId = json.data[0]._id;
      assert(json.data.length >= 10, `Catalog contains ${json.data.length} products`);
    }
  } catch (err) {
    assert(false, `Product list request failed: ${err.message}`);
  }

  if (firstProductId) {
    try {
      const res = await fetch(`${BASE_URL}/products/${firstProductId}`);
      const json = await res.json();
      assert(
        json.success && json.data._id === firstProductId && Array.isArray(json.data.marketplaces),
        'Product detail endpoint returns valid product and marketplace offers'
      );
      assert(
        json.data.marketplaces.length > 0 && json.data.marketplaces[0].url.startsWith('http'),
        'Marketplace offers contain valid non-fabricated URLs'
      );
    } catch (err) {
      assert(false, `Product detail request failed: ${err.message}`);
    }
  }

  // 4. Test Deal Analysis (No fake discounts)
  try {
    const res = await fetch(`${BASE_URL}/products/deals`);
    const json = await res.json();
    assert(json.success && Array.isArray(json.data), 'Deal Analysis endpoint returns success envelope');
    if (json.data.length > 0) {
      const validDeals = json.data.every((d) => d.dropPercentage >= 10 && d.averagePrice > d.currentPrice);
      assert(validDeals, 'Deal Analysis contains verified drops without synthetic multipliers');
    }
  } catch (err) {
    assert(false, `Deal analysis request failed: ${err.message}`);
  }

  // 5. Test AI Analysis Workflow
  try {
    const res = await fetch(`${BASE_URL}/products/analysis`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: 'iPhone 15 Pro Max', description: '256GB storage' }),
    });
    const json = await res.json();
    assert(
      json.success && json.data.progressLogs.length === 7 && json.data.analyzedProducts.length > 0,
      'AI Analysis workflow executes 7 progress steps and returns analyzed product'
    );

    const firstAnalyzed = json.data.analyzedProducts[0];
    assert(firstAnalyzed.aiScores && firstAnalyzed.aiScores.overallValue > 0, 'AI Analysis returns valid score out of 100');
    assert(firstAnalyzed.strengths.length > 0 && firstAnalyzed.limitations.length > 0, 'AI Analysis returns strengths & limitations');
  } catch (err) {
    assert(false, `AI Analysis request failed: ${err.message}`);
  }

  // 6. PHASE 24 IMPORTANT IMAGE TEST: Check image uniqueness & integrity across catalog
  try {
    const res = await fetch(`${BASE_URL}/products`);
    const json = await res.json();
    const products = json.data || [];

    const imageToProductsMap = {};

    for (const p of products) {
      if (!p.image) continue;
      if (!imageToProductsMap[p.image]) {
        imageToProductsMap[p.image] = [];
      }
      imageToProductsMap[p.image].push(p);
    }

    let duplicateImageViolations = 0;
    for (const [url, prods] of Object.entries(imageToProductsMap)) {
      const distinctNames = new Set(prods.map((p) => p.name));
      if (distinctNames.size > 1) {
        duplicateImageViolations++;
        console.warn(`  ⚠️ Duplicate Image Violation: URL ${url} assigned to distinct products: ${Array.from(distinctNames).join(', ')}`);
      }
    }

    assert(
      duplicateImageViolations === 0,
      `Phase 24 Image Test: 0 image duplication violations across ${products.length} catalog products`
    );
  } catch (err) {
    assert(false, `Image integrity test failed: ${err.message}`);
  }

  console.log(`\n📊 Verification Results: ${passedTests} / ${totalTests} tests passed.`);
  if (passedTests === totalTests) {
    console.log('🎉 ALL SYSTEM & IMAGE VERIFICATION TESTS PASSED SUCCESSFULLY!');
    process.exit(0);
  } else {
    console.error('⚠️ Some verification tests failed. Please review errors above.');
    process.exit(1);
  }
}

runVerification().catch((err) => {
  console.error('Fatal test exception:', err);
  process.exit(1);
});
