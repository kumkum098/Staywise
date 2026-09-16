import mongoose from 'mongoose';

export const connectDB = async (): Promise<boolean> => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/staywise';
  try {
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[MongoDB] Connected successfully to ${mongoURI}`);
    return true;
  } catch (error: any) {
    console.warn(`[MongoDB Warning] Could not connect to database (${mongoURI}): ${error.message}`);
    console.warn(`[MongoDB Warning] Ensure MongoDB is running locally (mongod) or set MONGODB_URI in server/.env`);
    return false;
  }
};
