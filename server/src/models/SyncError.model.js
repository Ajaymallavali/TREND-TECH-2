import mongoose from 'mongoose';

const { Schema } = mongoose;

const syncErrorSchema = new Schema(
  {
    jobId: {
      type: Schema.Types.ObjectId,
      ref: 'SyncJob',
      required: true,
      index: true,
    },
    marketplace: {
      type: String,
      trim: true,
    },
    sku: {
      type: String,
      trim: true,
    },
    error: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export const SyncError = mongoose.model('SyncError', syncErrorSchema);
