import { Router } from 'express';
import { Wishlist } from '../models/Wishlist.model.js';
import { MarketplaceProduct } from '../models/MarketplaceProduct.model.js';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();

// GET /api/wishlist
router.get('/', authenticate, async (req, res, next) => {
  try {
    const items = await Wishlist.find({ user: req.user._id }).populate('product');
    
    // Enrich with minPrice and list count
    const enrichedItems = await Promise.all(
      items.map(async (item) => {
        if (!item.product) return null;
        
        const listings = await MarketplaceProduct.find({ product: item.product._id });
        const pricedListings = listings.filter((l) => l.currentPrice > 0 && l.isAvailable);
        const prices = pricedListings.map((l) => l.currentPrice);
        const minPrice = prices.length > 0 ? Math.min(...prices) : null;
        const maxPrice = pricedListings.map((l) => l.originalPrice).filter(Boolean);
        const mrp = maxPrice.length > 0 ? Math.max(...maxPrice) : null;

        return {
          _id: item._id,
          product: {
            ...item.product.toJSON(),
            minPrice,
            mrp,
            listingsCount: pricedListings.length,
          },
          createdAt: item.createdAt,
        };
      })
    );

    res.status(200).json({
      success: true,
      data: enrichedItems.filter(Boolean),
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/wishlist
router.post('/', authenticate, async (req, res, next) => {
  try {
    const { productId } = req.body;
    if (!productId) {
      return res.status(400).json({
        success: false,
        error: { code: 'BAD_REQUEST', message: 'productId is required' },
      });
    }

    let item = await Wishlist.findOne({ user: req.user._id, product: productId });
    if (!item) {
      item = await Wishlist.create({ user: req.user._id, product: productId });
    }

    res.status(201).json({
      success: true,
      data: item,
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/wishlist/:productId
router.delete('/:productId', authenticate, async (req, res, next) => {
  try {
    const { productId } = req.params;
    await Wishlist.deleteOne({ user: req.user._id, product: productId });
    
    res.status(200).json({
      success: true,
      message: 'Product removed from wishlist',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
