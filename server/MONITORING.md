# Staywise Monitoring

Set `MONITOR_TARGET_URL` to the deployed API health URL, for example `https://your-api.example.com/api/health`. The monitor uses `UPTIME_CHECK_INTERVAL` in milliseconds, requires `UPTIME_FAILURE_THRESHOLD` consecutive failures before marking the service down, and marks successful checks as `DEGRADED` when they exceed `UPTIME_SLOW_THRESHOLD` milliseconds.

Monitoring history is stored in the existing MongoDB connection through the `UptimeCheck` model and expires after seven days. The admin-only endpoints are `/api/monitoring/status` and `/api/monitoring/history`; the frontend view is `/admin/monitoring`.

The monitor is a lightweight Node.js timer. It is not a guaranteed uptime service: a hosting provider can stop or restart the process when an instance sleeps, redeploys, or restarts. The public `/api/health` endpoint remains independent from the monitor and can be checked by an external uptime provider if stronger availability coverage is needed.