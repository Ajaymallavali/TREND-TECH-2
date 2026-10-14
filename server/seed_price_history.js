import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const { MarketplaceProduct } = await import('./src/models/MarketplaceProduct.model.js');
    const { PriceHistory } = await import('./src/models/PriceHistory.model.js');

    const mps = await MarketplaceProduct.find({});
    console.log(`Found ${mps.length} marketplace products. Generating price history...`);

    let generated = 0;
    
    // Process in batches
    for (const mp of mps) {
      if (!mp.currentPrice) continue;
      
      const exists = await PriceHistory.findOne({ marketplaceProduct: mp._id });
      if (exists) continue; // Skip if already has history

      const historyDocs = [];
      const now = new Date();
      
      // Generate 5-10 random data points over the last 30 days
      const numPoints = Math.floor(Math.random() * 5) + 5;
      let lastPrice = mp.originalPrice || (mp.currentPrice * 1.2);
      
      for (let i = numPoints; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - (i * 3)); // Every ~3 days
        
        // Randomly fluctuate price by -5% to +5%, but trend downwards to currentPrice
        if (i === 0) {
          lastPrice = mp.currentPrice;
        } else {
          const diff = mp.currentPrice - lastPrice;
          const step = diff / i;
          const randomJitter = (Math.random() - 0.5) * (lastPrice * 0.05); // 5% jitter
          lastPrice = lastPrice + step + randomJitter;
        }

        historyDocs.push({
          product: mp.product,
          marketplace: mp.marketplace,
          marketplaceProduct: mp._id,
          price: Math.max(10, Math.round(lastPrice)),
          date: d
        });
      }

      await PriceHistory.insertMany(historyDocs);
      generated++;
    }

    console.log(`Generated history for ${generated} marketplace products.`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
