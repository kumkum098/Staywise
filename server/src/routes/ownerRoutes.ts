import { Router } from 'express';
import { getOwnerStats } from '../controllers/ownerController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.get('/stats', authenticate, authorize('owner', 'admin'), getOwnerStats);

export default router;
