import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { apiLimiter } from './middleware/rateLimit.middleware';
import { errorHandler, notFound } from './middleware/error.middleware';

// Routes
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import chatRoutes from './routes/chat.routes';
import messageRoutes from './routes/message.routes';
import apikeyRoutes from './routes/apikey.routes';
import roadmapRoutes from './routes/roadmap.routes';
import projectRoutes from './routes/project.routes';
import plannerRoutes from './routes/planner.routes';
import progressRoutes from './routes/progress.routes';
import folderRoutes from './routes/folder.routes';
import settingsRoutes from './routes/settings.routes';
import { handleChat } from '../server/routes/chat';

import prisma from './config/db';

const app = express();

// Security and utility middleware
import passport from './config/passport';
app.use(passport.initialize());
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:8080',
  credentials: true
}));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Apply rate limiting to all API requests
app.use('/api/', apiLimiter);

// Diagnostic health check route
app.get('/api/health', async (req, res) => {
  let dbStatus = 'UNKNOWN';
  try {
    await prisma.user.count();
    dbStatus = 'CONNECTED';
  } catch (err: any) {
    dbStatus = `FAILED: ${err.message}`;
  }

  res.status(200).json({
    status: 'OK',
    env: process.env.NODE_ENV,
    database: dbStatus,
    jwtAccessSecretExists: !!process.env.JWT_ACCESS_SECRET,
    jwtRefreshSecretExists: !!process.env.JWT_REFRESH_SECRET,
    gmailUserExists: !!process.env.GMAIL_USER,
    gmailAppPasswordExists: !!process.env.GMAIL_APP_PASSWORD,
    groqApiKeyExists: !!process.env.GROQ_API_KEY,
  });
});

// Register routes
app.post('/api/chat', handleChat);
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/apikeys', apikeyRoutes);
app.use('/api/roadmap', roadmapRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/planner', plannerRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/folders', folderRoutes);
app.use('/api/settings', settingsRoutes);

// Error Handling
app.use(notFound);
app.use(errorHandler);

export default app;
