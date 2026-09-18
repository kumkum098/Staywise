import app from './app.js';
import { connectDB } from './config/db.js';
import { uptimeMonitor } from './services/uptimeMonitor.js';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`[Staywise Server] Listening on http://localhost:${PORT}`);
    uptimeMonitor.start();
  });
};

startServer();
