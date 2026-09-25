import { Router } from 'express';
import { MarketplaceProduct } from '../models/MarketplaceProduct.model.js';
import { ClickEvent } from '../models/ClickEvent.model.js';
import { optionalAuthenticate } from '../middleware/authenticate.js';

const router = Router();

router.get('/:offerId', optionalAuthenticate, async (req, res, next) => {
  try {
    const { offerId } = req.params;
    const offer = await MarketplaceProduct.findById(offerId);
    
    if (!offer) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Offer listing not found' },
      });
    }

    // Log outbound click event
    await ClickEvent.create({
      user: req.user ? req.user._id : null,
      session: req.cookies?.sid || 'guest-session',
      product: offer.product,
      marketplaceProduct: offer._id,
      timestamp: new Date(),
    });

    // 302 Redirect to external merchant landing page
    res.redirect(offer.url);
  } catch (error) {
    next(error);
  }
});

export default router;
