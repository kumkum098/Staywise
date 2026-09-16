import { Router } from 'express';
import { getRoomsByProperty, createRoom, updateRoom, deleteRoom } from '../controllers/roomController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router({ mergeParams: true });

router.get('/properties/:propertyId/rooms', getRoomsByProperty);
router.post('/properties/:propertyId/rooms', authenticate, authorize('owner', 'admin'), createRoom);
router.patch('/rooms/:id', authenticate, authorize('owner', 'admin'), updateRoom);
router.delete('/rooms/:id', authenticate, authorize('owner', 'admin'), deleteRoom);

export default router;
