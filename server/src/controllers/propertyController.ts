import { Request, Response, NextFunction } from 'express';
import { Property } from '../models/Property.js';
import { Room } from '../models/Room.js';
import { AuthRequest } from '../middleware/auth.js';
import { propertyCreateSchema } from '../validators/schemas.js';

export const getProperties = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      search,
      area,
      city,
      propertyType,
      roomType,
      gender,
      minRent,
      maxRent,
      amenities,
      wifi,
      ac,
      food,
      laundry,
      parking,
      isVerified,
      sort = 'recommended',
      page = 1,
      limit = 20,
    } = req.query;

    const filterQuery: any = {};

    if (search && typeof search === 'string' && search.trim()) {
      filterQuery.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
        { 'location.area': { $regex: search.trim(), $options: 'i' } },
        { 'location.address': { $regex: search.trim(), $options: 'i' } },
      ];
    }

    if (area && typeof area === 'string' && area !== 'all') {
      filterQuery['location.area'] = { $regex: area, $options: 'i' };
    }

    if (city && typeof city === 'string') {
      filterQuery['location.city'] = { $regex: city, $options: 'i' };
    }

    if (propertyType && typeof propertyType === 'string' && propertyType !== 'all') {
      filterQuery.propertyType = propertyType;
    }

    if (gender && typeof gender === 'string' && gender !== 'all') {
      filterQuery.gender = { $in: [gender, 'unisex'] };
    }

    if (minRent || maxRent) {
      filterQuery['pricing.startingRent'] = {};
      if (minRent) filterQuery['pricing.startingRent'].$gte = Number(minRent);
      if (maxRent) filterQuery['pricing.startingRent'].$lte = Number(maxRent);
    }

    if (isVerified === 'true') {
      filterQuery['verification.isVerified'] = true;
    }

    // Amenities filters
    const requiredAmenities: string[] = [];
    if (amenities && typeof amenities === 'string') {
      requiredAmenities.push(...amenities.split(',').map((a) => a.trim()));
    }
    if (wifi === 'true') requiredAmenities.push('Wi-Fi');
    if (ac === 'true') requiredAmenities.push('AC');
    if (food === 'true') requiredAmenities.push('Food');
    if (laundry === 'true') requiredAmenities.push('Laundry');
    if (parking === 'true') requiredAmenities.push('Parking');

    if (requiredAmenities.length > 0) {
      filterQuery.amenities = { $all: requiredAmenities };
    }

    // Filter by roomType if specified
    if (roomType && typeof roomType === 'string' && roomType !== 'all') {
      const matchingRooms = await Room.find({ type: roomType, available: true }).distinct('property');
      filterQuery._id = { $in: matchingRooms };
    }

    // Sorting
    let sortOptions: any = { isFeatured: -1, rating: -1, createdAt: -1 };
    if (sort === 'price_asc') {
      sortOptions = { 'pricing.startingRent': 1 };
    } else if (sort === 'price_desc') {
      sortOptions = { 'pricing.startingRent': -1 };
    } else if (sort === 'rating') {
      sortOptions = { rating: -1 };
    } else if (sort === 'newest') {
      sortOptions = { createdAt: -1 };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const totalCount = await Property.countDocuments(filterQuery);

    const properties = await Property.find(filterQuery)
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit))
      .populate('owner', 'name email phone');

    // Attach minimum room price and available room count to each property response
    const propertiesWithRooms = await Promise.all(
      properties.map(async (prop) => {
        const rooms = await Room.find({ property: prop._id });
        const obj = prop.toObject();

        const totalEstimatedMonthly =
          obj.pricing.startingRent +
          (obj.pricing.foodCost || 0) +
          (obj.pricing.electricityCost || 0) +
          (obj.pricing.maintenanceCost || 0) +
          (obj.pricing.wifiCost || 0);

        return {
          ...obj,
          totalEstimatedMonthly,
          roomOptions: rooms,
          availableRoomsCount: rooms.filter((r) => r.available).length,
        };
      })
    );

    return res.status(200).json({
      success: true,
      data: {
        properties: propertiesWithRooms,
        pagination: {
          total: totalCount,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(totalCount / Number(limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getPropertyById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Can be MongoDB ObjectId or slug string
    const isObjectId = id.match(/^[0-9a-fA-F]{24}$/);
    const query = isObjectId ? { _id: id } : { slug: id.toLowerCase() };

    const property = await Property.findOne(query).populate('owner', 'name email phone');

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found.' });
    }

    const rooms = await Room.find({ property: property._id });
    const obj = property.toObject();

    const totalEstimatedMonthly =
      obj.pricing.startingRent +
      (obj.pricing.foodCost || 0) +
      (obj.pricing.electricityCost || 0) +
      (obj.pricing.maintenanceCost || 0) +
      (obj.pricing.wifiCost || 0);

    return res.status(200).json({
      success: true,
      data: {
        property: {
          ...obj,
          totalEstimatedMonthly,
          rooms,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createProperty = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const validatedData = propertyCreateSchema.parse(req.body);

    const baseSlug = validatedData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const slug = `${baseSlug}-${Date.now().toString().slice(-4)}`;

    const property = await Property.create({
      ...validatedData,
      owner: req.user._id,
      slug,
      livingScore: {
        cleanliness: 8.5,
        internet: 8.5,
        food: 8.0,
        quietness: 8.2,
        location: 9.0,
        privacy: 8.0,
        safety: 9.0,
        overall: 8.5,
      },
      verification: {
        isVerified: req.user.role === 'admin',
        verifiedDate: req.user.role === 'admin' ? new Date() : undefined,
      },
      rating: 4.5,
      reviewCount: 0,
    });

    return res.status(201).json({
      success: true,
      message: 'Property created successfully.',
      data: { property },
    });
  } catch (error) {
    next(error);
  }
};

export const updateProperty = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const { id } = req.params;
    const property = await Property.findById(id);

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    if (property.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to edit this property.' });
    }

    const updatedProperty = await Property.findByIdAndUpdate(id, { $set: req.body }, { new: true });

    return res.status(200).json({
      success: true,
      message: 'Property updated successfully.',
      data: { property: updatedProperty },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProperty = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const { id } = req.params;
    const property = await Property.findById(id);

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    if (property.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to delete this property.' });
    }

    await Property.findByIdAndDelete(id);
    await Room.deleteMany({ property: id });

    return res.status(200).json({
      success: true,
      message: 'Property deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};
