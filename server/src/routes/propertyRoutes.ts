import { Router } from 'express';
import {
  getProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
} from '../controllers/propertyController.js';
import { authenticate, authenticateOptional, authorize } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticateOptional, getProperties);
router.get('/:id', getPropertyById);

router.post('/', authenticate, authorize('owner', 'admin'), createProperty);
router.patch('/:id', authenticate, authorize('owner', 'admin'), updateProperty);
router.delete('/:id', authenticate, authorize('owner', 'admin'), deleteProperty);

export default router;
