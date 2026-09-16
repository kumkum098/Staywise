export type Role = 'tenant' | 'owner' | 'admin';

export interface UserPreferences {
  minBudget?: number;
  maxBudget?: number;
  quietness?: number;
  privacy?: number;
  foodRequired?: boolean;
  acRequired?: boolean;
  roomType?: 'single' | 'double' | 'triple' | 'any';
  preferredArea?: string;
  maxDistanceKm?: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone?: string;
  preferences: UserPreferences;
}

export interface NearbyPlace {
  name: string;
  distanceKm: number;
  travelTimeMins: number;
  category: 'college' | 'metro' | 'grocery' | 'gym' | 'hospital' | 'restaurant';
}

export interface LivingScore {
  cleanliness: number;
  internet: number;
  food: number;
  quietness: number;
  location: number;
  privacy: number;
  safety: number;
  overall: number;
}

export interface PricingBreakdown {
  startingRent: number;
  deposit: number;
  foodCost: number;
  electricityCost: number;
  maintenanceCost: number;
  wifiCost: number;
}

export interface HouseRules {
  curfew: string;
  visitorsAllowed: boolean;
  visitorPolicy: string;
  smokingAllowed: boolean;
  alcoholAllowed: boolean;
  petsAllowed: boolean;
  noticePeriodDays: number;
}

export interface RoomOption {
  _id: string;
  name: string;
  type: 'single' | 'double' | 'triple' | 'quad';
  capacity: number;
  rent: number;
  available: boolean;
  totalUnits: number;
  occupiedUnits: number;
  features: string[];
}

export interface Property {
  _id: string;
  owner: { _id: string; name: string; email: string; phone?: string };
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
    nearby: NearbyPlace[];
  };
  images: string[];
  amenities: string[];
  pricing: PricingBreakdown;
  houseRules: HouseRules;
  livingScore: LivingScore;
  verification: {
    isVerified: boolean;
    verifiedDate?: string;
  };
  beforeYouBook: string[];
  rating: number;
  reviewCount: number;
  isFeatured?: boolean;
  totalEstimatedMonthly?: number;
  roomOptions?: RoomOption[];
  rooms?: RoomOption[];
  availableRoomsCount?: number;
  createdAt?: string;
}

export interface Review {
  _id: string;
  property: string;
  user: { _id: string; name: string; role?: string };
  userName?: string;
  userRole?: string;
  cleanliness: number;
  internet: number;
  food: number;
  noise: number;
  location: number;
  privacy: number;
  safety: number;
  overall: number;
  comment: string;
  createdAt: string;
}

export interface Inquiry {
  _id: string;
  user: { _id: string; name: string; email: string; phone?: string };
  property: Property;
  message: string;
  phone?: string;
  email?: string;
  status: 'new' | 'contacted' | 'scheduled' | 'closed';
  createdAt: string;
}

export interface Visit {
  _id: string;
  user: { _id: string; name: string; email: string; phone?: string };
  property: Property;
  date: string;
  time: string;
  notes?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface FilterState {
  search: string;
  area: string;
  propertyType: string;
  roomType: string;
  gender: string;
  minRent: number;
  maxRent: number;
  wifi: boolean;
  ac: boolean;
  food: boolean;
  laundry: boolean;
  parking: boolean;
  isVerified: boolean;
  sort: string;
  page?: number;
  limit?: number;
}
