import rateLimit from 'express-rate-limit';
import { RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX } from '../config/constants';
import { Request, Response, NextFunction } from 'express';

const isDev = process.env.NODE_ENV === 'development';
const bypassRateLimit = isDev || process.env.DISABLE_RATE_LIMIT === 'true';

// Helper to extract the actual client IP address behind proxy/load balancers
const getClientIp = (req: Request): string => {
  const xff = req.headers['x-forwarded-for'];
  if (typeof xff === 'string') {
    return xff.split(',')[0].trim();
  }
  return req.ip || req.socket.remoteAddress || 'unknown';
};

export const apiLimiter = bypassRateLimit
  ? (req: Request, res: Response, next: NextFunction) => next()
  : rateLimit({
      windowMs: RATE_LIMIT_WINDOW_MS,
      max: RATE_LIMIT_MAX,
      message: { success: false, message: 'Too many requests, please try again later.' },
      standardHeaders: true,
      legacyHeaders: false,
      keyGenerator: getClientIp,
    });

export const authLimiter = bypassRateLimit
  ? (req: Request, res: Response, next: NextFunction) => next()
  : rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: parseInt(process.env.AUTH_RATE_LIMIT_MAX || '30'),
      message: { success: false, message: 'Too many auth attempts, please try again later.' },
      standardHeaders: true,
      legacyHeaders: false,
      keyGenerator: getClientIp,
    });

export const aiLimiter = bypassRateLimit
  ? (req: Request, res: Response, next: NextFunction) => next()
  : rateLimit({
      windowMs: 60 * 1000, // 1 minute
      max: parseInt(process.env.AI_RATE_LIMIT_MAX || '60'),
      message: { success: false, message: 'AI rate limit reached. Please wait a moment.' },
      standardHeaders: true,
      legacyHeaders: false,
      keyGenerator: getClientIp,
    });
