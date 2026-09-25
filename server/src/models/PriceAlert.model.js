import mongoose from 'mongoose';

const { Schema } = mongoose;

const priceAlertSchema = new Schema(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    targetPrice: { type: Number, required: true },
    email: { type: String, required: true, trim: true },
    isActive: { type: Boolean, default: true },
    isTriggered: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const PriceAlert = mongoose.model('PriceAlert', priceAlertSchema);
