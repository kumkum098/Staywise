import { Request, Response, NextFunction } from 'express';
import { Review } from '../models/Review.js';
import { Property } from '../models/Property.js';
import { AuthRequest } from '../middleware/auth.js';
import { reviewCreateSchema } from '../validators/schemas.js';

export const getReviewsByProperty = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { propertyId } = req.params;
    const reviews = await Review.find({ property: propertyId })
      .populate('user', 'name role')
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, data: { reviews } });
  } catch (error) {
    next(error);
  }
};

export const addReview = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const { propertyId } = req.params;
    const property = await Property.findById(propertyId);

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    const validatedData = reviewCreateSchema.parse(req.body);

    const overall = Number(
      (
        (validatedData.cleanliness +
          validatedData.internet +
          validatedData.food +
          validatedData.noise +
          validatedData.location +
          validatedData.privacy +
          validatedData.safety) /
        7
      ).toFixed(1)
    );

    const review = await Review.create({
      ...validatedData,
      overall,
      property: propertyId,
      user: req.user._id,
      userName: req.user.name,
      userRole: req.user.role === 'tenant' ? 'Resident Student' : 'Verified Resident',
    });

    // Update Property aggregated ratings and living score
    const allReviews = await Review.find({ property: propertyId });
    const count = allReviews.length;
    const avgOverall = Number((allReviews.reduce((sum, r) => sum + r.overall, 0) / count).toFixed(1));

    const avgClean = Number((allReviews.reduce((sum, r) => sum + r.cleanliness, 0) / count).toFixed(1));
    const avgNet = Number((allReviews.reduce((sum, r) => sum + r.internet, 0) / count).toFixed(1));
    const avgFood = Number((allReviews.reduce((sum, r) => sum + r.food, 0) / count).toFixed(1));
    const avgNoise = Number((allReviews.reduce((sum, r) => sum + r.noise, 0) / count).toFixed(1));
    const avgLoc = Number((allReviews.reduce((sum, r) => sum + r.location, 0) / count).toFixed(1));
    const avgPriv = Number((allReviews.reduce((sum, r) => sum + r.privacy, 0) / count).toFixed(1));
    const avgSafe = Number((allReviews.reduce((sum, r) => sum + r.safety, 0) / count).toFixed(1));

    await Property.findByIdAndUpdate(propertyId, {
      $set: {
        rating: avgOverall,
        reviewCount: count,
        livingScore: {
          cleanliness: avgClean,
          internet: avgNet,
          food: avgFood,
          quietness: avgNoise,
          location: avgLoc,
          privacy: avgPriv,
          safety: avgSafe,
          overall: avgOverall,
        },
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Review submitted successfully.',
      data: { review },
    });
  } catch (error) {
    next(error);
  }
};
