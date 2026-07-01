import rateLimit from 'express-rate-limit';
import { RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX } from '../config/constants';
import { Request, Response, NextFunction } from 'express';

const isDev = process.env.NODE_ENV === 'development';

export const apiLimiter = isDev
  ? (req: Request, res: Response, next: NextFunction) => next()
  : rateLimit({
      windowMs: RATE_LIMIT_WINDOW_MS,
      max: RATE_LIMIT_MAX,
      message: { success: false, message: 'Too many requests, please try again later.' },
      standardHeaders: true,
      legacyHeaders: false,
    });

export const authLimiter = isDev
  ? (req: Request, res: Response, next: NextFunction) => next()
  : rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 10,
      message: { success: false, message: 'Too many auth attempts, please try again later.' },
      standardHeaders: true,
      legacyHeaders: false,
    });

export const aiLimiter = isDev
  ? (req: Request, res: Response, next: NextFunction) => next()
  : rateLimit({
      windowMs: 60 * 1000, // 1 minute
      max: 20,
      message: { success: false, message: 'AI rate limit reached. Please wait a moment.' },
      standardHeaders: true,
      legacyHeaders: false,
    });
