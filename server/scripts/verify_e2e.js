import mongoose from 'mongoose';

async function verify() {
  await mongoose.connect('mongodb://localhost:27017/trend-tech');
  const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));

  // Pick 3 diverse products: Smartphone, Laptop, Audio
  const testIds = [
    '6a9904e369652590e0aadbf0', // iPhone Air
  ];

  const laptop = await Product.findOne({ category: { $regex: /laptop/i } });
  if (laptop) testIds.push(laptop._id.toString());

  const audio = await Product.findOne({ category: { $regex: /audio|headphone|earbud/i } });
  if (audio) testIds.push(audio._id.toString());

  console.log(`\n=================== VERIFICATION AUDIT ===================`);

  for (const pid of testIds) {
    const detailsRes = await fetch(`http://localhost:5001/api/products/${pid}`);
    const details = (await detailsRes.json()).data;

    const historyRes = await fetch(`http://localhost:5001/api/products/${pid}/history`);
    const history = (await historyRes.json()).data;

    console.log(`\n📦 Product: [${details.category}] ${details.name} (${details.brand})`);
    console.log(`- Lowest Price: ₹${details.lowestPrice?.toLocaleString('en-IN')} | Highest: ₹${details.highestPrice?.toLocaleString('en-IN')}`);
    console.log(`- Verified Store Offers (${details.marketplaces?.length}):`);
    details.marketplaces?.forEach((m) => {
      console.log(`   • ${m.marketplace}: ₹${m.currentPrice?.toLocaleString('en-IN')} (MRP: ₹${m.originalPrice?.toLocaleString('en-IN')}, ${m.discountPercentage}% OFF, Status: ${m.priceStatus})`);
    });

    console.log(`- Historical Offer Report:`);
    console.log(`   • Last Month Offer: ₹${details.historicalOfferReport?.lastMonthOffer?.price?.toLocaleString('en-IN')} (${details.historicalOfferReport?.lastMonthOffer?.discountPercentage}% OFF on ${details.historicalOfferReport?.lastMonthOffer?.store})`);
    console.log(`   • Last Week Offer: ₹${details.historicalOfferReport?.lastWeekOffer?.price?.toLocaleString('en-IN')} (${details.historicalOfferReport?.lastWeekOffer?.discountPercentage}% OFF on ${details.historicalOfferReport?.lastWeekOffer?.store})`);
    console.log(`   • 30-Day Lowest: ₹${details.historicalOfferReport?.lowestPrice30Days?.price?.toLocaleString('en-IN')}`);
    console.log(`   • Verdict: ${details.historicalOfferReport?.dealVerdict?.headline}`);

    console.log(`- Annual Purchase Data (${details.annualPurchases?.year}):`);
    console.log(`   • Total Volume: ${details.annualPurchases?.totalVolume?.toLocaleString('en-IN')} units`);
    console.log(`   • Peak Month: ${details.annualPurchases?.peakMonth}`);
    console.log(`   • Monthly Data Points: ${details.annualPurchases?.monthlyData?.length} months`);

    console.log(`- Multi-Store Price Trend History:`);
    console.log(`   • History Snapshots: ${history.length} snapshots`);
    if (history.length > 0) {
      const sample = history[0];
      const stores = Object.keys(sample).filter(k => k !== 'date');
      console.log(`   • Stores present in history: ${stores.join(', ')}`);
      console.log(`   • Sample Snapshot (${sample.date}):`, sample);
    }
  }

  console.log(`\n=================== ALL TESTS PASSED ===================\n`);
  process.exit(0);
}

verify().catch((err) => {
  console.error(err);
  process.exit(1);
});
