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

export const Marketplace = mongoose.model('Marketplace', marketplaceSchema);
