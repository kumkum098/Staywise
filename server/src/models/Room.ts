import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IRoom extends Document {
  property: Types.ObjectId;
  name: string;
  type: 'single' | 'double' | 'triple' | 'quad';
  capacity: number;
  rent: number;
  available: boolean;
  totalUnits: number;
  occupiedUnits: number;
  features: string[];
  createdAt: Date;
  updatedAt: Date;
}

const RoomSchema = new Schema<IRoom>(
  {
    property: { type: Schema.Types.ObjectId, ref: 'Property', required: true },
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ['single', 'double', 'triple', 'quad'],
      required: true,
    },
    capacity: { type: Number, required: true },
    rent: { type: Number, required: true },
    available: { type: Boolean, default: true },
    totalUnits: { type: Number, default: 1 },
    occupiedUnits: { type: Number, default: 0 },
    features: [{ type: String }],
  },
  { timestamps: true }
);

export const Room = mongoose.model<IRoom>('Room', RoomSchema);
