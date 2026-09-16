import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IVisit extends Document {
  user: Types.ObjectId;
  property: Types.ObjectId;
  date: string;
  time: string;
  notes?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

const VisitSchema = new Schema<IVisit>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    property: { type: Schema.Types.ObjectId, ref: 'Property', required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    notes: { type: String, default: '' },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

export const Visit = mongoose.model<IVisit>('Visit', VisitSchema);
