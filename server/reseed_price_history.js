import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const { PriceHistory } = await import('./src/models/PriceHistory.model.js');
    
    // Find all recently inserted items (from today) where we messed up the timestamp
    const today = new Date();
    today.setHours(0,0,0,0);
    
    const docs = await PriceHistory.find({ createdAt: { $gte: today } });
    console.log(`Found ${docs.length} docs to fix`);

    // Delete them all
    await PriceHistory.deleteMany({ createdAt: { $gte: today } });
    console.log('Deleted bad docs. Rerunning seed script logic...');

    const { MarketplaceProduct } = await import('./src/models/MarketplaceProduct.model.js');
    const mps = await MarketplaceProduct.find({});
    console.log(`Found ${mps.length} marketplace products.`);

    let generated = 0;
    
    for (const mp of mps) {
      if (!mp.currentPrice) continue;
      
      const exists = await PriceHistory.findOne({ marketplaceProduct: mp._id });
      if (exists) continue;

      const historyDocs = [];
      const now = new Date();
      
      const numPoints = Math.floor(Math.random() * 5) + 5; // 5 to 9 points
      let lastPrice = mp.originalPrice || (mp.currentPrice * 1.2);
      
      for (let i = numPoints; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - (i * 3));
        
        if (i === 0) {
          lastPrice = mp.currentPrice;
        } else {
          const diff = mp.currentPrice - lastPrice;
          const step = diff / i;
          const randomJitter = (Math.random() - 0.5) * (lastPrice * 0.05);
          lastPrice = lastPrice + step + randomJitter;
        }

        historyDocs.push({
          product: mp.product,
          marketplace: mp.marketplace,
          marketplaceProduct: mp._id,
          price: Math.max(10, Math.round(lastPrice)),
          timestamp: d // <--- THIS WAS 'date: d' BEFORE!
        });
      }

      await PriceHistory.insertMany(historyDocs);
      generated++;
    }

    console.log(`Generated history for ${generated} marketplace products with CORRECT TIMESTAMPS.`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
