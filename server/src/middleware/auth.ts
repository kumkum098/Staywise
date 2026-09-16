import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User.js';

export interface AuthRequest extends Request {
  user?: IUser;
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET || 'staywise_super_secret_jwt_key_2026_dev';

    const decoded = jwt.verify(token, secret) as { id: string };
    const user = await User.findById(decoded.id).select('-passwordHash');

    if (!user) {
      return res.status(401).json({ success: false, message: 'User token invalid or user deleted.' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
};

export const authenticateOptional = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET || 'staywise_super_secret_jwt_key_2026_dev';

    const decoded = jwt.verify(token, secret) as { id: string };
    const user = await User.findById(decoded.id).select('-passwordHash');

    if (user) {
      req.user = user;
    }
    next();
  } catch (error) {
    next();
  }
};

export const authorize = (...roles: Array<'tenant' | 'owner' | 'admin'>) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access forbidden for role '${req.user.role}'. Required: ${roles.join(', ')}`,
      });
    }

    next();
  };
};
