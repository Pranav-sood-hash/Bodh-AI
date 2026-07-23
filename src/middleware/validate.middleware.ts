import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ApiError } from '../utils/apiResponse';

export const validate = (schema: ZodSchema) => {
  return (req: any, _res: any, next: any) => {
    try {
      schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const messages = err.errors.map((e) => e.message).join(', ');
        next(new ApiError(400, messages));
      } else {
        next(err);
      }
    }
  };
};
