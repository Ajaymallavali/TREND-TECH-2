import { Router } from 'express';
import { PriceAlert } from '../models/PriceAlert.model.js';
import { Product } from '../models/Product.model.js';
import { authenticate, optionalAuthenticate } from '../middleware/authenticate.js';

const router = Router();

// GET /api/price-alerts
router.get('/', authenticate, async (req, res, next) => {
  try {
    const alerts = await PriceAlert.find({ email: req.user.email }).populate('product');
    res.status(200).json({
      success: true,
      data: alerts,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/price-alerts
router.post('/', optionalAuthenticate, async (req, res, next) => {
  try {
    const { productId, targetPrice, email } = req.body;
    
    if (!productId || !targetPrice) {
      return res.status(400).json({
        success: false,
        error: { code: 'BAD_REQUEST', message: 'productId and targetPrice are required' },
      });
    }

    const alertEmail = req.user ? req.user.email : email;
    if (!alertEmail) {
      return res.status(400).json({
        success: false,
        error: { code: 'BAD_REQUEST', message: 'Email is required for guest alert tracking' },
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Product not found' },
      });
    }

    const alert = await PriceAlert.create({
      product: productId,
      targetPrice: parseFloat(targetPrice),
      email: alertEmail.toLowerCase(),
    });

    res.status(201).json({
      success: true,
      data: alert,
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/price-alerts/:id
router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const alert = await PriceAlert.findById(id);

    if (!alert) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Price alert not found' },
      });
    }

    // Verify ownership
    if (alert.email !== req.user.email && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'You are not authorized to delete this price alert' },
      });
    }

    await alert.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Price alert deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
