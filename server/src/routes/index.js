import { Router } from 'express';
import authRoutes from './auth.routes.js';
import productRoutes from './product.routes.js';
import searchRoutes from './search.routes.js';
import wishlistRoutes from './wishlist.routes.js';
import priceAlertRoutes from './priceAlert.routes.js';
import comparisonRoutes from './comparison.routes.js';
import adminRoutes from './admin.routes.js';
import redirectRoutes from './redirect.routes.js';
import { Marketplace } from '../models/Marketplace.model.js';
import { getCategoryList } from '../utils/categoryMapper.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/search', searchRoutes);
router.use('/wishlist', wishlistRoutes);
router.use('/price-alerts', priceAlertRoutes);
router.use('/comparisons', comparisonRoutes);
router.use('/admin', adminRoutes);
router.use('/go', redirectRoutes);

// GET /api/categories
router.get('/categories', (req, res) => {
  res.status(200).json({
    success: true,
    data: getCategoryList(),
  });
});

// GET /api/retailers
router.get('/retailers', async (req, res, next) => {
  try {
    const retailers = await Marketplace.find({ isActive: true });
    res.status(200).json({
      success: true,
      data: retailers,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
