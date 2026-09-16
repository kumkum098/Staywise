import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { AuthRequest } from '../middleware/auth.js';
import { registerSchema, loginSchema, userPreferencesSchema } from '../validators/schemas.js';

const generateToken = (userId: string): string => {
  const secret = process.env.JWT_SECRET || 'staywise_super_secret_jwt_key_2026_dev';
  return jwt.sign({ id: userId }, secret, { expiresIn: '7d' });
};

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = registerSchema.parse(req.body);

    const existingUser = await User.findOne({ email: validatedData.email });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(validatedData.password, salt);

    const user = await User.create({
      name: validatedData.name,
      email: validatedData.email,
      passwordHash,
      role: validatedData.role || 'tenant',
      phone: validatedData.phone || '',
      preferences: {
        minBudget: 5000,
        maxBudget: 15000,
        quietness: 7,
        privacy: 7,
        foodRequired: false,
        acRequired: true,
        roomType: 'any',
        preferredArea: 'Malviya Nagar',
        maxDistanceKm: 5,
      },
    });

    const token = generateToken(user._id.toString());

    return res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          preferences: user.preferences,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = loginSchema.parse(req.body);

    const user = await User.findOne({ email: validatedData.email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(validatedData.password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = generateToken(user._id.toString());

    return res.status(200).json({
      success: true,
      message: 'Logged in successfully.',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          preferences: user.preferences,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    return res.status(200).json({
      success: true,
      data: {
        user: {
          id: req.user._id,
          name: req.user.name,
          email: req.user.email,
          role: req.user.role,
          phone: req.user.phone,
          preferences: req.user.preferences,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updatePreferences = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const validatedPreferences = userPreferencesSchema.parse(req.body);

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { preferences: { ...req.user.preferences, ...validatedPreferences } } },
      { new: true }
    ).select('-passwordHash');

    return res.status(200).json({
      success: true,
      message: 'Preferences updated successfully.',
      data: {
        preferences: updatedUser?.preferences,
      },
    });
  } catch (error) {
    next(error);
  }
};
