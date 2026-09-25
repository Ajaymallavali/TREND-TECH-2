import mongoose from 'mongoose';

const { Schema } = mongoose;

const syncJobSchema = new Schema(
  {
    status: {
      type: String,
      enum: ['running', 'completed', 'failed'],
      default: 'running',
      index: true,
    },
    startTime: {
      type: Date,
      default: Date.now,
    },
    endTime: {
      type: Date,
    },
    productsUpdated: {
      type: Number,
      default: 0,
    },
    offersUpdated: {
      type: Number,
      default: 0,
    },
    failedCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export const SyncJob = mongoose.model('SyncJob', syncJobSchema);
