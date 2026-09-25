import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import { evaluateCandidateIngestion } from '../services/safeIngestion.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

const DRY_RUN = process.env.DRY_RUN !== 'false'; // Default DRY_RUN = true

// 5 Commercial Test Target Benchmark Products across 5 categories
const TARGET_BENCHMARK_PRODUCTS = [
  {
    name: 'Apple iPhone 15 Pro Max',
    brand: 'Apple',
    category: 'smartphone',
    specs: { Storage: '256GB', RAM: '8GB' }
  },
  {
    name: 'Apple MacBook Air M3',
    brand: 'Apple',
    category: 'laptop',
    specs: { Storage: '512GB', RAM: '16GB' }
  },
  {
    name: 'LG C3 55-inch OLED TV',
    brand: 'LG',
    category: 'television',
    specs: { Size: '55-inch', Resolution: '4K UHD' }
  },
  {
    name: 'Sony WH-1000XM5',
    brand: 'Sony',
    category: 'headphones',
    specs: { Type: 'Over-ear', NoiseCancelling: 'ANC' }
  },
  {
    name: 'Apple Watch Series 9',
    brand: 'Apple',
    category: 'smartwatch',
    specs: { Size: '45mm', Connectivity: 'GPS' }
  }
];

// Candidates evaluated for Phase 3C Safe Ingestion Pipeline
const CANDIDATE_SAMPLE_OFFERS = [
  // 1. Verified iPhone Candidate with Direct Amazon CDN Image & ASIN
  {
    targetIndex: 0,
    name: 'Apple iPhone 15 Pro Max (256GB) - Natural Titanium',
    marketplace: 'Amazon India',
    url: 'https://www.amazon.in/dp/B0CHX1W1XY',
    currentPrice: 148900,
    image: 'https://m.media-amazon.com/images/I/81Os1SDWJA-L._SL1500_.jpg',
    specs: { Storage: '256GB', RAM: '8GB' }
  },
  // 2. Unverified Accessory (Must be REJECTED)
  {
    targetIndex: 0,
    name: 'iPhone 15 Pro Max Silicone Case with MagSafe',
    marketplace: 'Amazon India',
    url: 'https://www.amazon.in/dp/B0CHX89WZZ',
    currentPrice: 4900,
    image: 'https://m.media-amazon.com/images/I/51w9W4+a-iL._SL1500_.jpg',
    specs: {}
  },
  // 3. Verified MacBook Candidate with Direct Amazon CDN Image & ASIN
  {
    targetIndex: 1,
    name: 'Apple MacBook Air M3 15-inch (16GB RAM, 512GB SSD)',
    marketplace: 'Amazon India',
    url: 'https://www.amazon.in/dp/B0CX23G97J',
    currentPrice: 134900,
    image: 'https://m.media-amazon.com/images/I/71jG+e7roXL._SL1500_.jpg',
    specs: { Storage: '512GB', RAM: '16GB' }
  },
  // 4. Unverified Accessory (Must be REJECTED)
  {
    targetIndex: 1,
    name: 'MacBook Air M3 Keyboard Cover Protector',
    marketplace: 'Amazon India',
    url: 'https://www.amazon.in/dp/B0CX999KEY',
    currentPrice: 799,
    image: 'https://m.media-amazon.com/images/I/71jG+e7roXL._SL1500_.jpg',
    specs: {}
  },
  // 5. Product Mismatch Candidate (Must be REJECTED)
  {
    targetIndex: 2,
    name: 'LG C3 55-inch Smart OLED 4K TV (OLED55C3PSA)',
    marketplace: 'Flipkart',
    url: 'https://www.flipkart.com/lg-c3-55-inch-oled-4k-tv/p/itm12345678',
    currentPrice: 119990,
    image: 'https://images.unsplash.com/photo-1461151304267-38535e780c79?w=801',
    specs: { Size: '55-inch' }
  },
  // 6. Verified Sony Headphones Candidate with Direct Amazon CDN Image & ASIN
  {
    targetIndex: 3,
    name: 'Sony WH-1000XM5 Wireless Noise Cancelling Headphones',
    marketplace: 'Amazon India',
    url: 'https://www.amazon.in/dp/B09XS7JWHH',
    currentPrice: 29990,
    image: 'https://m.media-amazon.com/images/I/51SKmu2G9FL._SL1500_.jpg',
    specs: { Type: 'Over-ear' }
  },
  // 7. Generic Unsplash Image Candidate (Must be REJECTED under Phase 3A/3C rules)
  {
    targetIndex: 3,
    name: 'Sony WH-1000XM5 Headphones (Unsplash Image)',
    marketplace: 'Amazon India',
    url: 'https://www.amazon.in/dp/B09XS7JWHH',
    currentPrice: 29990,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
    specs: { Type: 'Over-ear' }
  },
  // 8. Unverified Case Accessory (Must be REJECTED)
  {
    targetIndex: 4,
    name: 'Apple Watch Series 9 GPS 45mm Aluminum Case',
    marketplace: 'Amazon India',
    url: 'https://www.amazon.in/dp/B0CHX34LMN',
    currentPrice: 41900,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=801',
    specs: { Size: '45mm' }
  }
];

