import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    const { MarketplaceProduct } = await import('./src/models/MarketplaceProduct.model.js');
    const { Product } = await import('./src/models/Product.model.js');
    const { Marketplace } = await import('./src/models/Marketplace.model.js');
    
    const count = await MarketplaceProduct.countDocuments();
    console.log(`Found ${count} marketplace products`);
    
    const sample = await MarketplaceProduct.findOne().populate('product').populate('marketplace');
    console.log('Sample:', JSON.stringify(sample, null, 2));
    
    mongoose.disconnect();
  })
  .catch(console.error);
