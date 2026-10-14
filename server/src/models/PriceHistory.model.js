import mongoose from 'mongoose';

const { Schema } = mongoose;

const priceHistorySchema = new Schema(
  {
    marketplaceProduct: {
      type: Schema.Types.ObjectId,
      ref: 'MarketplaceProduct',
      required: true,
      index: true,
    },
    price: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Index to quickly query history chronologically for a specific listing
priceHistorySchema.index({ marketplaceProduct: 1, timestamp: -1 });

import { createFirestoreModel } from '../database/firestore/FirestoreAdapter.js';
const MongoPH = mongoose.model('PriceHistory', priceHistorySchema);
export const PriceHistory = process.env.DATABASE_PROVIDER === 'firestore' ? createFirestoreModel('priceHistory') : MongoPH;
