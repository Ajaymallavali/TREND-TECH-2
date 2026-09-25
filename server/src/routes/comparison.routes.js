import { Router } from 'express';
import { Comparison } from '../models/Comparison.model.js';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();

// GET /api/comparisons
router.get('/', authenticate, async (req, res, next) => {
  try {
    const list = await Comparison.find({ user: req.user._id }).populate({
      path: 'products',
      model: 'Product',
    });
    
    res.status(200).json({
      success: true,
      data: list,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/comparisons
router.post('/', authenticate, async (req, res, next) => {
  try {
    const { name, productIds } = req.body;
    if (!productIds || !Array.isArray(productIds) || productIds.length < 2) {
      return res.status(400).json({
        success: false,
        error: { code: 'BAD_REQUEST', message: 'At least 2 productIds are required to save a comparison' },
      });
    }

    const comparison = await Comparison.create({
      user: req.user._id,
      name: name || 'Saved Comparison',
      products: productIds,
    });

    const populated = await comparison.populate('products');

    res.status(201).json({
      success: true,
      data: populated,
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/comparisons/:id
router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const comparison = await Comparison.findOne({ _id: id, user: req.user._id });
    
    if (!comparison) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Comparison not found or unauthorized' },
      });
    }

    await comparison.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Comparison deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
