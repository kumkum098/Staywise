import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IFavorite extends Document {
  user: Types.ObjectId;
  property: Types.ObjectId;
  createdAt: Date;
}

const FavoriteSchema = new Schema<IFavorite>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    property: { type: Schema.Types.ObjectId, ref: 'Property', required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

FavoriteSchema.index({ user: 1, property: 1 }, { unique: true });

export const Favorite = mongoose.model<IFavorite>('Favorite', FavoriteSchema);
