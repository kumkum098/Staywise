import mongoose, { Schema, Document, Types } from 'mongoose';

export interface INearbyPlace {
  name: string;
  distanceKm: number;
  travelTimeMins: number;
  category: 'college' | 'metro' | 'grocery' | 'gym' | 'hospital' | 'restaurant';
}

export interface ILivingScore {
  cleanliness: number;
  internet: number;
  food: number;
  quietness: number;
  location: number;
  privacy: number;
  safety: number;
  ownerResponsiveness: number;
  valueForMoney: number;
  overall: number;
}

export interface IPricingBreakdown {
  startingRent: number;
  deposit: number;
  foodCost: number;
  electricityCost: number;
  maintenanceCost: number;
  wifiCost: number;
}

export interface IHouseRules {
  curfew: string;
  visitorsAllowed: boolean;
  visitorPolicy: string;
  smokingAllowed: boolean;
  alcoholAllowed: boolean;
  petsAllowed: boolean;
  noticePeriodDays: number;
}

export interface IProperty extends Document {
  owner: Types.ObjectId;
  name: string;
  slug: string;
  description: string;
  propertyType: 'pg' | 'hostel' | 'coliving' | 'apartment';
  gender: 'male' | 'female' | 'unisex';
  location: {
    address: string;
    area: string;
    city: string;
    pincode: string;
    lat: number;
    lng: number;
    nearby: INearbyPlace[];
  };
  images: string[];
  amenities: string[];
  pricing: IPricingBreakdown;
  houseRules: IHouseRules;
  livingScore: ILivingScore;
  verification: {
    isVerified: boolean;
    verifiedDate?: Date;
  };
  beforeYouBook: string[];
  goodFor: string[];
  thingsToKnow: string[];
  rating: number;
  reviewCount: number;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NearbySchema = new Schema<INearbyPlace>(
  {
    name: { type: String, required: true },
    distanceKm: { type: Number, required: true },
    travelTimeMins: { type: Number, required: true },
    category: {
      type: String,
      enum: ['college', 'metro', 'grocery', 'gym', 'hospital', 'restaurant'],
      required: true,
    },
  },
  { _id: false }
);

const LivingScoreSchema = new Schema<ILivingScore>(
  {
    cleanliness: { type: Number, default: 8.0 },
    internet: { type: Number, default: 8.0 },
    food: { type: Number, default: 8.0 },
    quietness: { type: Number, default: 8.0 },
    location: { type: Number, default: 8.0 },
    privacy: { type: Number, default: 8.0 },
    safety: { type: Number, default: 8.0 },
    ownerResponsiveness: { type: Number, default: 8.0 },
    valueForMoney: { type: Number, default: 8.0 },
    overall: { type: Number, default: 8.0 },
  },
  { _id: false }
);

const PricingSchema = new Schema<IPricingBreakdown>(
  {
    startingRent: { type: Number, required: true },
    deposit: { type: Number, required: true },
    foodCost: { type: Number, default: 0 },
    electricityCost: { type: Number, default: 0 },
    maintenanceCost: { type: Number, default: 0 },
    wifiCost: { type: Number, default: 0 },
  },
  { _id: false }
);

const HouseRulesSchema = new Schema<IHouseRules>(
  {
    curfew: { type: String, default: '10:30 PM' },
    visitorsAllowed: { type: Boolean, default: true },
    visitorPolicy: { type: String, default: 'Visitors allowed until 8 PM in common areas' },
    smokingAllowed: { type: Boolean, default: false },
    alcoholAllowed: { type: Boolean, default: false },
    petsAllowed: { type: Boolean, default: false },
    noticePeriodDays: { type: Number, default: 30 },
  },
  { _id: false }
);

const PropertySchema = new Schema<IProperty>(
  {
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, required: true },
    propertyType: {
      type: String,
      enum: ['pg', 'hostel', 'coliving', 'apartment'],
      required: true,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'unisex'],
      required: true,
    },
    location: {
      address: { type: String, required: true },
      area: { type: String, required: true },
      city: { type: String, default: 'Jaipur' },
      pincode: { type: String, default: '302017' },
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
      nearby: [NearbySchema],
    },
    images: [{ type: String }],
    amenities: [{ type: String }],
    pricing: { type: PricingSchema, required: true },
    houseRules: { type: HouseRulesSchema, required: true },
    livingScore: { type: LivingScoreSchema, required: true },
    verification: {
      isVerified: { type: Boolean, default: false },
      verifiedDate: { type: Date },
    },
    beforeYouBook: [{ type: String }],
    goodFor: [{ type: String }],
    thingsToKnow: [{ type: String }],
    rating: { type: Number, default: 4.5 },
    reviewCount: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Search indexes
PropertySchema.index({ name: 'text', description: 'text', 'location.area': 'text', 'location.city': 'text' });

export const Property = mongoose.model<IProperty>('Property', PropertySchema);
