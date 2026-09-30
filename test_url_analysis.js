import mongoose from 'mongoose';
import { analyzeProductWorkflow } from './server/src/services/productUrlAnalysis/index.js';
import fs from 'fs';
import path from 'path';

async function run() {
  await mongoose.connect('mongodb://localhost:27017/trend-tech');
  
  // Test 1: Amazon Apple iPhone 15
  const res1 = await analyzeProductWorkflow({ query: 'iPhone 15' });
  console.log("Query Test:", res1.status, res1.product?.name);
  
  const res2 = await analyzeProductWorkflow({ url: 'https://www.amazon.in/dp/B0CHX2F5QT' });
  console.log("URL Test:", res2.status, res2.product?.name);

  const res3 = await analyzeProductWorkflow({ url: 'https://notreal.com/product' });
  console.log("Invalid URL Test:", res3.status, res3.error);

  process.exit(0);
}
run();