async function runIngestionPipeline() {
  console.log('🛡️ TREND-TECH PHASE 3C — SAFE REAL-DATA INGESTION PIPELINE (DRY-RUN)\n');

  if (DRY_RUN) {
    console.log('🔒 DRY_RUN=true | DATABASE WRITE DISABLED');
    console.log('   Zero records will be created, updated, or deleted in MongoDB.\n');
  } else {
    console.log('⚠️ DRY_RUN=false | IMPORT MODE ACTIVE\n');
  }

  // Check SerpAPI API Key configuration
  const serpApiKey = process.env.SERPAPI_API_KEY;
  if (!serpApiKey) {
    console.warn('⚠️ CONFIGURATION NOTICE: SERPAPI_API_KEY is not configured in .env environment.');
    console.warn('   Pipeline will evaluate candidates against direct verified marketplace CDN images under strict dry-run rules.\n');
  } else {
    console.log('✅ SERPAPI_API_KEY configured cleanly.\n');
  }

  const auditLogEntries = [];
  let acceptedCount = 0;
  let rejectedCount = 0;

  for (const candidate of CANDIDATE_SAMPLE_OFFERS) {
    const targetProduct = TARGET_BENCHMARK_PRODUCTS[candidate.targetIndex];
    const auditRecord = evaluateCandidateIngestion(targetProduct, candidate, { dryRun: DRY_RUN });
    auditLogEntries.push(auditRecord);

    if (auditRecord.matchStatus === 'ACCEPTED') {
      acceptedCount++;
    } else {
      rejectedCount++;
    }
  }

  // Write audit JSON files
  const auditSummary = {
    metadata: {
      generatedAt: new Date().toISOString(),
      dryRunMode: DRY_RUN,
      databaseWriteDisabled: DRY_RUN,
      totalBenchmarkTargets: TARGET_BENCHMARK_PRODUCTS.length,
      totalCandidatesEvaluated: CANDIDATE_SAMPLE_OFFERS.length,
      acceptedCount,
      rejectedCount
    },
    benchmarkTargets: TARGET_BENCHMARK_PRODUCTS,
    auditLogs: auditLogEntries
  };

  const targetDirs = [
    path.join(__dirname, '../data/audits'),
    path.join(__dirname, '../../../data/audits')
  ];

  for (const dir of targetDirs) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(path.join(dir, 'ingestionAudit.json'), JSON.stringify(auditSummary, null, 2));
  }

  // Terminal Output Summary
  console.log('===============================================================');
  console.log('         SAFE INGESTION EVALUATION RESULTS (DRY-RUN)          ');
  console.log('===============================================================');
  console.log(`Total Candidates Evaluated:       ${CANDIDATE_SAMPLE_OFFERS.length}`);
  console.log(`Accepted Candidates:              ${acceptedCount}`);
  console.log(`Rejected Candidates:              ${rejectedCount}`);
  console.log('---------------------------------------------------------------');
  console.log('REJECTION & ACCEPTANCE BREAKDOWN:');
  for (const entry of auditLogEntries) {
    if (entry.matchStatus === 'REJECTED') {
      console.log(`  ❌ Candidate: "${entry.candidateTitle}"`);
      console.log(`     Reason:    ${entry.rejectionReason}`);
    } else {
      console.log(`  ✅ ACCEPTED:  "${entry.candidateTitle}"`);
      console.log(`     ASIN:      ${entry.asin || 'N/A'}`);
      console.log(`     Price:     ₹${entry.price}`);
      console.log(`     Image:     ${entry.imageStatus}`);
      console.log(`     Action:    ${entry.action}`);
    }
  }
  console.log('===============================================================');
  console.log(`Audit log written to: ${path.join(targetDirs[0], 'ingestionAudit.json')}`);
  console.log('===============================================================\n');
}

runIngestionPipeline().catch((err) => {
  console.error('Fatal ingestion pipeline error:', err);
  process.exit(1);
});
