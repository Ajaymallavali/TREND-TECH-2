import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const { Product } = await import('./src/models/Product.model.js');
    const { MarketplaceProduct } = await import('./src/models/MarketplaceProduct.model.js');
    const { Marketplace } = await import('./src/models/Marketplace.model.js');

    const amazonIn = await Marketplace.findOne({ name: 'Amazon India' }) || await Marketplace.findOne({ name: 'Amazon' });
    const flipkart = await Marketplace.findOne({ name: 'Flipkart' });
    const croma = await Marketplace.findOne({ name: 'Croma' });

    console.log(`Amazon ID: ${amazonIn?._id}`);
    console.log(`Flipkart ID: ${flipkart?._id}`);
    console.log(`Croma ID: ${croma?._id}`);

    const products = await Product.find({});
    let updatedUrls = 0;
    let addedMarketplaces = 0;
    let addedDiscounts = 0;

    for (const prod of products) {
      const q = encodeURIComponent(`${prod.brand} ${prod.name}`);
      let mps = await MarketplaceProduct.find({ product: prod._id });
      
      // Ensure at least 2 marketplaces (Amazon and Flipkart)
      const hasAmazon = mps.some(mp => mp.marketplace.toString() === amazonIn._id.toString());
      const hasFlipkart = mps.some(mp => mp.marketplace.toString() === flipkart._id.toString());
      
      if (!hasAmazon && amazonIn) {
        const mp = new MarketplaceProduct({
          product: prod._id,
          marketplace: amazonIn._id,
          url: `https://www.amazon.in/s?k=${q}`,
          currentPrice: 999, // default placeholder
          originalPrice: 1299
        });
        mps.push(mp);
        addedMarketplaces++;
      }
      
      if (!hasFlipkart && flipkart) {
        const mp = new MarketplaceProduct({
          product: prod._id,
          marketplace: flipkart._id,
          url: `https://www.flipkart.com/search?q=${q}`,
          currentPrice: 999,
          originalPrice: 1299
        });
        mps.push(mp);
        addedMarketplaces++;
      }

      // Update all associated marketplace products with working Search URLs and proper discounts
      for (const mp of mps) {
        // Fix URL to use search if it's Amazon or Flipkart or Croma etc.
        const mpData = await Marketplace.findById(mp.marketplace);
        if (mpData) {
          const name = mpData.name.toLowerCase();
          if (name.includes('amazon')) {
            mp.url = `https://www.amazon.in/s?k=${q}`;
          } else if (name.includes('flipkart')) {
            mp.url = `https://www.flipkart.com/search?q=${q}`;
          } else if (name.includes('croma')) {
            mp.url = `https://www.croma.com/searchB?q=${q}`;
          } else if (name.includes('reliance')) {
            mp.url = `https://www.reliancedigital.in/search?q=${q}`;
          } else if (name.includes('myntra')) {
            mp.url = `https://www.myntra.com/${encodeURIComponent(prod.name)}`;
          } else {
            mp.url = `https://www.google.com/search?q=${encodeURIComponent(mpData.name + ' ' + prod.brand + ' ' + prod.name + ' buy')}`;
          }
        }

        // Add 10% to 30% discount if there's no originalPrice or it's equal to currentPrice
        if (!mp.originalPrice || mp.originalPrice <= mp.currentPrice) {
          const discountRatio = 1 + (Math.floor(Math.random() * 20) + 10) / 100; // 1.1x to 1.3x
          mp.originalPrice = Math.round(mp.currentPrice * discountRatio);
          addedDiscounts++;
        }
        
        // Bypass enum validation for legacy data
        if (!['LEGACY_SYNTHETIC', 'LIVE_VERIFIED', 'UNRESOLVED'].includes(mp.sourceStatus)) {
          mp.sourceStatus = 'LEGACY_SYNTHETIC';
        }
        
        await mp.save();
        updatedUrls++;
      }
    }

    console.log(`Done! Updated ${updatedUrls} URLs, added ${addedMarketplaces} missing marketplace links, injected ${addedDiscounts} discounts.`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
