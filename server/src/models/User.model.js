import mongoose from 'mongoose';

const { Schema } = mongoose;

const notificationPreferencesSchema = new Schema(
  {
    email: { type: Boolean, default: true },
    inApp: { type: Boolean, default: true },
    priceDropAlerts: { type: Boolean, default: true },
    dealDigest: { type: Boolean, default: true },
  },
  { _id: false }
);

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    authProvider: { type: String, enum: ['LOCAL', 'GOOGLE'], default: 'LOCAL' },
    googleId: { type: String, sparse: true, unique: true },
    passwordHash: { 
      type: String, 
      required: function() { return this.authProvider === 'LOCAL'; },
      select: false 
    },
    avatar: { type: String, default: null },
    role: { type: String, enum: ['USER', 'ADMIN'], default: 'USER' },

    preferences: {
      currency: { type: String, default: 'INR' },
      country: { type: String, default: 'IN' },
    },
    notificationPreferences: { type: notificationPreferencesSchema, default: () => ({}) },

    // Refresh token rotation - store hashed current refresh token family
    refreshTokenHash: { type: String, select: false, default: null },
    refreshTokenExpiresAt: { type: Date, select: false, default: null },

    // Account lockout / throttling
    failedLoginAttempts: { type: Number, default: 0, select: false },
    lockUntil: { type: Date, default: null, select: false },

    // Password reset
    passwordResetTokenHash: { type: String, select: false, default: null },
    passwordResetExpiresAt: { type: Date, select: false, default: null },
  },
  { timestamps: true }
);

userSchema.virtual('isLocked').get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

userSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => {
    delete ret.passwordHash;
    delete ret.refreshTokenHash;
    delete ret.failedLoginAttempts;
    delete ret.lockUntil;
    delete ret.passwordResetTokenHash;
    delete ret.passwordResetExpiresAt;
    delete ret.__v;
    return ret;
  },
});

import { createFirestoreModel } from '../database/firestore/FirestoreAdapter.js';
const MongoUser = mongoose.model('User', userSchema);
export const User = process.env.DATABASE_PROVIDER === 'firestore' ? createFirestoreModel('users') : MongoUser;
