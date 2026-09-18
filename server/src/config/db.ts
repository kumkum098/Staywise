import mongoose from 'mongoose';

export const connectDB = async (): Promise<boolean> => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/staywise';
  try {
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('[MongoDB] Connected successfully.');
    return true;
  } catch (error: any) {
    console.warn(`[MongoDB Warning] Could not connect to database: ${error.message}`);

    if (process.env.NODE_ENV === 'production') {
      console.warn('[MongoDB Warning] Refusing to fall back to an in-memory database in production. Set MONGODB_URI.');
      return false;
    }

    console.warn('[MongoDB] No local/remote MongoDB reachable — starting an in-memory test database for development.');
    console.warn('[MongoDB] Data is ephemeral and will be re-seeded automatically on every server restart.');
    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      const memoryServer = await MongoMemoryServer.create();
      const memoryURI = memoryServer.getUri('staywise');
      await mongoose.connect(memoryURI);
      console.log(`[MongoDB] Connected to in-memory test database at ${memoryURI}`);

      const { seedDatabase } = await import('../seed/seedData.js');
      const summary = await seedDatabase();
      console.log(
        `[MongoDB] Auto-seeded in-memory database — users: ${summary.users}, properties: ${summary.properties}, rooms: ${summary.rooms}, reviews: ${summary.reviews}`
      );
      console.log('[MongoDB] Demo credentials (password Staywise123!): tenant@staywise.dev / owner@staywise.dev / admin@staywise.dev');

      return true;
    } catch (memoryError: any) {
      console.error(`[MongoDB Error] Failed to start in-memory test database: ${memoryError.message}`);
      return false;
    }
  }
};
