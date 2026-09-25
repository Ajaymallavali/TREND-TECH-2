import { Router } from 'express';
import { performAISearch } from '../services/aiSearch.service.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({
        success: false,
        error: { code: 'BAD_REQUEST', message: 'Query parameter q is required' },
      });
    }

    const data = await performAISearch(q);
    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
