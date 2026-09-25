import mongoose from 'mongoose';

const { Schema } = mongoose;

const productSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, index: true },
    brand: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    category: { type: String, required: true, default: 'electronics', index: true },
    image: { type: String, default: null },
    imageSourceUrl: { type: String, default: null },
    imageSource: { type: String, default: null },
    imageStatus: { type: String, default: 'UNVERIFIED', index: true },
    imageVerifiedAt: { type: Date, default: null },
    imageVerifiedProductName: { type: String, default: null },
    imageVerifiedBrand: { type: String, default: null },
    imageVerifiedCategory: { type: String, default: null },
    imageHash: { type: String, default: null, index: true },
    imageWidth: { type: Number, default: null },
    imageHeight: { type: Number, default: null },
    imageMimeType: { type: String, default: null },
    imageVerificationReason: { type: String, default: null },
    sourceStatus: { type: String, enum: ['LEGACY_SYNTHETIC', 'LIVE_VERIFIED', 'UNRESOLVED'], default: 'LEGACY_SYNTHETIC', index: true },
    sourceProvider: { type: String, enum: ['AMAZON', 'FLIPKART', 'OTHER', 'UNKNOWN'], default: 'UNKNOWN' },
    externalProductId: { type: String, default: null, index: true },
    verifiedAt: { type: Date, default: null },
    imageSourceProvider: { type: String, default: null },
    imageSourceProductId: { type: String, default: null },
    sku: { type: String, default: null, index: true },
    slug: { type: String, default: null, index: true },
    specs: { type: Map, of: String, default: {} },
    tags: [{ type: String, trim: true }],
  },
  { timestamps: true }
);

export const Product = mongoose.model('Product', productSchema);
