import { Response, NextFunction } from 'express';
import { Visit } from '../models/Visit.js';
import { Property } from '../models/Property.js';
import { AuthRequest } from '../middleware/auth.js';
import { visitCreateSchema } from '../validators/schemas.js';

export const scheduleVisit = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const validatedData = visitCreateSchema.parse(req.body);
    const property = await Property.findById(validatedData.propertyId);

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    const visit = await Visit.create({
      user: req.user._id,
      property: validatedData.propertyId,
      date: validatedData.date,
      time: validatedData.time,
      notes: validatedData.notes || '',
      status: 'pending',
    });

    return res.status(201).json({
      success: true,
      message: 'Visit request submitted successfully.',
      data: { visit },
    });
  } catch (error) {
    next(error);
  }
};

export const getVisits = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    let visits;

    if (req.user.role === 'owner') {
      const ownerProperties = await Property.find({ owner: req.user._id }).select('_id');
      const propertyIds = ownerProperties.map((p) => p._id);
      visits = await Visit.find({ property: { $in: propertyIds } })
        .populate('user', 'name email phone')
        .populate('property', 'name location images')
        .sort({ date: 1, time: 1 });
    } else {
      visits = await Visit.find({ user: req.user._id })
        .populate('property', 'name location images pricing')
        .sort({ date: 1, time: 1 });
    }

    return res.status(200).json({
      success: true,
      data: { visits },
    });
  } catch (error) {
    next(error);
  }
};

export const updateVisitStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid visit status.' });
    }

    const visit = await Visit.findById(id).populate<{ property: { owner: any } }>('property', 'owner');

    if (!visit) {
      return res.status(404).json({ success: false, message: 'Visit not found' });
    }

    if (req.user.role !== 'admin' && visit.property.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized to update this visit.' });
    }

    visit.status = status;
    await visit.save();

    return res.status(200).json({
      success: true,
      message: `Visit marked as ${status}.`,
      data: { visit },
    });
  } catch (error) {
    next(error);
  }
};
