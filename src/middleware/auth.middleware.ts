import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../config/db';
import { ApiError } from '../utils/apiResponse';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface User {
      id: string;
      [key: string]: any;
    }
  }
}

export const authenticate = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new ApiError(401, 'Access token required');
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as { userId: string };

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        avatar: true,
        isEmailVerified: true,
        onboardingDone: true,
      },
    });

    if (!user) {
      throw new ApiError(401, 'User not found');
    }

    req.user = user;
    next();
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      next(new ApiError(401, 'Access token expired'));
    } else if (err.name === 'JsonWebTokenError') {
      next(new ApiError(401, 'Invalid access token'));
    } else {
      next(err);
    }
  }
};
