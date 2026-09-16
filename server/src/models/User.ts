import mongoose, { Schema, Document } from 'mongoose';

export interface IUserPreferences {
  minBudget?: number;
  maxBudget?: number;
  quietness?: number; // 1-10
  privacy?: number; // 1-10
  foodRequired?: boolean;
  acRequired?: boolean;
  roomType?: 'single' | 'double' | 'triple' | 'any';
  preferredArea?: string;
  maxDistanceKm?: number;
  curfewFlexible?: boolean;
}

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: 'tenant' | 'owner' | 'admin';
  phone?: string;
  preferences: IUserPreferences;
  createdAt: Date;
  updatedAt: Date;
}

const UserPreferencesSchema = new Schema<IUserPreferences>(
  {
    minBudget: { type: Number, default: 5000 },
    maxBudget: { type: Number, default: 15000 },
    quietness: { type: Number, default: 7 },
    privacy: { type: Number, default: 7 },
    foodRequired: { type: Boolean, default: false },
    acRequired: { type: Boolean, default: true },
    roomType: { type: String, enum: ['single', 'double', 'triple', 'any'], default: 'any' },
    preferredArea: { type: String, default: '' },
    maxDistanceKm: { type: Number, default: 5 },
    curfewFlexible: { type: Boolean, default: true },
  },
  { _id: false }
);

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['tenant', 'owner', 'admin'], default: 'tenant' },
    phone: { type: String, default: '' },
    preferences: { type: UserPreferencesSchema, default: () => ({}) },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>('User', UserSchema);
