import { Router } from 'express';
import {
  getProducts,
  getProductDetails,
  getPriceHistory,
  getBestDeals,
  createPriceAlert,
  executeAIWorkflow,
} from '../controllers/product.controller.js';

const router = Router();

router.get('/', getProducts);
router.get('/deals', getBestDeals);
router.post('/analysis', executeAIWorkflow);
router.get('/:id', getProductDetails);
router.get('/:id/history', getPriceHistory);
router.post('/:id/alerts', createPriceAlert);

export default router;
