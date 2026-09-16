import { Router } from 'express';
import { scheduleVisit, getVisits, updateVisitStatus } from '../controllers/visitController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.post('/', authenticate, scheduleVisit);
router.get('/', authenticate, getVisits);
router.patch('/:id/status', authenticate, authorize('owner', 'admin'), updateVisitStatus);

export default router;
