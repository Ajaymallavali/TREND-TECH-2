import mongoose from 'mongoose';

const { Schema } = mongoose;

const marketplaceProductSchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    marketplace: { type: Schema.Types.ObjectId, ref: 'Marketplace', required: true },
    sku: { type: String, trim: true },
    url: { type: String, required: true },
    currentPrice: { type: Number, required: true },
    originalPrice: { type: Number, default: null },
    currency: { type: String, default: 'INR' },
    isAvailable: { type: Boolean, default: true },
    lastUpdated: { type: Date, default: Date.now },
    externalProductId: { type: String, default: null, index: true },
    sourceStatus: { type: String, enum: ['LEGACY_SYNTHETIC', 'LIVE_VERIFIED', 'UNRESOLVED'], default: 'LEGACY_SYNTHETIC', index: true },
  },
  { timestamps: true, strict: false }
);

// Create compound index for product + marketplace uniqueness
marketplaceProductSchema.index({ product: 1, marketplace: 1 }, { unique: true });

import { createFirestoreModel } from '../database/firestore/FirestoreAdapter.js';
const MongoMP = mongoose.model('MarketplaceProduct', marketplaceProductSchema);
export const MarketplaceProduct = process.env.DATABASE_PROVIDER === 'firestore' ? createFirestoreModel('marketplaceProducts') : MongoMP;
