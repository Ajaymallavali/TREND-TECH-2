import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/trend-tech';

const FROZEN_SAMSUNG_IDS = new Set([
  '6a9904e369652590e0aadc04', // Samsung Galaxy A55 5G
  '6a9904e369652590e0aadc06', // Samsung Galaxy M55 5G
  '6a9904e369652590e0aadc08', // Samsung Galaxy F55 5G
  '6aa06056af8879d815dca619', // Samsung Galaxy S24
  '6aa06057af8879d815dcadd3', // Samsung Galaxy Buds3 Pro
  '6aa06058af8879d815dcb11b'  // Samsung Galaxy Tab S10 Ultra
]);

// Deterministic normalization function
function normalizeSamsungProduct(name, category) {
  let brand = 'Samsung';
  let family = '';
  let model = '';
  let modelNumber = '';
  let series = '';
  let screenSize = null;

  const nameLower = name.toLowerCase();

  // Televisions / Monitors screen size extraction
  const sizeMatch = name.match(/(\d+)"/);
  if (sizeMatch) {
    screenSize = parseInt(sizeMatch[1]);
  }

  // Model number extraction in parens (e.g. QN900D, S90D)
  const parenModelMatch = name.match(/\(([A-Z0-9]+)\)/);
  if (parenModelMatch) {
    modelNumber = parenModelMatch[1];
  }

  if (category === 'smartphone') {
    if (nameLower.includes('fold')) {
      family = 'Galaxy Z Fold';
      model = 'Galaxy Z Fold 6';
      modelNumber = 'SM-F956B';
    } else if (nameLower.includes('flip')) {
      family = 'Galaxy Z Flip';
      model = 'Galaxy Z Flip 6';
      modelNumber = 'SM-F741B';
    } else if (nameLower.includes('s25 ultra')) {
      family = 'Galaxy S';
      series = 'S25';
      model = 'Galaxy S25 Ultra';
      modelNumber = 'SM-S938B';
    } else if (nameLower.includes('s25+')) {
      family = 'Galaxy S';
      series = 'S25';
      model = 'Galaxy S25+';
      modelNumber = 'SM-S936B';
    } else if (nameLower.includes('s25')) {
      family = 'Galaxy S';
      series = 'S25';
      model = 'Galaxy S25';
      modelNumber = 'SM-S931B';
    } else if (nameLower.includes('s24 ultra')) {
      family = 'Galaxy S';
      series = 'S24';
      model = 'Galaxy S24 Ultra';
      modelNumber = 'SM-S928B';
    } else if (nameLower.includes('s24+')) {
      family = 'Galaxy S';
      series = 'S24';
      model = 'Galaxy S24+';
      modelNumber = 'SM-S926B';
    } else if (nameLower.includes('s23 fe')) {
      family = 'Galaxy S';
      series = 'S23';
      model = 'Galaxy S23 FE';
      modelNumber = 'SM-S711B';
    }
  } else if (category === 'television') {
    if (nameLower.includes('qn900d')) {
      family = 'Neo QLED 8K';
      model = 'QN900D';
      modelNumber = 'QA65QN900DKXXL';
    } else if (nameLower.includes('frame')) {
      family = 'The Frame';
      model = 'LS03D';
      modelNumber = 'QA55LS03DAKXXL';
    } else if (nameLower.includes('s90d')) {
      family = 'OLED 4K';
      model = 'S90D';
      modelNumber = 'QA65S90DAKXXL';
    } else if (nameLower.includes('crystal 4k')) {
      family = 'Crystal 4K';
      model = 'DUE77';
      modelNumber = 'UA50DUE77AKXXL';
    } else if (nameLower.includes('qn85d')) {
      family = 'Neo QLED 4K';
      model = 'QN85D';
      modelNumber = 'QA75QN85DAKXXL';
    }
  } else if (category === 'headphones') {
    if (nameLower.includes('buds fe')) {
      family = 'Galaxy Buds';
      model = 'Galaxy Buds FE';
      modelNumber = 'SM-R400N';
    }
  } else if (category === 'smartwatch') {
    if (nameLower.includes('watch ultra')) {
      family = 'Galaxy Watch';
      model = 'Galaxy Watch Ultra';
      modelNumber = 'SM-L705F';
    } else if (nameLower.includes('watch 7')) {
      family = 'Galaxy Watch';
      model = 'Galaxy Watch 7';
      modelNumber = 'SM-L310N';
    } else if (nameLower.includes('watch 6 classic')) {
      family = 'Galaxy Watch';
      model = 'Galaxy Watch 6 Classic';
      modelNumber = 'SM-R950N';
    }
  } else if (category === 'monitor') {
    if (nameLower.includes('oled g9')) {
      family = 'Odyssey OLED';
      model = 'OLED G9 (G95SC)';
      modelNumber = 'LS49CG954SWXXL';
    } else if (nameLower.includes('oled g8')) {
      family = 'Odyssey OLED';
      model = 'OLED G8 (G80SD)';
      modelNumber = 'LS32DG802SWXXL';
    } else if (nameLower.includes('monitor m8')) {
      family = 'Smart Monitor';
      model = 'Smart Monitor M8 (M80D)';
      modelNumber = 'LS32DM801UWXXL';
    }
  } else if (category === 'tablet') {
    if (nameLower.includes('tab s10+')) {
      family = 'Galaxy Tab S';
      model = 'Galaxy Tab S10+';
      modelNumber = 'SM-X820N';
    } else if (nameLower.includes('tab s9 fe')) {
      family = 'Galaxy Tab S';
      model = 'Galaxy Tab S9 FE';
      modelNumber = 'SM-X510N';
    } else if (nameLower.includes('tab a9+')) {
      family = 'Galaxy Tab A';
      model = 'Galaxy Tab A9+';
      modelNumber = 'SM-X210N';
    } else if (nameLower.includes('active5')) {
      family = 'Galaxy Tab Active';
      model = 'Galaxy Tab Active5';
      modelNumber = 'SM-X306B';
    }
  }

  return {
    brand,
    family,
    series,
    model,
    modelNumber,
    screenSize,
    normalizedName: `${brand} ${model || name}`
  };
}

async function main() {
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;

  const allSamsung = await db.collection('products').find({ brand: /samsung/i }).toArray();
  const candidates = allSamsung.filter(p => !FROZEN_SAMSUNG_IDS.has(p._id.toString()));

  console.log(`Analyzing ${candidates.length} candidate Samsung products for Phase 8...`);

  const inventoryList = [];

  for (const p of candidates) {
    const productId = p._id.toString();
    const normalized = normalizeSamsungProduct(p.name, p.category);

    const mps = await db.collection('marketplaceproducts').find({ productId: p._id }).toArray();
    const phs = await db.collection('pricehistories').find({ productId: p._id }).toArray();

    inventoryList.push({
      productId,
      originalName: p.name,
      category: p.category,
      normalizedIdentity: normalized,
      dbFields: {
        description: p.description || null,
        features: p.features || [],
        tags: p.tags || [],
        existingImage: p.image || null,
        existingImageStatus: p.imageStatus || 'UNVERIFIED'
      },
      linkedMarketplaceProductsCount: mps.length,
      linkedPriceHistoryCount: phs.length
    });
  }

  // Save audit files
  const jsonPath = path.join(__dirname, '../data/audits/samsungPhase8IdentityInventory.json');
  fs.mkdirSync(path.dirname(jsonPath), { recursive: true });
  fs.writeFileSync(jsonPath, JSON.stringify(inventoryList, null, 2));

  let mdContent = `# SAMSUNG PHASE 8 IDENTITY INVENTORY\n\n`;
  mdContent += `**Generated At**: ${new Date().toISOString()}\n`;
  mdContent += `**Total Candidates Analyzed**: ${inventoryList.length}\n\n`;
  mdContent += `| Product ID | Original Name | Category | Normalized Model | Model Number |\n`;
  mdContent += `| --- | --- | --- | --- | --- |\n`;
  inventoryList.forEach(item => {
    mdContent += `| \`${item.productId}\` | ${item.originalName} | ${item.category} | ${item.normalizedIdentity.model} | \`${item.normalizedIdentity.modelNumber || 'N/A'}\` |\n`;
  });
  fs.writeFileSync(path.join(__dirname, '../data/audits/samsungPhase8IdentityInventory.md'), mdContent);

  console.log('Saved samsungPhase8IdentityInventory.json and .md');

  await mongoose.disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
