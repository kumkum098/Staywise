import { Response, NextFunction } from 'express';
import { Favorite } from '../models/Favorite.js';
import { Property } from '../models/Property.js';
import { AuthRequest } from '../middleware/auth.js';

export const getFavorites = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const favorites = await Favorite.find({ user: req.user._id }).populate({
      path: 'property',
      populate: { path: 'owner', select: 'name email phone' },
    });

    const validProperties = favorites
      .filter((f) => f.property !== null)
      .map((f) => f.property);

    return res.status(200).json({
      success: true,
      data: { favorites: validProperties },
    });
  } catch (error) {
    next(error);
  }
};

export const toggleFavorite = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const { propertyId } = req.params;
    const property = await Property.findById(propertyId);

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    const existingFav = await Favorite.findOne({ user: req.user._id, property: propertyId });

    if (existingFav) {
      await Favorite.findByIdAndDelete(existingFav._id);
      return res.status(200).json({
        success: true,
        message: 'Property removed from saved places.',
        data: { isSaved: false, propertyId },
      });
    } else {
      await Favorite.create({ user: req.user._id, property: propertyId });
      return res.status(201).json({
        success: true,
        message: 'Property saved successfully.',
        data: { isSaved: true, propertyId },
      });
    }
  } catch (error) {
    next(error);
  }
};
