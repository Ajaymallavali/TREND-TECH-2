import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { connectDB, disconnectDB } from '../config/db.js';
import { Product } from '../models/Product.model.js';
import { MarketplaceProduct } from '../models/MarketplaceProduct.model.js';
import { PriceHistory } from '../models/PriceHistory.model.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const initialSystemKey = process.env.SERPAPI_API_KEY;

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'server/.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const apiKey = (initialSystemKey && initialSystemKey !== 'YOUR_REAL_KEY') ? initialSystemKey : process.env.SERPAPI_API_KEY;

async function testSerpApiConnectivity() {
  await connectDB();

  const productsBefore = await Product.countDocuments();
  const mpBefore = await MarketplaceProduct.countDocuments();
  const phBefore = await PriceHistory.countDocuments();

  const targetKey = apiKey || process.env.SERPAPI_API_KEY;
  const apiKeyPresent = Boolean(targetKey && targetKey.trim().length > 0 && targetKey !== 'YOUR_REAL_KEY');
  const apiKeyLength = targetKey ? targetKey.length : 0;

  let httpStatus = null;
  let serpApiError = 'NONE';
  let realResultsCount = 0;
  let firstResultAsin = false;
  let firstResultTitle = false;
  let firstResultUrl = false;
  let firstResultImage = false;
  let firstResultPrice = false;

  if (apiKeyPresent) {
    try {
      const url = `https://serpapi.com/search.json?engine=amazon_search&q=${encodeURIComponent('Apple iPhone')}&amazon_domain=amazon.in&api_key=${targetKey}`;
      const res = await fetch(url);
      httpStatus = res.status;

      if (res.ok) {
        const data = await res.json();
        if (data.error) {
          serpApiError = data.error;
        } else {
          const results = data.organic_results || [];
          realResultsCount = results.length;
          if (results.length > 0) {
            const first = results[0];
            firstResultAsin = Boolean(first.asin);
            firstResultTitle = Boolean(first.title);
            firstResultUrl = Boolean(first.link || first.link_clean);
            firstResultImage = Boolean(first.thumbnail || first.image);
            firstResultPrice = Boolean(first.price || first.extracted_price);
          }
        }
      } else {
        const text = await res.text().catch(() => '');
        serpApiError = `HTTP ${res.status}: ${res.statusText || text || 'Error'}`;
      }
    } catch (err) {
      httpStatus = 500;
      serpApiError = `Exception: ${err.message}`;
    }
  } else {
    httpStatus = 401;
    serpApiError = 'SERPAPI_API_KEY missing or placeholder';
  }

  const productsAfter = await Product.countDocuments();
  const mpAfter = await MarketplaceProduct.countDocuments();
  const phAfter = await PriceHistory.countDocuments();

  console.log('============================================');
  console.log('PHASE 5B.1.1 RESULT');
  console.log('============================================');
  console.log(`SERPAPI_API_KEY_PRESENT: ${apiKeyPresent ? 'YES' : 'NO'}`);
  console.log(`SERPAPI_API_KEY_LENGTH: ${apiKeyLength}`);
  console.log(`HTTP_STATUS: ${httpStatus}`);
  console.log(`SERPAPI_ERROR: ${serpApiError}`);
  console.log(`REAL_RESULTS_COUNT: ${realResultsCount}`);
  console.log(`FIRST_RESULT_ASIN_PRESENT: ${firstResultAsin ? 'YES' : 'NO'}`);
  console.log(`FIRST_RESULT_TITLE_PRESENT: ${firstResultTitle ? 'YES' : 'NO'}`);
  console.log(`FIRST_RESULT_URL_PRESENT: ${firstResultUrl ? 'YES' : 'NO'}`);
  console.log(`FIRST_RESULT_IMAGE_PRESENT: ${firstResultImage ? 'YES' : 'NO'}`);
  console.log(`FIRST_RESULT_PRICE_PRESENT: ${firstResultPrice ? 'YES' : 'NO'}`);
  console.log('');
  console.log('DATABASE_WRITES: 0');
  console.log(`PRODUCTS_BEFORE: ${productsBefore}`);
  console.log(`PRODUCTS_AFTER: ${productsAfter}`);
  console.log(`MARKETPLACE_PRODUCTS_BEFORE: ${mpBefore}`);
  console.log(`MARKETPLACE_PRODUCTS_AFTER: ${mpAfter}`);
  console.log(`PRICE_HISTORY_BEFORE: ${phBefore}`);
  console.log(`PRICE_HISTORY_AFTER: ${phAfter}`);
  console.log('============================================');

  await disconnectDB();
}

testSerpApiConnectivity().catch((err) => {
  console.error('Error during connectivity test:', err);
  process.exit(1);
});
