import { Router } from 'express';
import { Product } from '../models/Product.model.js';
import { Marketplace } from '../models/Marketplace.model.js';
import { MarketplaceProduct } from '../models/MarketplaceProduct.model.js';
import { PriceAlert } from '../models/PriceAlert.model.js';
import { User } from '../models/User.model.js';
import { SyncJob } from '../models/SyncJob.model.js';
import { SyncError } from '../models/SyncError.model.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { triggerPriceSyncJob } from '../jobs/syncQueue.js';

const router = Router();

// Secure all admin routes with authentication and ADMIN role check
router.use(authenticate, authorize('ADMIN'));

// GET /api/admin/overview
router.get('/overview', async (req, res, next) => {
  try {
    const totalProducts = await Product.countDocuments();
    const totalRetailers = await Marketplace.countDocuments();
    const totalOffers = await MarketplaceProduct.countDocuments();
    const activeUsers = await User.countDocuments({ role: 'USER' });
    const priceAlerts = await PriceAlert.countDocuments({ isActive: true });
    
    // Updated today
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const updatedToday = await MarketplaceProduct.countDocuments({
      lastUpdated: { $gte: startOfToday },
    });

    const failedIngestionJobs = await SyncJob.countDocuments({ status: 'failed' });

    res.status(200).json({
      success: true,
      data: {
        totalProducts,
        totalRetailers,
        totalOffers,
        activeUsers,
        priceAlerts,
        updatedToday,
        failedIngestionJobs,
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/admin/retailers
router.get('/retailers', async (req, res, next) => {
  try {
    const retailers = await Marketplace.find({});
    res.status(200).json({
      success: true,
      data: retailers,
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/admin/retailers/:id
router.patch('/retailers/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isActive, name, baseUrl, logoUrl } = req.body;
    
    const retailer = await Marketplace.findById(id);
    if (!retailer) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Retailer not found' },
      });
    }

    if (isActive !== undefined) retailer.isActive = isActive;
    if (name) retailer.name = name;
    if (baseUrl) retailer.baseUrl = baseUrl;
    if (logoUrl) retailer.logoUrl = logoUrl;

    await retailer.save();

    res.status(200).json({
      success: true,
      data: retailer,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/admin/data-quality
router.get('/data-quality', async (req, res, next) => {
  try {
    // 1. Unmatched products (no offers)
    const products = await Product.find({});
    const unmatched = [];
    for (const p of products) {
      const count = await MarketplaceProduct.countDocuments({ product: p._id });
      if (count === 0) unmatched.push(p);
    }

    // 2. Duplicate products (same brand & name check)
    const duplicates = await Product.aggregate([
      {
        $group: {
          _id: { name: { $toLower: '$name' }, brand: { $toLower: '$brand' } },
          count: { $sum: 1 },
          ids: { $push: '$_id' },
        },
      },
      { $match: { count: { $gt: 1 } } },
    ]);

    // 3. Missing images
    const missingImages = await Product.find({
      $or: [{ image: null }, { image: '' }],
    });

    // 4. Missing specifications
    const missingSpecs = await Product.find({
      $or: [{ specs: null }, { specs: {} }],
    });

    // 5. Stale prices (older than 24 hours)
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const stalePrices = await MarketplaceProduct.find({
      lastUpdated: { $lt: dayAgo },
    }).populate('product marketplace');

    res.status(200).json({
      success: true,
      data: {
        unmatchedCount: unmatched.length,
        unmatched: unmatched.slice(0, 10),
        duplicatesCount: duplicates.length,
        duplicates: duplicates.slice(0, 10),
        missingImagesCount: missingImages.length,
        missingImages: missingImages.slice(0, 10),
        missingSpecsCount: missingSpecs.length,
        missingSpecs: missingSpecs.slice(0, 10),
        stalePricesCount: stalePrices.length,
        stalePrices: stalePrices.slice(0, 10),
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/admin/jobs
router.get('/jobs', async (req, res, next) => {
  try {
    const jobs = await SyncJob.find({}).sort({ startTime: -1 }).limit(20);
    const errors = await SyncError.find({}).sort({ timestamp: -1 }).limit(20);
    res.status(200).json({
      success: true,
      data: { jobs, errors },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/admin/sync
router.post('/sync', async (req, res, next) => {
  try {
    const result = await triggerPriceSyncJob();
    res.status(202).json({
      success: true,
      message: result.queued
        ? 'Synchronization job successfully queued on background worker.'
        : 'Synchronization job triggered in local in-process fallback mode.',
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/admin/products
router.post('/products', async (req, res, next) => {
  try {
    const { name, brand, description, category, image, specs, tags } = req.body;
    
    if (!name || !brand || !category) {
      return res.status(400).json({
        success: false,
        error: { code: 'BAD_REQUEST', message: 'name, brand, and category are required' },
      });
    }

    const newProd = await Product.create({
      name,
      brand,
      description,
      category,
      image,
      specs,
      tags,
    });

    res.status(201).json({
      success: true,
      data: newProd,
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/admin/products/:id
router.patch('/products/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateFields = req.body;

    const prod = await Product.findByIdAndUpdate(id, updateFields, { new: true });
    if (!prod) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Product not found' },
      });
    }

    res.status(200).json({
      success: true,
      data: prod,
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/admin/products/:id
router.delete('/products/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const prod = await Product.findById(id);
    if (!prod) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Product not found' },
      });
    }

    // Delete associated offers & history
    const offers = await MarketplaceProduct.find({ product: id });
    const offerIds = offers.map((o) => o._id);
    
    await PriceHistory.deleteMany({ marketplaceProduct: { $in: offerIds } });
    await MarketplaceProduct.deleteMany({ product: id });
    await prod.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Product and associated marketplace listings deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
