import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import 'express-async-errors';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import postRoutes from './routes/posts.js';
import commentRoutes from './routes/comments.js';
import bookRoutes from './routes/books.js';
import reviewRoutes from './routes/reviews.js';
import eventRoutes from './routes/events.js';
import adminRoutes from './routes/admin.js';
import authorRoutes from './routes/authors.js';

import { errorHandler } from './middleware/errorHandler.js';
import { notFound } from './middleware/notFound.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security
app.use(helmet());
app.use(compression());

// Rate limit (disabled for Vercel)
if (!process.env.VERCEL) {
  app.use(
    '/api/',
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 100,
    })
  );
}

// CORS
app.use(
  cors({
    origin:
      process.env.NODE_ENV === 'production'
        ? ['https://your-frontend-url.vercel.app']
        : ['http://localhost:3000'],
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// ---------------- MongoDB (serverless friendly) ----------
let isConnected = false;

async function connectDB() {
  if (isConnected) return;

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    isConnected = conn.connections[0].readyState;
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error('MongoDB error:', err.message);
    if (!process.env.VERCEL) process.exit(1);
  }
}

await connectDB();

// ------------------- Routes --------------------
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/authors', authorRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Wordingo API running',
    time: new Date().toISOString(),
  });
});

// Errors
app.use(notFound);
app.use(errorHandler);

// ---------------- Local server only --------------------
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Local server running on port ${PORT}`);
  });
}


app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API running at /api/* routes'
  });
});


// Vercel uses the export — must ALWAYS be defined
export default app;

