import { Product } from '../models/Product.model.js';
import { Marketplace } from '../models/Marketplace.model.js';
import { MarketplaceProduct } from '../models/MarketplaceProduct.model.js';
import { PriceHistory } from '../models/PriceHistory.model.js';
import { PriceAlert } from '../models/PriceAlert.model.js';
import { SyncJob } from '../models/SyncJob.model.js';
import { SyncError } from '../models/SyncError.model.js';
import { getAdapter } from '../adapters/MarketplaceAdapters.js';
import { logger } from '../config/logger.js';
import nodemailer from 'nodemailer';

// Simple mock SMTP transporter for local testing
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'localhost',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASSWORD || '',
  },
});

export async function runPriceSync() {
  logger.info('🏁 Initiating price synchronization job...');
  const job = await SyncJob.create({ status: 'running', startTime: new Date() });

  try {
    // 1. Get all active marketplaces
    const marketplaces = await Marketplace.find({ isActive: true });
    const activeMarketplaceIds = marketplaces.map((m) => m._id.toString());
    const marketplaceMap = marketplaces.reduce((acc, m) => {
      acc[m._id.toString()] = m;
      return acc;
    }, {});

    // 2. Get all product listings for active marketplaces
    const listings = await MarketplaceProduct.find({
      marketplace: { $in: activeMarketplaceIds },
    });

    let updatedOffersCount = 0;
    let failedOffersCount = 0;
    const updatedProductIds = new Set();

    logger.info(`🔄 Syncing ${listings.length} marketplace offers...`);

    for (const listing of listings) {
      const marketplace = marketplaceMap[listing.marketplace.toString()];
      if (!marketplace) continue;

      try {
        const adapter = getAdapter(marketplace.code);
        if (!adapter) {
          throw new Error(`No adapter found for marketplace code: ${marketplace.code}`);
        }

        // Simulate fetching updated price details from the e-commerce source
        // For development, we introduce a random ±4% fluctuation to represent dynamic market activity
        const currentPrice = listing.currentPrice;
        const drift = 1 + (Math.random() * 0.08 - 0.04); // ±4%
        const rawNewPrice = Math.round(currentPrice * drift);
        
        const newPrice = adapter.normalizePrice(rawNewPrice);
        const originalPrice = listing.originalPrice || Math.round(newPrice * 1.15);
        const isAvailable = Math.random() > 0.05; // 95% chance of staying in stock

        // Update MarketplaceProduct listing
        listing.currentPrice = newPrice;
        listing.originalPrice = originalPrice;
        listing.isAvailable = isAvailable;
        listing.lastUpdated = new Date();
        await listing.save();

        // Record to PriceHistory
        await PriceHistory.create({
          marketplaceProduct: listing._id,
          price: newPrice,
          timestamp: new Date(),
        });

        updatedOffersCount++;
        updatedProductIds.add(listing.product.toString());

        // 3. Check for active Price Alerts triggered by this update
        const triggeredAlerts = await PriceAlert.find({
          product: listing.product,
          isActive: true,
          targetPrice: { $gte: newPrice },
        }).populate('product');

        for (const alert of triggeredAlerts) {
          alert.isActive = false;
          alert.isTriggered = true;
          await alert.save();

          // Send price drop notification
          const mailOptions = {
            from: process.env.SMTP_FROM || 'TREND-TECH <no-reply@trend-tech.app>',
            to: alert.email,
            subject: `🚨 Price Drop Alert: ${alert.product.name}`,
            text: `Good news! The price of "${alert.product.name}" has dropped to ₹${newPrice.toLocaleString('en-IN')} on ${marketplace.name}, which is below your target price of ₹${alert.targetPrice.toLocaleString('en-IN')}.\n\nView Deal: ${listing.url}`,
            html: `<p>Good news! The price of <strong>${alert.product.name}</strong> has dropped to <strong>₹${newPrice.toLocaleString('en-IN')}</strong> on <strong>${marketplace.name}</strong>, which is below your target price of <strong>₹${alert.targetPrice.toLocaleString('en-IN')}</strong>.</p><p><a href="${listing.url}" style="padding: 10px 20px; background-color: #0284c7; color: white; text-decoration: none; border-radius: 6px; display: inline-block;">View Deal</a></p>`,
          };

          try {
            // Only send actual emails if SMTP_HOST is configured
            if (process.env.SMTP_HOST) {
              await transporter.sendMail(mailOptions);
              logger.info({ email: alert.email }, 'Price drop email notification sent successfully');
            } else {
              logger.info(
                { email: alert.email, product: alert.product.name, price: newPrice },
                '[DEV MODE] Price alert triggered! Mock notification logged.'
              );
            }
          } catch (mailErr) {
            logger.error({ mailErr }, 'Failed to send price alert email');
          }
        }

      } catch (err) {
        failedOffersCount++;
        logger.error({ err, listingId: listing._id }, 'Error updating price offer during sync');
        
        await SyncError.create({
          jobId: job._id,
          marketplace: marketplace.name,
          sku: listing.sku || 'N/A',
          error: err.message || String(err),
        });
      }
    }

    job.status = 'completed';
    job.endTime = new Date();
    job.productsUpdated = updatedProductIds.size;
    job.offersUpdated = updatedOffersCount;
    job.failedCount = failedOffersCount;
    await job.save();

    logger.info(
      {
        jobId: job._id,
        products: updatedProductIds.size,
        offers: updatedOffersCount,
        failed: failedOffersCount,
      },
      '✅ Price sync job completed successfully!'
    );
    return job;

  } catch (err) {
    logger.error({ err }, '❌ Price sync job failed critically');
    job.status = 'failed';
    job.endTime = new Date();
    await job.save();
    throw err;
  }
}
