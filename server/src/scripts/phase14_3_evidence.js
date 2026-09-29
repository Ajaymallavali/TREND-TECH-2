import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const targetIds = [
  '6aa06056af8879d815dca656',
  '6aa06057af8879d815dcab3f',
  '6aa06057af8879d815dcab4e',
  '6aa06057af8879d815dcab6c',
  '6aa06057af8879d815dcac7a',
  '6aa06057af8879d815dcade2',
  '6aa06057af8879d815dcafe0',
  '6aa06057af8879d815dcaffe',
  '6aa06058af8879d815dcb1fc'
];

async function run() {
  await mongoose.connect('mongodb://localhost:27017/trend-tech');
  const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false, collection: 'products' }));
  const MarketplaceProduct = mongoose.model('MarketplaceProduct', new mongoose.Schema({}, { strict: false, collection: 'marketplaceproducts' }));

  const evidenceMap = {};
  
  for (const id of targetIds) {
    evidenceMap[id] = { product: null, mps: [], grepMatches: [] };
    evidenceMap[id].product = await Product.findOne({ _id: new mongoose.Types.ObjectId(id) }).lean();
    evidenceMap[id].mps = await MarketplaceProduct.find({ product: new mongoose.Types.ObjectId(id) }).lean();
  }
  
  // grep all JSON files in the project for these IDs
  try {
     const grepCmd = `grep -rI --include="*.json" -E "${targetIds.join('|')}" src/data`;
     const grepOut = execSync(grepCmd, { encoding: 'utf-8' });
     const lines = grepOut.split('\n');
     for (const line of lines) {
       for (const id of targetIds) {
         if (line.includes(id)) {
           evidenceMap[id].grepMatches.push(line.trim());
         }
       }
     }
  } catch (e) {
     console.log("Grep error or no matches found.");
  }

  console.log(JSON.stringify(evidenceMap, null, 2));
  process.exit(0);
}
run();
