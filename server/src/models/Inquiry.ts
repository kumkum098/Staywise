import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IInquiry extends Document {
  user: Types.ObjectId;
  property: Types.ObjectId;
  message: string;
  phone?: string;
  email?: string;
  status: 'new' | 'contacted' | 'scheduled' | 'closed';
  createdAt: Date;
  updatedAt: Date;
}

const InquirySchema = new Schema<IInquiry>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    property: { type: Schema.Types.ObjectId, ref: 'Property', required: true },
    message: { type: String, required: true },
    phone: { type: String },
    email: { type: String },
    status: {
      type: String,
      enum: ['new', 'contacted', 'scheduled', 'closed'],
      default: 'new',
    },
  },
  { timestamps: true }
);

export const Inquiry = mongoose.model<IInquiry>('Inquiry', InquirySchema);
