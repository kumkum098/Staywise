import { Response, NextFunction } from 'express';
import { Property } from '../models/Property.js';
import { Room } from '../models/Room.js';
import { Inquiry } from '../models/Inquiry.js';
import { Visit } from '../models/Visit.js';
import { AuthRequest } from '../middleware/auth.js';

export const getOwnerStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const properties = await Property.find({ owner: req.user._id });
    const propertyIds = properties.map((p) => p._id);

    const rooms = await Room.find({ property: { $in: propertyIds } });
    const totalRooms = rooms.reduce((sum, r) => sum + r.totalUnits, 0);
    const occupiedRooms = rooms.reduce((sum, r) => sum + r.occupiedUnits, 0);
    const availableRooms = Math.max(0, totalRooms - occupiedRooms);
    const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

    const inquiries = await Inquiry.find({ property: { $in: propertyIds } }).select('property status');
    const visits = await Visit.find({ property: { $in: propertyIds } }).select('property status');

    const newInquiries = inquiries.filter((i) => ['new', 'contacted'].includes(i.status)).length;
    const pendingVisits = visits.filter((v) => v.status === 'pending').length;

    const propertiesList = properties.map((property) => {
      const propertyRooms = rooms.filter((r) => r.property.toString() === property._id.toString());
      const propertyInquiries = inquiries.filter((i) => i.property.toString() === property._id.toString());
      const propertyVisits = visits.filter((v) => v.property.toString() === property._id.toString());

      return {
        ...property.toObject(),
        totalRoomsCount: propertyRooms.length,
        availableRoomsCount: propertyRooms.filter((r) => r.available).length,
        pendingInquiriesCount: propertyInquiries.filter((i) => ['new', 'contacted'].includes(i.status)).length,
        pendingVisitsCount: propertyVisits.filter((v) => v.status === 'pending').length,
      };
    });

    return res.status(200).json({
      success: true,
      data: {
        totalProperties: properties.length,
        totalRooms,
        occupiedRooms,
        availableRooms,
        occupancyRate,
        newInquiries,
        pendingVisits,
        propertiesList,
      },
    });
  } catch (error) {
    next(error);
  }
};
