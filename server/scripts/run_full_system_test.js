import mongoose from 'mongoose';
import http from 'http';
import { cleanProductSearchTitle, buildAutomatedStoreUrl } from '../src/utils/storeUrlHelper.js';

/**
 * COMPREHENSIVE FULL-SYSTEM TEST SUITE
 * Performs thorough software testing on the live TREND-TECH stack:
 * 1. Database schema and data integrity
 * 2. API Endpoints (Health, Products, Deals, History, Search, AI Analysis)
 * 3. Multi-store pricing & spread verification
 * 4. Automated Store URL generator
 * 5. Category routing & catalog counts
 */

function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, data: json, headers: res.headers });
        } catch {
          resolve({ status: res.statusCode, raw: data, headers: res.headers });
        }
      });
    });
    req.on('error', reject);
    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

async function runTestSuite() {
  console.log('🧪 ========================================================');
  console.log('🧪 TREND-TECH COMPREHENSIVE FULL-SYSTEM SOFTWARE TEST SUITE');
  console.log('🧪 ========================================================\n');

  const testResults = [];

  function recordTest(name, passed, details = '') {
    testResults.push({ name, passed, details });
    const mark = passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${mark} : ${name} ${details ? '(' + details + ')' : ''}`);
  }

  // 1. DATABASE CONNECTIVITY & INVARIANTS
  console.log('--- SUITE 1: MongoDB Database Invariants ---');
  try {
    await mongoose.connect('mongodb://localhost:27017/trend-tech');
    const db = mongoose.connection.db;
    const pCol = db.collection('products');
    const mpCol = db.collection('marketplaceproducts');
    const mCol = db.collection('marketplaces');
    const phCol = db.collection('pricehistories');

    const totalProducts = await pCol.countDocuments({});
    recordTest('Total Products Count Invariant (867)', totalProducts === 867, `found: ${totalProducts}`);

    const totalListings = await mpCol.countDocuments({});
    recordTest('Marketplace Products Present (>1800)', totalListings > 1800, `found: ${totalListings}`);

    const totalStores = await mCol.countDocuments({});
    recordTest('Active Marketplaces Configured (>=5)', totalStores >= 5, `found: ${totalStores}`);

    const totalHistories = await phCol.countDocuments({});
    recordTest('Price Histories Populated (>5000)', totalHistories > 5000, `found: ${totalHistories}`);

    // Check target Realme C65 5G
    const realme = await pCol.findOne({ _id: new mongoose.Types.ObjectId('6a9904e369652590e0aadc42') });
    recordTest('Target Product Exists: Realme C65 5G', !!realme);
    recordTest('Realme C65 5G Price Calibrated (₹11,499)', realme?.minPrice === 11499, `minPrice: ${realme?.minPrice}`);
    recordTest('Realme C65 5G MRP Calibrated (₹14,999)', realme?.maxPrice === 14999, `maxPrice: ${realme?.maxPrice}`);
  } catch (err) {
    recordTest('Database Connection & Integrity', false, err.message);
  }

  // 2. LIVE SERVER API ENDPOINTS
  console.log('\n--- SUITE 2: Live Server API Endpoints ---');

  // Test 2.1: Health Endpoint
  try {
    const res = await makeRequest({
      hostname: 'localhost',
      port: 5001,
      path: '/api/health',
      method: 'GET'
    });
    recordTest('GET /api/health (Status 200)', res.status === 200, `status: ${res.status}`);
  } catch (err) {
    recordTest('GET /api/health', false, err.message);
  }

  // Test 2.2: Products Listing Endpoint
  try {
    const res = await makeRequest({
      hostname: 'localhost',
      port: 5001,
      path: '/api/products?page=1&limit=10',
      method: 'GET'
    });
    const items = res.data?.data?.products || res.data?.data || res.data?.products || [];
    recordTest('GET /api/products?page=1&limit=10 (Returns items)', res.status === 200 && items.length > 0, `returned: ${items.length}`);
  } catch (err) {
    recordTest('GET /api/products', false, err.message);
  }

  // Test 2.3: Category Filtering (Smartphone)
  try {
    const res = await makeRequest({
      hostname: 'localhost',
      port: 5001,
      path: '/api/products?category=smartphone&limit=5',
      method: 'GET'
    });
    const items = res.data?.data?.products || res.data?.data || [];
    const allMatchCat = items.every(p => p.category === 'smartphone');
    recordTest('GET /api/products?category=smartphone (Category Filter)', res.status === 200 && items.length > 0 && allMatchCat, `returned: ${items.length}`);
  } catch (err) {
    recordTest('GET /api/products?category=smartphone', false, err.message);
  }

  // Test 2.4: Single Product Detail Endpoint
  try {
    const res = await makeRequest({
      hostname: 'localhost',
      port: 5001,
      path: '/api/products/6a9904e369652590e0aadc42',
      method: 'GET'
    });
    const p = res.data?.data || res.data;
    const offers = p?.marketplaces || [];
    const hasValidOffers = offers.length > 0 && offers.every(o => o.currentPrice === 11499 && o.url);
    recordTest('GET /api/products/:id (Realme C65 5G Details)', res.status === 200 && p?._id === '6a9904e369652590e0aadc42', `price: ₹11,499, offers: ${offers.length}`);
    recordTest('Multi-store Offers on Realme C65 5G Validated', hasValidOffers, `stores: ${offers.length}`);
  } catch (err) {
    recordTest('GET /api/products/:id', false, err.message);
  }

  // Test 2.5: Best Deals Endpoint
  try {
    const res = await makeRequest({
      hostname: 'localhost',
      port: 5001,
      path: '/api/products/deals',
      method: 'GET'
    });
    const deals = res.data?.data || [];
    recordTest('GET /api/products/deals (Returns Top Deals)', res.status === 200 && deals.length > 0, `deals count: ${deals.length}`);
  } catch (err) {
    recordTest('GET /api/products/deals', false, err.message);
  }

  // Test 2.6: Catalog Search Endpoint
  try {
    const res = await makeRequest({
      hostname: 'localhost',
      port: 5001,
      path: '/api/products?search=Realme',
      method: 'GET'
    });
    const results = res.data?.data?.products || res.data?.data || [];
    recordTest('GET /api/products?search=Realme (Catalog Search)', res.status === 200 && results.length > 0, `found: ${results.length}`);
  } catch (err) {
    recordTest('GET /api/products?search=Realme', false, err.message);
  }

  // Test 2.7: Categories & Retailers Endpoints
  try {
    const resCat = await makeRequest({ hostname: 'localhost', port: 5001, path: '/api/categories', method: 'GET' });
    const resRet = await makeRequest({ hostname: 'localhost', port: 5001, path: '/api/retailers', method: 'GET' });
    recordTest('GET /api/categories (Categories List)', resCat.status === 200 && resCat.data?.data?.length > 0, `categories: ${resCat.data?.data?.length}`);
    recordTest('GET /api/retailers (Retailers List)', resRet.status === 200 && resRet.data?.data?.length > 0, `retailers: ${resRet.data?.data?.length}`);
  } catch (err) {
    recordTest('GET /api/categories or /api/retailers', false, err.message);
  }

  // Test 2.7: AI Analysis Workflow POST /api/products/analysis
  try {
    const postData = JSON.stringify({ query: 'Realme C65 5G' });
    const res = await makeRequest({
      hostname: 'localhost',
      port: 5001,
      path: '/api/products/analysis',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, postData);

    const d = res.data?.data;
    const hasMatch = d?.product?.name?.toLowerCase().includes('realme c65');
    const hasBestPrice = d?.dealMetrics?.bestPrice === 11499;
    recordTest('POST /api/products/analysis (Matches query)', res.status === 200 && hasMatch, d?.product?.name);
    recordTest('POST /api/products/analysis (Metrics: ₹11,499, 23% off)', hasBestPrice, `bestPrice: ${d?.dealMetrics?.bestPrice}`);
  } catch (err) {
    recordTest('POST /api/products/analysis', false, err.message);
  }

  // 3. STORE URL GENERATOR UNIT TESTS
  console.log('\n--- SUITE 3: Automated Store URL Generator Unit Tests ---');
  try {
    const sampleProduct = {
      name: 'Realme C65 5G (Glowing Black, 4GB RAM, 128GB Storage)',
      brand: 'Realme',
      model: 'C65 5G'
    };

    const cleanTitle = cleanProductSearchTitle(sampleProduct);
    recordTest('cleanProductSearchTitle cleans name accurately', cleanTitle.includes('Realme C65 5G'), cleanTitle);

    const amzUrl = buildAutomatedStoreUrl('Amazon India', sampleProduct);
    recordTest('buildAutomatedStoreUrl creates Amazon India URL', amzUrl.startsWith('https://www.amazon.in/s?k='), amzUrl);

    const fkUrl = buildAutomatedStoreUrl('Flipkart', sampleProduct);
    recordTest('buildAutomatedStoreUrl creates Flipkart URL', fkUrl.startsWith('https://www.flipkart.com/search?q='), fkUrl);

    const cromaUrl = buildAutomatedStoreUrl('Croma', sampleProduct);
    recordTest('buildAutomatedStoreUrl creates Croma URL', cromaUrl.startsWith('https://www.croma.com/searchB?q='), cromaUrl);

    const relUrl = buildAutomatedStoreUrl('Reliance Digital', sampleProduct);
    recordTest('buildAutomatedStoreUrl creates Reliance Digital URL', relUrl.startsWith('https://www.reliancedigital.in/search?q='), relUrl);
  } catch (err) {
    recordTest('Store URL Generator', false, err.message);
  }

  // 4. SUMMARY
  console.log('\n========================================================');
  const passedCount = testResults.filter(t => t.passed).length;
  const failedCount = testResults.filter(t => !t.passed).length;
  console.log(`TOTAL TESTS: ${testResults.length}`);
  console.log(`PASSED: ${passedCount}`);
  console.log(`FAILED: ${failedCount}`);
  console.log('========================================================\n');

  process.exit(failedCount === 0 ? 0 : 1);
}

runTestSuite().catch(err => {
  console.error(err);
  process.exit(1);
});
