import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import propertyRoutes from './routes/propertyRoutes.js';
import roomRoutes from './routes/roomRoutes.js';
import favoriteRoutes from './routes/favoriteRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import inquiryRoutes from './routes/inquiryRoutes.js';
import visitRoutes from './routes/visitRoutes.js';
import ownerRoutes from './routes/ownerRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();

// Helper to normalize origins (removes trailing slashes & whitespace)
const normalizeOrigin = (url: string): string => url.trim().replace(/\/+$/, '');

const getExplicitAllowedOrigins = (): string[] => {
  const origins: string[] = [
    'https://staywise-iaarubrkr-kumkum16.vercel.app',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
  ];

  if (process.env.CLIENT_URL) {
    const clientUrls = process.env.CLIENT_URL.split(',');
    clientUrls.forEach((url) => {
      const normalized = normalizeOrigin(url);
      if (normalized) {
        origins.push(normalized);
      }
    });
  }

  return origins;
};

// CORS Middleware Configuration
const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl, Postman, server-to-server)
    if (!origin) {
      callback(null, true);
      return;
    }

    const normalizedRequestOrigin = normalizeOrigin(origin);
    const allowedOrigins = getExplicitAllowedOrigins();

    const isAllowed =
      allowedOrigins.includes(normalizedRequestOrigin) ||
      normalizedRequestOrigin.endsWith('.vercel.app');

    if (isAllowed) {
      callback(null, true);
    } else {
      console.warn(`[CORS Blocked] Origin not allowed: ${origin}`);
      callback(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Health Check
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ success: true, message: 'Staywise API operational' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api', roomRoutes);
app.use('/api', reviewRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/inquiries', inquiryRoutes);
app.use('/api/visits', visitRoutes);
app.use('/api/owner', ownerRoutes);

// 404 Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found.` });
});

// Centralized Error Handler
app.use(errorHandler);

export default app;
