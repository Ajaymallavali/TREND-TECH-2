import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { REAL_VERIFIED_CATALOG } from '../data/realVerifiedCatalog.js';
import { VERIFIED_CATALOG_DATA } from '../data/verifiedCatalog.data.js';
import {
  validateMarketplaceProductUrl,
  verifyProductIdentityMatch,
  validateExactProductImage,
  determineDestinationVerificationState
} from '../utils/urlValidator.js';
import { evaluateProductDealSignal, DEAL_STATUSES } from '../services/deal.service.js';
import { normalizeCategory } from '../utils/categoryMapper.js';

async function runDestinationVerificationPipeline() {
  console.log('========================================================================');
  console.log('TREND-TECH-2 FINAL USER-FACING DESTINATION & QUALITY PIPELINE');
  console.log('========================================================================\n');

  await mongoose.connect('mongodb://localhost:27017/trend-tech');
  const db = mongoose.connection.db;

  const productsColl = db.collection('products');
  const offersColl = db.collection('marketplaceproducts');
  const historyColl = db.collection('pricehistories');
  const marketplacesColl = db.collection('marketplaces');

  // Record Counts BEFORE repair
  const countProductsBefore = await productsColl.countDocuments();
  const countOffersBefore = await offersColl.countDocuments();
  const countHistoryBefore = await historyColl.countDocuments();

  console.log('--- DATABASE STATE BEFORE REPAIR ---');
  console.log(`Products:            ${countProductsBefore}`);
  console.log(`MarketplaceProduct:  ${countOffersBefore}`);
  console.log(`PriceHistory:        ${countHistoryBefore}\n`);

  const marketplaces = await marketplacesColl.find({}).toArray();
  const mpMap = new Map(marketplaces.map((m) => [m._id.toString(), m.name]));

  // Build source catalog lookup
  const sourceCatalogMap = new Map();
  const normalizeName = (n) => (n || '').toLowerCase().replace(/[^a-z0-9]/g, '');

  [...REAL_VERIFIED_CATALOG, ...VERIFIED_CATALOG_DATA].forEach((item) => {
    if (item.name && item.offers) {
      sourceCatalogMap.set(normalizeName(item.name), item.offers);
    }
  });

  const products = await productsColl.find({}).toArray();
  const rawOffers = await offersColl.find({}).toArray();

  let offersRepairedCount = 0;

  // 1. In-place Repair of MarketplaceProduct offers
  for (const o of rawOffers) {
    let mName = 'Store';
    if (o.marketplace) {
      if (typeof o.marketplace === 'string') mName = mpMap.get(o.marketplace) || o.marketplace;
      else if (typeof o.marketplace === 'object') mName = o.marketplace.name || mpMap.get(o.marketplace.toString()) || 'Store';
    }

    const val = validateMarketplaceProductUrl({ marketplace: mName, url: o.url });
    const prod = products.find((p) => p._id.toString() === o.product?.toString());

    if (!val.valid || o.isAvailable === false) {
      if (prod) {
        const sourceOffers = sourceCatalogMap.get(normalizeName(prod.name));
        if (sourceOffers && mName) {
          const matchSourceOffer = sourceOffers.find((so) => {
            const soMName = (so.marketplace || '').toLowerCase();
            return soMName.includes(mName.toLowerCase()) || mName.toLowerCase().includes(soMName);
          });

          if (matchSourceOffer && matchSourceOffer.url) {
            const newVal = validateMarketplaceProductUrl({ marketplace: mName, url: matchSourceOffer.url });
            if (newVal.valid) {
              await offersColl.updateOne(
                { _id: o._id },
                {
                  $set: {
                    url: newVal.canonicalUrl || matchSourceOffer.url,
                    isAvailable: true,
                    asin: matchSourceOffer.asin || o.asin,
                    urlVerificationStatus: 'PROVIDER_VERIFIED',
                    updatedAt: new Date(),
                  },
                }
              );
              o.url = newVal.canonicalUrl || matchSourceOffer.url;
              o.isAvailable = true;
              offersRepairedCount++;
            }
          }
        }
      }
    }
  }

  // Refetch offers after in-place repairs
  const updatedOffers = await offersColl.find({}).toArray();
  const histories = await historyColl.find({}).toArray();

  // Record Counts AFTER repair
  const countProductsAfter = await productsColl.countDocuments();
  const countOffersAfter = await offersColl.countDocuments();
  const countHistoryAfter = await historyColl.countDocuments();

  // Audit Metrics
  let urlFormatValidCount = 0;
  let actualDestinationVerifiedCount = 0;
  let providerVerifiedCount = 0;
  let unverifiableExternalCount = 0;
  let brokenDestinationCount = 0;
  let disabledOffersCount = 0;

  let exactProductImageVerifiedCount = 0;
  let imageUnavailableCount = 0;

  let searchUrlCount = 0;
  let wrongProductCount = 0;

  updatedOffers.forEach((o) => {
    let mName = 'Store';
    if (o.marketplace) {
      if (typeof o.marketplace === 'string') mName = mpMap.get(o.marketplace) || o.marketplace;
      else if (typeof o.marketplace === 'object') mName = o.marketplace.name || mpMap.get(o.marketplace.toString()) || 'Store';
    }

    const prod = products.find((p) => p._id.toString() === o.product?.toString());
    const urlRes = validateMarketplaceProductUrl({ marketplace: mName, url: o.url });
    const identityRes = prod ? verifyProductIdentityMatch({ product: prod, offerUrl: o.url }) : { match: true };

    if (!urlRes.valid && urlRes.reason.includes('Search')) {
      searchUrlCount++;
    }

    if (!identityRes.match) {
      wrongProductCount++;
    }

    if (o.isAvailable === false) {
      disabledOffersCount++;
    }

    if (urlRes.valid) {
      urlFormatValidCount++;
      const statusRes = determineDestinationVerificationState({
        urlResult: urlRes,
        identityResult: identityRes,
        isVerifiedCatalogSource: true,
      });

      if (statusRes.status === 'VERIFIED_DESTINATION') actualDestinationVerifiedCount++;
      else if (statusRes.status === 'PROVIDER_VERIFIED') providerVerifiedCount++;
      else if (statusRes.status === 'UNVERIFIABLE_EXTERNAL') unverifiableExternalCount++;
      else brokenDestinationCount++;
    } else {
      brokenDestinationCount++;
    }
  });

  // Image Audit
  products.forEach((p) => {
    const imgRes = validateExactProductImage({ product: p, imageUrl: p.image });
    if (imgRes.valid) {
      exactProductImageVerifiedCount++;
    } else {
      imageUnavailableCount++;
    }
  });

  // Deal Metrics
  let dealsDisplayedCount = 0;
  let dealsSuppressedCount = 0;

  products.forEach((p) => {
    const pOffers = updatedOffers.filter((o) => o.product && o.product.toString() === p._id.toString() && o.isAvailable !== false);
    const pHistories = histories.filter((h) => pOffers.some((o) => o._id.toString() === h.marketplaceProduct.toString()));

    const dealRes = evaluateProductDealSignal(p, pOffers, pHistories);
    if (dealRes.dealStatus === DEAL_STATUSES.CURRENT_DISCOUNT || dealRes.dealStatus === DEAL_STATUSES.PRICE_DROP || dealRes.dealStatus === DEAL_STATUSES.LOWEST_OBSERVED) {
      if (pOffers.length > 0 && p.image) {
        dealsDisplayedCount++;
      } else {
        dealsSuppressedCount++;
      }
    } else {
      dealsSuppressedCount++;
    }
  });

  console.log('--- COMPREHENSIVE PIPELINE AUDIT REPORT ---');
  console.log(`Products Checked:                 ${products.length}`);
  console.log(`Offers Checked:                   ${updatedOffers.length}`);
  console.log(`Offers Repaired In-Place:         ${offersRepairedCount}`);
  console.log(`Offers Remaining Unavailable:     ${disabledOffersCount}`);
  console.log(`URL_FORMAT_VALID:                 ${urlFormatValidCount}`);
  console.log(`ACTUAL_DESTINATION_VERIFIED:      ${actualDestinationVerifiedCount}`);
  console.log(`PROVIDER_VERIFIED:                ${providerVerifiedCount}`);
  console.log(`UNVERIFIABLE_EXTERNAL:            ${unverifiableExternalCount}`);
  console.log(`Broken Destinations:              ${brokenDestinationCount}`);
  console.log(`EXACT_PRODUCT_IMAGE_VERIFIED:     ${exactProductImageVerifiedCount}`);
  console.log(`Image Unavailable Count:          ${imageUnavailableCount}`);
  console.log(`Search URLs Count:                ${searchUrlCount}`);
  console.log(`Wrong Product / Accessory Mismatch: ${wrongProductCount}`);
  console.log(`Deals Displayed:                  ${dealsDisplayedCount}`);
  console.log(`Deals Suppressed:                 ${dealsSuppressedCount}`);
  console.log(`PriceHistory Records Unchanged:   ${countHistoryAfter}`);

  console.log('\n--- DATABASE SAFETY CHECK ---');
  console.log(`Products Before / After:         ${countProductsBefore} / ${countProductsAfter} (Diff: ${countProductsAfter - countProductsBefore})`);
  console.log(`Offers Before / After:           ${countOffersBefore} / ${countOffersAfter} (Diff: ${countOffersAfter - countOffersBefore})`);
  console.log(`Histories Before / After:        ${countHistoryBefore} / ${countHistoryAfter} (Diff: ${countHistoryAfter - countHistoryBefore})`);

  // Write Report Files
  const reportDir = path.join(process.cwd(), 'src', 'data', 'audits');
  if (!fs.existsSync(reportDir)) fs.mkdirSync(reportDir, { recursive: true });

  const reportData = {
    timestamp: new Date().toISOString(),
    productsChecked: products.length,
    offersChecked: updatedOffers.length,
    offersRepaired: offersRepairedCount,
    offersRemainingUnavailable: disabledOffersCount,
    urlFormatValidCount,
    actualDestinationVerifiedCount,
    providerVerifiedCount,
    unverifiableExternalCount,
    brokenDestinationCount,
    exactProductImageVerifiedCount,
    imageUnavailableCount,
    searchUrlCount,
    wrongProductCount,
    dealsDisplayedCount,
    dealsSuppressedCount,
    priceHistoryUnchangedCount: countHistoryAfter,
    databaseBefore: {
      products: countProductsBefore,
      offers: countOffersBefore,
      histories: countHistoryBefore,
    },
    databaseAfter: {
      products: countProductsAfter,
      offers: countOffersAfter,
      histories: countHistoryAfter,
    },
  };

  fs.writeFileSync(path.join(reportDir, 'finalUserFacingDestinationReport.json'), JSON.stringify(reportData, null, 2));

  await mongoose.disconnect();
  console.log('\nPipeline run successfully completed.');
}

runDestinationVerificationPipeline().catch(console.error);
