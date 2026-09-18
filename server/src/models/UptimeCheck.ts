import mongoose, { Document, Schema } from 'mongoose';

export type UptimeStatus = 'UP' | 'DOWN' | 'DEGRADED';

export interface IUptimeCheck extends Document {
  timestamp: Date;
  status: UptimeStatus;
  responseTime: number | null;
  httpStatus: number | null;
  reason?: string;
  incidentStartedAt?: Date;
  recoveredAt?: Date;
  duration?: number;
}

const UptimeCheckSchema = new Schema<IUptimeCheck>({
  timestamp: { type: Date, required: true, default: Date.now, index: true, expires: 60 * 60 * 24 * 7 },
  status: { type: String, enum: ['UP', 'DOWN', 'DEGRADED'], required: true },
  responseTime: { type: Number, default: null },
  httpStatus: { type: Number, default: null },
  reason: { type: String },
  incidentStartedAt: { type: Date },
  recoveredAt: { type: Date },
  duration: { type: Number },
});

export const UptimeCheck = mongoose.model<IUptimeCheck>('UptimeCheck', UptimeCheckSchema);