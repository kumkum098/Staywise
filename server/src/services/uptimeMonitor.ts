import mongoose from 'mongoose';
import { UptimeCheck, UptimeStatus } from '../models/UptimeCheck.js';

const DEFAULT_INTERVAL = 60_000;
const DEFAULT_FAILURE_THRESHOLD = 3;
const DEFAULT_SLOW_THRESHOLD = 1_000;
const HISTORY_RETENTION_MS = 7 * 24 * 60 * 60 * 1_000;

const positiveNumber = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

export const uptimeConfig = {
  targetUrl: process.env.MONITOR_TARGET_URL?.trim() || '',
  intervalMs: positiveNumber(process.env.UPTIME_CHECK_INTERVAL, DEFAULT_INTERVAL),
  failureThreshold: Math.max(1, Math.floor(positiveNumber(process.env.UPTIME_FAILURE_THRESHOLD, DEFAULT_FAILURE_THRESHOLD))),
  slowThresholdMs: positiveNumber(process.env.UPTIME_SLOW_THRESHOLD, DEFAULT_SLOW_THRESHOLD),
};

interface MonitorSnapshot {
  configured: boolean;
  status: UptimeStatus;
  responseTime: number | null;
  httpStatus: number | null;
  lastCheckedAt: Date | null;
  consecutiveFailures: number;
  failureThreshold: number;
  slowThreshold: number;
}

export class UptimeMonitor {
  private snapshot: MonitorSnapshot = {
    configured: Boolean(uptimeConfig.targetUrl),
    status: 'UP',
    responseTime: null,
    httpStatus: null,
    lastCheckedAt: null,
    consecutiveFailures: 0,
    failureThreshold: uptimeConfig.failureThreshold,
    slowThreshold: uptimeConfig.slowThresholdMs,
  };

  private timer?: NodeJS.Timeout;
  private activeIncidentId?: string;
  private activeIncidentStartedAt?: Date;

  getSnapshot(): MonitorSnapshot {
    return { ...this.snapshot };
  }

  start(): void {
    if (!uptimeConfig.targetUrl) {
      console.warn('[UPTIME] Monitoring disabled: MONITOR_TARGET_URL is not configured.');
      return;
    }

    void this.check();
    this.timer = setInterval(() => void this.check(), uptimeConfig.intervalMs);
    this.timer.unref();
  }

  stop(): void {
    if (this.timer) clearInterval(this.timer);
  }

  async check(): Promise<void> {
    if (!uptimeConfig.targetUrl) return;

    const startedAt = Date.now();
    const checkedAt = new Date();
    let responseTime: number | null = null;
    let httpStatus: number | null = null;
    let nextStatus: UptimeStatus = this.snapshot.status;
    let reason: string | undefined;

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), Math.max(5_000, uptimeConfig.slowThresholdMs * 3));
      const response = await fetch(uptimeConfig.targetUrl, { signal: controller.signal });
      clearTimeout(timeout);
      responseTime = Date.now() - startedAt;
      httpStatus = response.status;

      if (!response.ok) {
        reason = `Health endpoint returned HTTP ${response.status}`;
        this.snapshot.consecutiveFailures += 1;
        nextStatus = this.snapshot.consecutiveFailures >= uptimeConfig.failureThreshold ? 'DOWN' : this.snapshot.status;
      } else {
        this.snapshot.consecutiveFailures = 0;
        nextStatus = responseTime > uptimeConfig.slowThresholdMs ? 'DEGRADED' : 'UP';
      }
    } catch (error) {
      responseTime = Date.now() - startedAt;
      reason = error instanceof Error && error.name === 'AbortError' ? 'Health endpoint request timed out' : 'Health endpoint request failed';
      this.snapshot.consecutiveFailures += 1;
      nextStatus = this.snapshot.consecutiveFailures >= uptimeConfig.failureThreshold ? 'DOWN' : this.snapshot.status;
    }

    const transitioned = nextStatus !== this.snapshot.status;
    this.snapshot = {
      ...this.snapshot,
      status: nextStatus,
      responseTime,
      httpStatus,
      lastCheckedAt: checkedAt,
    };

    let check = await this.saveCheck({ checkedAt, status: nextStatus, responseTime, httpStatus, reason });

    if (transitioned && nextStatus === 'DOWN') {
      this.activeIncidentStartedAt = checkedAt;
      this.activeIncidentId = check?._id.toString();
      console.warn('[UPTIME] API DOWN');
      if (check) {
        await UptimeCheck.findByIdAndUpdate(check._id, { incidentStartedAt: checkedAt });
      }
    } else if (transitioned && this.snapshot.status !== 'DOWN' && this.activeIncidentId) {
      const recoveredAt = checkedAt;
      const duration = this.activeIncidentStartedAt ? recoveredAt.getTime() - this.activeIncidentStartedAt.getTime() : undefined;
      await UptimeCheck.findByIdAndUpdate(this.activeIncidentId, { recoveredAt, duration });
      console.log('[UPTIME] API RECOVERED');
      this.activeIncidentId = undefined;
      this.activeIncidentStartedAt = undefined;
    }

    if (mongoose.connection.readyState === 1) {
      await UptimeCheck.deleteMany({ timestamp: { $lt: new Date(Date.now() - HISTORY_RETENTION_MS) } });
    }
  }

  private async saveCheck(input: {
    checkedAt: Date;
    status: UptimeStatus;
    responseTime: number | null;
    httpStatus: number | null;
    reason?: string;
  }) {
    if (mongoose.connection.readyState !== 1) return null;
    try {
      return await UptimeCheck.create({
        timestamp: input.checkedAt,
        status: input.status,
        responseTime: input.responseTime,
        httpStatus: input.httpStatus,
        reason: input.reason,
      });
    } catch {
      console.warn('[UPTIME] Could not persist monitoring check.');
      return null;
    }
  }
}

export const uptimeMonitor = new UptimeMonitor();