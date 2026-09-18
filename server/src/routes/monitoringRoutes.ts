import { Router } from 'express';
import { getMonitoringHistory, getMonitoringStatus } from '../controllers/monitoringController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.get('/status', authenticate, authorize('admin'), getMonitoringStatus);
router.get('/history', authenticate, authorize('admin'), getMonitoringHistory);

export default router;