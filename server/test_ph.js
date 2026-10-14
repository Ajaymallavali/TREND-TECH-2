import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const { PriceHistory } = await import('./src/models/PriceHistory.model.js');
  const h = await PriceHistory.find({}).sort({_id: -1}).limit(5);
  console.log(h);
  process.exit();
}
run();
