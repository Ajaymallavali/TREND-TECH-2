import mongoose from 'mongoose';

const { Schema } = mongoose;

const wishlistSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
  },
  { timestamps: true }
);

// Unique user + product constraint
wishlistSchema.index({ user: 1, product: 1 }, { unique: true });

export const Wishlist = mongoose.model('Wishlist', wishlistSchema);
