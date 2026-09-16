import { Router } from 'express';
import { register, login, getMe, updatePreferences, updateProfile } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticate, getMe);
router.patch('/preferences', authenticate, updatePreferences);
router.patch('/profile', authenticate, updateProfile);

export default router;
