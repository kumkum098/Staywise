import { Router } from 'express';
import { getReviewsByProperty, addReview } from '../controllers/reviewController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/properties/:propertyId/reviews', getReviewsByProperty);
router.post('/properties/:propertyId/reviews', authenticate, addReview);

export default router;
