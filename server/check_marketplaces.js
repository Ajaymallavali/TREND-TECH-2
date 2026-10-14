import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    const { Marketplace } = await import('./src/models/Marketplace.model.js');
    const mps = await Marketplace.find({});
    console.log(mps.map(m => m.name));
    process.exit(0);
  });
