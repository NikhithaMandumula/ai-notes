import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import notesRouter from './routes/notes.js';
import authRouter from './routes/auth.js';
import sharesRouter from './routes/shares.js';
import aiRouter from './routes/ai.js';
import resourcesRouter from './routes/resources.js';
import profileRouter from './routes/profile.js';
import chatRouter from './routes/chat.js';
import { setupSocket } from './socket.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

// Validate required env vars at startup — fail fast before any connections
if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is required');
if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is required');
if (!process.env.GROQ_API_KEY) throw new Error('GROQ_API_KEY is required');

// Rate limiter
const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { message: 'Too many AI requests, please slow down.' },
});

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRouter);
app.use('/api/notes', notesRouter);
app.use('/api/shares', sharesRouter);
app.use('/api/ai', aiLimiter, aiRouter);
app.use('/api/resources', aiLimiter, resourcesRouter);
app.use('/api/profile', profileRouter);
app.use('/api/chat', aiLimiter, chatRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Create HTTP server and attach Socket.IO
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

setupSocket(io);
app.set('io', io);

// Connect to MongoDB then start server
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    httpServer.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on http://0.0.0.0:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  });

