import { Request, Response, NextFunction } from 'express';
import { Room } from '../models/Room.js';
import { Property } from '../models/Property.js';
import { AuthRequest } from '../middleware/auth.js';
import { roomCreateSchema } from '../validators/schemas.js';

export const getRoomsByProperty = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { propertyId } = req.params;
    const rooms = await Room.find({ property: propertyId });
    return res.status(200).json({ success: true, data: { rooms } });
  } catch (error) {
    next(error);
  }
};

export const createRoom = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const { propertyId } = req.params;
    const property = await Property.findById(propertyId);

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    if (property.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to add room to this property.' });
    }

    const validatedData = roomCreateSchema.parse(req.body);

    const room = await Room.create({
      ...validatedData,
      property: propertyId,
    });

    return res.status(201).json({ success: true, message: 'Room created successfully.', data: { room } });
  } catch (error) {
    next(error);
  }
};

export const updateRoom = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const { id } = req.params;
    const room = await Room.findById(id);

    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    const property = await Property.findById(room.property);
    if (property && property.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to edit this room.' });
    }

    const updatedRoom = await Room.findByIdAndUpdate(id, { $set: req.body }, { new: true });

    return res.status(200).json({ success: true, message: 'Room updated successfully.', data: { room: updatedRoom } });
  } catch (error) {
    next(error);
  }
};

export const deleteRoom = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const { id } = req.params;
    const room = await Room.findById(id);

    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    const property = await Property.findById(room.property);
    if (property && property.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to delete this room.' });
    }

    await Room.findByIdAndDelete(id);

    return res.status(200).json({ success: true, message: 'Room deleted successfully.' });
  } catch (error) {
    next(error);
  }
};
