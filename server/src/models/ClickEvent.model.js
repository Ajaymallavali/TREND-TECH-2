import mongoose from 'mongoose';

const { Schema } = mongoose;

const clickEventSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
      default: null,
    },
    session: {
      type: String,
      trim: true,
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    marketplaceProduct: {
      type: Schema.Types.ObjectId,
      ref: 'MarketplaceProduct',
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true }
);

export const ClickEvent = mongoose.model('ClickEvent', clickEventSchema);
