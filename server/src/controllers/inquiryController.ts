import { Response, NextFunction } from 'express';
import { Inquiry } from '../models/Inquiry.js';
import { Property } from '../models/Property.js';
import { AuthRequest } from '../middleware/auth.js';
import { inquiryCreateSchema } from '../validators/schemas.js';

export const createInquiry = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const validatedData = inquiryCreateSchema.parse(req.body);
    const property = await Property.findById(validatedData.propertyId);

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    const inquiry = await Inquiry.create({
      user: req.user._id,
      property: validatedData.propertyId,
      message: validatedData.message,
      phone: validatedData.phone || req.user.phone,
      email: validatedData.email || req.user.email,
      status: 'new',
    });

    return res.status(201).json({
      success: true,
      message: 'Inquiry sent successfully to property owner.',
      data: { inquiry },
    });
  } catch (error) {
    next(error);
  }
};

export const getInquiries = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    let inquiries;

    if (req.user.role === 'owner') {
      const ownerProperties = await Property.find({ owner: req.user._id }).select('_id');
      const propertyIds = ownerProperties.map((p) => p._id);
      inquiries = await Inquiry.find({ property: { $in: propertyIds } })
        .populate('user', 'name email phone')
        .populate('property', 'name location images')
        .sort({ createdAt: -1 });
    } else {
      inquiries = await Inquiry.find({ user: req.user._id })
        .populate('property', 'name location images pricing')
        .sort({ createdAt: -1 });
    }

    return res.status(200).json({
      success: true,
      data: { inquiries },
    });
  } catch (error) {
    next(error);
  }
};

export const updateInquiryStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const { id } = req.params;
    const { status } = req.body;

    if (!['new', 'contacted', 'scheduled', 'closed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value.' });
    }

    const inquiry = await Inquiry.findById(id).populate<{ property: { owner: any } }>('property', 'owner');

    if (!inquiry) {
      return res.status(404).json({ success: false, message: 'Inquiry not found' });
    }

    if (req.user.role !== 'admin' && inquiry.property.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized to update this inquiry.' });
    }

    inquiry.status = status;
    await inquiry.save();

    return res.status(200).json({
      success: true,
      message: 'Inquiry status updated.',
      data: { inquiry },
    });
  } catch (error) {
    next(error);
  }
};
