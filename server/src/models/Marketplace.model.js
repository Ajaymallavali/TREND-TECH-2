import mongoose from 'mongoose';

const { Schema } = mongoose;

const marketplaceSchema = new Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    code: { type: String, required: true, unique: true, lowercase: true, trim: true },
    logoUrl: { type: String, default: null },
    baseUrl: { type: String, default: null },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

import { createFirestoreModel } from '../database/firestore/FirestoreAdapter.js';
const MongoMarketplace = mongoose.model('Marketplace', marketplaceSchema);
export const Marketplace = process.env.DATABASE_PROVIDER === 'firestore' ? createFirestoreModel('marketplaces') : MongoMarketplace;
