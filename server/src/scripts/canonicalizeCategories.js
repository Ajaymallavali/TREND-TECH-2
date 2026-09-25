import { connectDB, disconnectDB } from '../config/db.js';
import { Product } from '../models/Product.model.js';

function deriveCanonicalCategory(product) {
  const name = (product.name || '').toLowerCase();
  const desc = (product.description || '').toLowerCase();
  const tags = (product.tags || []).map((t) => t.toLowerCase()).join(' ');
  const combined = `${name} ${desc} ${tags}`;

  if (combined.includes('iphone') || combined.includes('galaxy s') || combined.includes('smartphone') || combined.includes('phone') || combined.includes('mobile') || combined.includes('pixel') || combined.includes('oneplus') || combined.includes('redmi') || combined.includes('realme') || combined.includes('vivo') || combined.includes('oppo') || combined.includes('nokia')) {
    return 'smartphone';
  }
  if (combined.includes('laptop') || combined.includes('macbook') || combined.includes('notebook') || combined.includes('thinkpad') || combined.includes('ideapad') || combined.includes('aspire') || combined.includes('vivobook') || combined.includes('zenbook') || combined.includes('pavilion') || combined.includes('inspiron') || combined.includes('tuf') || combined.includes('victus') || combined.includes('chromebook')) {
    return 'laptop';
  }
  if (combined.includes('tv') || combined.includes('television') || combined.includes('oled') || combined.includes('qled') || combined.includes('bravia') || combined.includes('gloled') || combined.includes('smart tv')) {
    return 'television';
  }
  if (combined.includes('headphone') || combined.includes('headphones') || combined.includes('earbud') || combined.includes('earbuds') || combined.includes('airpods') || combined.includes('airdopes') || combined.includes('soundbar') || combined.includes('wh-1000xm5') || combined.includes('wf-1000xm5') || combined.includes('audio')) {
    return 'headphones';
  }
  if (combined.includes('watch') || combined.includes('smartwatch') || combined.includes('apple watch') || combined.includes('galaxy watch') || combined.includes('fitbit') || combined.includes('colorfit') || combined.includes('wearable')) {
    return 'smartwatch';
  }
  if (combined.includes('monitor') || combined.includes('ultragear') || combined.includes('display')) {
    return 'monitor';
  }
  if (combined.includes('ipad') || combined.includes('tablet') || combined.includes('tab')) {
    return 'tablet';
  }
  if (combined.includes('camera') || combined.includes('dslr') || combined.includes('eos') || combined.includes('gopro') || combined.includes('instax') || combined.includes('vlogging')) {
    return 'camera';
  }
  if (combined.includes('playstation') || combined.includes('xbox') || combined.includes('switch') || combined.includes('gaming') || combined.includes('console') || combined.includes('dualsense') || combined.includes('mouse') || combined.includes('controller')) {
    return 'gaming';
  }

  return 'smartphone'; // default electronics fallback
}

async function canonicalize() {
  console.log('🔄 Executing non-destructive Canonical Category Normalization...');
  await connectDB();

  const products = await Product.find({});
  let updatedCount = 0;

  for (const p of products) {
    const targetCat = deriveCanonicalCategory(p);
    if (p.category !== targetCat) {
      p.category = targetCat;
      await p.save();
      updatedCount++;
    }
  }

  console.log(`✅ Normalized canonical categories for ${updatedCount} products in MongoDB.`);

  const distinctCats = await Product.distinct('category');
  console.log('Updated distinct categories in DB:', distinctCats);

  await disconnectDB();
}

canonicalize().catch(console.error);
