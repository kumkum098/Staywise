import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['tenant', 'owner', 'admin']).optional().default('tenant'),
  phone: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const userPreferencesSchema = z.object({
  minBudget: z.number().optional(),
  maxBudget: z.number().optional(),
  quietness: z.number().min(1).max(10).optional(),
  privacy: z.number().min(1).max(10).optional(),
  foodRequired: z.boolean().optional(),
  acRequired: z.boolean().optional(),
  roomType: z.enum(['single', 'double', 'triple', 'any']).optional(),
  preferredArea: z.string().optional(),
  maxDistanceKm: z.number().optional(),
});

export const propertyCreateSchema = z.object({
  name: z.string().min(3, 'Property name must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  propertyType: z.enum(['pg', 'hostel', 'coliving', 'apartment']),
  gender: z.enum(['male', 'female', 'unisex']),
  location: z.object({
    address: z.string().min(3, 'Address is required'),
    area: z.string().min(2, 'Area is required'),
    city: z.string().default('Jaipur'),
    pincode: z.string().default('302017'),
    lat: z.number().optional().default(26.85),
    lng: z.number().optional().default(75.80),
    nearby: z
      .array(
        z.object({
          name: z.string(),
          distanceKm: z.number(),
          travelTimeMins: z.number(),
          category: z.enum(['college', 'metro', 'grocery', 'gym', 'hospital', 'restaurant']),
        })
      )
      .optional()
      .default([]),
  }),
  images: z.array(z.string()).min(1, 'At least one image is required'),
  amenities: z.array(z.string()).optional().default([]),
  pricing: z.object({
    startingRent: z.number().positive('Starting rent must be greater than 0'),
    deposit: z.number().nonnegative(),
    foodCost: z.number().nonnegative().optional().default(0),
    electricityCost: z.number().nonnegative().optional().default(0),
    maintenanceCost: z.number().nonnegative().optional().default(0),
    wifiCost: z.number().nonnegative().optional().default(0),
  }),
  houseRules: z
    .object({
      curfew: z.string().optional().default('10:30 PM'),
      visitorsAllowed: z.boolean().optional().default(true),
      visitorPolicy: z.string().optional().default('Visitors allowed in common areas until 8 PM'),
      smokingAllowed: z.boolean().optional().default(false),
      alcoholAllowed: z.boolean().optional().default(false),
      petsAllowed: z.boolean().optional().default(false),
      noticePeriodDays: z.number().optional().default(30),
    })
    .optional(),
  beforeYouBook: z.array(z.string()).optional().default([]),
});

export const roomCreateSchema = z.object({
  name: z.string().min(2, 'Room name is required'),
  type: z.enum(['single', 'double', 'triple', 'quad']),
  capacity: z.number().int().positive(),
  rent: z.number().positive('Rent must be positive'),
  available: z.boolean().optional().default(true),
  totalUnits: z.number().int().positive().optional().default(1),
  occupiedUnits: z.number().int().nonnegative().optional().default(0),
  features: z.array(z.string()).optional().default([]),
});

export const reviewCreateSchema = z.object({
  cleanliness: z.number().min(1).max(10),
  internet: z.number().min(1).max(10),
  food: z.number().min(1).max(10),
  noise: z.number().min(1).max(10),
  location: z.number().min(1).max(10),
  privacy: z.number().min(1).max(10),
  safety: z.number().min(1).max(10),
  comment: z.string().min(5, 'Review comment must be at least 5 characters'),
});

export const inquiryCreateSchema = z.object({
  propertyId: z.string().min(1, 'Property ID is required'),
  message: z.string().min(5, 'Message must be at least 5 characters'),
  phone: z.string().optional(),
  email: z.string().email().optional(),
});

export const visitCreateSchema = z.object({
  propertyId: z.string().min(1, 'Property ID is required'),
  date: z.string().min(1, 'Visit date is required'),
  time: z.string().min(1, 'Visit time slot is required'),
  notes: z.string().optional(),
});
