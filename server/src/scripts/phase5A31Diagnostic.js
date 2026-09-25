import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'server/.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

import { connectDB, disconnectDB } from '../config/db.js';
import { Product } from '../models/Product.model.js';
import { MarketplaceProduct } from '../models/MarketplaceProduct.model.js';
import { PriceHistory } from '../models/PriceHistory.model.js';

async function runDiagnostic() {
  console.log('--- PHASE 5A.3.1 DIAGNOSTIC START ---');

  await connectDB();

  const prodBefore = await Product.countDocuments();
  const mpBefore = await MarketplaceProduct.countDocuments();
  const phBefore = await PriceHistory.countDocuments();

  const apiKey = process.env.SERPAPI_API_KEY;
  const realApiMode = process.env.CATALOG_REAL_API_MODE;

  const apiKeyPresent = Boolean(apiKey && apiKey.trim().length > 0);
  const apiKeyLength = apiKey ? apiKey.trim().length : 0;

  console.log(`ENVIRONMENT:`);
  console.log(`SERPAPI_API_KEY_PRESENT: ${apiKeyPresent ? 'YES' : 'NO'}`);
  console.log(`SERPAPI_API_KEY_LENGTH: ${apiKeyLength}`);
  console.log(`CATALOG_REAL_API_MODE: ${realApiMode || 'undefined'}`);

  const query = 'Apple iPhone 16e 128GB';
  const engine = 'amazon_search';
  const domain = 'amazon.com';
  let requestSent = false;
  let httpStatus = null;
  let serpApiStatus = null;
  let errorMessage = null;
  let searchResultsCount = 0;
  let organicResultsCount = 0;
  let amazonResultsCount = 0;
  let firstResult = null;
  let rawJson = null;

  if (apiKeyPresent) {
    requestSent = true;
    const url = `https://serpapi.com/search.json?engine=${engine}&q=${encodeURIComponent(query)}&api_key=${apiKey}`;
    try {
      console.log(`REQUEST:`);
      console.log(`SERPAPI_REQUEST_SENT: YES`);
      console.log(`API endpoint/method used: GET https://serpapi.com/search.json`);
      console.log(`engine used: ${engine}`);
      console.log(`Amazon domain: ${domain}`);
      console.log(`query sent: "${query}"`);

      const res = await fetch(url);
      httpStatus = res.status;
      rawJson = await res.json();

      if (rawJson.search_metadata) {
        serpApiStatus = rawJson.search_metadata.status;
      }
      if (rawJson.error) {
        errorMessage = rawJson.error;
      }

      if (rawJson.search_information) {
        searchResultsCount = rawJson.search_information.total_results || 0;
      }
      if (Array.isArray(rawJson.organic_results)) {
        organicResultsCount = rawJson.organic_results.length;
        amazonResultsCount = rawJson.organic_results.length;
        if (organicResultsCount > 0) {
          const first = rawJson.organic_results[0];
          firstResult = {
            asin: first.asin || null,
            title: first.title || null,
            brand: first.brand || null,
            price: first.price ? (first.price.value || first.price.extracted || null) : null,
            link: first.link || null,
            link_clean: first.link_clean || first.link || null,
            thumbnail: first.thumbnail || null
          };
        }
      }
    } catch (err) {
      errorMessage = err.message;
    }
  } else {
    console.log(`REQUEST:`);
    console.log(`SERPAPI_REQUEST_SENT: NO (SERPAPI_API_KEY is not configured in environment)`);
    console.log(`API endpoint/method used: N/A`);
    console.log(`engine used: ${engine}`);
    console.log(`Amazon domain: ${domain}`);
    console.log(`query sent: "${query}"`);
  }

  console.log(`\nRESPONSE:`);
  console.log(`HTTP status: ${httpStatus !== null ? httpStatus : 'N/A'}`);
  console.log(`SerpAPI response status: ${serpApiStatus || 'N/A'}`);
  console.log(`error message if any: ${errorMessage || 'None'}`);
  console.log(`search results count: ${searchResultsCount}`);
  console.log(`organic results count: ${organicResultsCount}`);
  console.log(`Amazon results count: ${amazonResultsCount}`);

  console.log(`\nFIRST RESULT:`);
  if (firstResult) {
    console.log(`ASIN: ${firstResult.asin || 'N/A'}`);
    console.log(`title: ${firstResult.title || 'N/A'}`);
    console.log(`brand: ${firstResult.brand || 'N/A'}`);
    console.log(`price: ${firstResult.price || 'N/A'}`);
    console.log(`link: ${firstResult.link || 'N/A'}`);
    console.log(`link_clean: ${firstResult.link_clean || 'N/A'}`);
    console.log(`thumbnail: ${firstResult.thumbnail || 'N/A'}`);
  } else {
    console.log(`None`);
  }

  // Classification logic
  let classification = '';
  let explanation = '';

  if (!apiKeyPresent) {
    classification = 'A = API KEY / AUTHENTICATION FAILURE';
    explanation = 'SERPAPI_API_KEY environment variable is not present or empty in the runtime environment.';
  } else if (httpStatus === 401 || httpStatus === 403 || (errorMessage && errorMessage.toLowerCase().includes('api key'))) {
    classification = 'A = API KEY / AUTHENTICATION FAILURE';
    explanation = `SerpAPI returned HTTP ${httpStatus} or authentication error: ${errorMessage}`;
  } else if (httpStatus !== 200 && httpStatus !== null) {
    classification = 'B = NETWORK / HTTP FAILURE';
    explanation = `SerpAPI returned HTTP status ${httpStatus}`;
  } else if (errorMessage) {
    classification = 'C = SERPAPI API ERROR';
    explanation = `SerpAPI returned error message: ${errorMessage}`;
  } else if (organicResultsCount === 0) {
    classification = 'D = AMAZON SEARCH RETURNED ZERO RESULTS';
    explanation = 'SerpAPI query succeeded but returned 0 organic Amazon results for the target query.';
  } else if (!firstResult.asin) {
    classification = 'E = RESULTS RETURNED BUT PARSER DISCARDED THEM';
    explanation = 'Organic results returned but did not contain a valid ASIN field.';
  } else {
    classification = 'G = OTHER';
    explanation = `Success: candidate ASIN ${firstResult.asin} returned.`;
  }

  console.log(`\nCLASSIFICATION:`);
  console.log(classification);
  console.log(`Explanation: ${explanation}`);

  const prodAfter = await Product.countDocuments();
  const mpAfter = await MarketplaceProduct.countDocuments();
  const phAfter = await PriceHistory.countDocuments();

  console.log(`\nDATABASE SAFETY:`);
  console.log(`Products: ${prodBefore} -> ${prodAfter}`);
  console.log(`MarketplaceProducts: ${mpBefore} -> ${mpAfter}`);
  console.log(`PriceHistory: ${phBefore} -> ${phAfter}`);
  console.log(`DATABASE MODIFIED: ${prodBefore === prodAfter && mpBefore === mpAfter && phBefore === phAfter ? 'NO' : 'YES'}`);

  await disconnectDB();
  console.log('--- PHASE 5A.3.1 DIAGNOSTIC END ---');
}

runDiagnostic().catch(err => {
  console.error('Diagnostic error:', err);
  process.exit(1);
});
