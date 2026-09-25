import mongoose from 'mongoose';

const { Schema } = mongoose;

const comparisonSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      trim: true,
      default: 'My Comparison',
    },
    products: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
      },
    ],
  },
  { timestamps: true }
);

export const Comparison = mongoose.model('Comparison', comparisonSchema);
