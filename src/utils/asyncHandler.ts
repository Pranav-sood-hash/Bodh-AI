import { Request, Response, NextFunction } from 'express';

type AsyncRequestHandler = (
  req: any,
  res: any,
  next: NextFunction
) => Promise<any>;

export const asyncHandler = (fn: AsyncRequestHandler) => {
  return (req: any, res: any, next: any) => {
    Promise.resolve(fn(req, res, next)).catch((err) => next(err));
  };
};
