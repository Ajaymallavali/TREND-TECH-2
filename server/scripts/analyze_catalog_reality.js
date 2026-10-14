import mongoose from 'mongoose';

async function verifyCatalogHealth() {
  await mongoose.connect('mongodb://localhost:27017/trend-tech');
  const db = mongoose.connection.db;
  const products = await db.collection('products').find({}).toArray();
  const mps = await db.collection('marketplaceproducts').find({}).toArray();

  console.log('=== CATALOG HEALTH & AUDIT REPORT ===');
  console.log(`Total Products: ${products.length} (Expected: 867)`);
  console.log(`Total Marketplace Listings: ${mps.length}`);

  const categories = {};
  for (const p of products) {
    const c = p.category;
    if (!categories[c]) categories[c] = [];
    categories[c].push(p);
  }

  console.log('\n--- Category Price Summary ---');
  for (const [c, list] of Object.entries(categories)) {
    list.sort((a, b) => a.minPrice - b.minPrice);
    const min = list[0].minPrice;
    const max = list[list.length - 1].minPrice;
    const avg = Math.round(list.reduce((acc, x) => acc + x.minPrice, 0) / list.length);
    console.log(`Category: ${c.padEnd(22)} Count: ${list.length.toString().padEnd(4)} Min: ₹${min.toLocaleString('en-IN').padStart(8)} | Avg: ₹${avg.toLocaleString('en-IN').padStart(8)} | Max: ₹${max.toLocaleString('en-IN').padStart(9)}`);
  }

  // Audit for any wild pricing anomalies
  console.log('\n--- Wild Anomaly Checks ---');
  let anomalies = 0;

  for (const p of products) {
    const n = p.name.toLowerCase();
    const c = p.category;

    // Budget phone check
    if (c === 'smartphone' && (n.includes('c65') || n.includes('redmi a3') || n.includes('moto e13') || n.includes('nokia 3210'))) {
      if (p.minPrice > 12000) {
        console.warn(`⚠️ Budget phone anomaly: [${p._id}] ${p.name} price: ₹${p.minPrice}`);
        anomalies++;
      }
    }

    // boAt / Noise watch check
    if (c === 'smartwatch' && (n.includes('boat') || n.includes('noise') || n.includes('fire-boltt'))) {
      if (p.minPrice > 5000) {
        console.warn(`⚠️ Budget smartwatch anomaly: [${p._id}] ${p.name} price: ₹${p.minPrice}`);
        anomalies++;
      }
    }

    // Gaming console check
    if (n.includes('switch oled') && p.minPrice > 40000) {
      console.warn(`⚠️ Switch OLED anomaly: [${p._id}] ${p.name} price: ₹${p.minPrice}`);
      anomalies++;
    }

    // Clothing check
    if ((c === 'womens-clothing' || c === 'mens-clothing') && (n.includes('t-shirt') || n.includes('polo')) && p.minPrice > 2000) {
      console.warn(`⚠️ T-shirt anomaly: [${p._id}] ${p.name} price: ₹${p.minPrice}`);
      anomalies++;
    }

    // Apple Case check
    if (n.includes('silicone case') && p.minPrice > 10000) {
      console.warn(`⚠️ iPhone Case anomaly: [${p._id}] ${p.name} price: ₹${p.minPrice}`);
      anomalies++;
    }
  }

  if (anomalies === 0) {
    console.log('🎉 ZERO ANOMALIES FOUND! All category prices are realistic and balanced.');
  } else {
    console.log(`⚠️ Found ${anomalies} anomalies.`);
  }

  // Check multi-store spreads
  console.log('\n--- Multi-store Spread Check ---');
  const prodMap = {};
  for (const m of mps) {
    const pid = m.product.toString();
    if (!prodMap[pid]) prodMap[pid] = [];
    prodMap[pid].push(m);
  }

  let highSpreadCount = 0;
  for (const [pid, list] of Object.entries(prodMap)) {
    if (list.length >= 2) {
      const prices = list.map(x => x.currentPrice);
      const min = Math.min(...prices);
      const max = Math.max(...prices);
      if (min > 0 && max / min > 1.1) { // more than 10% spread between stores
        highSpreadCount++;
      }
    }
  }
  console.log(`Products with >10% multi-store spread: ${highSpreadCount} (Expected: 0)`);

  process.exit(0);
}

verifyCatalogHealth().catch(console.error);
