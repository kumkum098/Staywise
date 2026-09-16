import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IReview extends Document {
  property: Types.ObjectId;
  user: Types.ObjectId;
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
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    property: { type: Schema.Types.ObjectId, ref: 'Property', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    userName: { type: String },
    userRole: { type: String, default: 'Resident' },
    cleanliness: { type: Number, required: true, min: 1, max: 10 },
    internet: { type: Number, required: true, min: 1, max: 10 },
    food: { type: Number, required: true, min: 1, max: 10 },
    noise: { type: Number, required: true, min: 1, max: 10 },
    location: { type: Number, required: true, min: 1, max: 10 },
    privacy: { type: Number, required: true, min: 1, max: 10 },
    safety: { type: Number, required: true, min: 1, max: 10 },
    overall: { type: Number, required: true, min: 1, max: 10 },
    comment: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

export const Review = mongoose.model<IReview>('Review', ReviewSchema);
