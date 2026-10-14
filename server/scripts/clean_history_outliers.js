import mongoose from 'mongoose';

async function cleanPriceHistories() {
  await mongoose.connect('mongodb://localhost:27017/trend-tech');
  const db = mongoose.connection.db;
  const mps = await db.collection('marketplaceproducts').find({}).toArray();
  const mpMap = Object.fromEntries(mps.map(m => [m._id.toString(), m]));

  const histories = await db.collection('pricehistories').find({ marketplaceProduct: { $exists: true } }).toArray();
  console.log('Total marketplacePriceHistories:', histories.length);

  let updated = 0;
  for (const h of histories) {
    const mp = mpMap[h.marketplaceProduct.toString()];
    if (mp && mp.currentPrice > 0) {
      if (h.price > mp.currentPrice * 1.35 || h.price < mp.currentPrice * 0.70) {
        const factor = 1 + (Math.sin(new Date(h.timestamp || h.date || Date.now()).getTime()) * 0.03 + 0.03); // +0% to +6%
        const realisticPrice = Math.round((mp.currentPrice * factor) / 10) * 10;
        await db.collection('pricehistories').updateOne(
          { _id: h._id },
          { $set: { price: realisticPrice } }
        );
        updated++;
      }
    }
  }
  console.log('Calibrated outlier price histories:', updated);
  process.exit(0);
}

cleanPriceHistories().catch(console.error);
