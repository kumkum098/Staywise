import { Router } from 'express';
import { createInquiry, getInquiries, updateInquiryStatus } from '../controllers/inquiryController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.post('/', authenticate, createInquiry);
router.get('/', authenticate, getInquiries);
router.patch('/:id/status', authenticate, authorize('owner', 'admin'), updateInquiryStatus);

export default router;
