import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { UptimeCheck } from '../models/UptimeCheck.js';
import { uptimeMonitor } from '../services/uptimeMonitor.js';

const getStatistics = async () => {
  const [total, successful, average] = await Promise.all([
    UptimeCheck.countDocuments(),
    UptimeCheck.countDocuments({ status: { $in: ['UP', 'DEGRADED'] } }),
    UptimeCheck.aggregate<{ average: number }>([
      { $match: { responseTime: { $ne: null } } },
      { $group: { _id: null, average: { $avg: '$responseTime' } } },
    ]),
  ]);

  return {
    uptimePercentage: total ? Number(((successful / total) * 100).toFixed(2)) : null,
    averageResponseTime: average[0]?.average ? Math.round(average[0].average) : null,
  };
};

export const getMonitoringStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [statistics, recentChecks, recentIncidents] = await Promise.all([
      getStatistics(),
      UptimeCheck.find().sort({ timestamp: -1 }).limit(20).lean(),
      UptimeCheck.find({ incidentStartedAt: { $exists: true } }).sort({ incidentStartedAt: -1 }).limit(10).lean(),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        ...uptimeMonitor.getSnapshot(),
        database: mongoose.connection.readyState === 1 ? 'connected' : 'unavailable',
        ...statistics,
        recentChecks,
        recentIncidents,
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const getMonitoringHistory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 200);
    const checks = await UptimeCheck.find().sort({ timestamp: -1 }).limit(limit).lean();
    return res.status(200).json({ success: true, data: { checks } });
  } catch (error) {
    return next(error);
  }
};