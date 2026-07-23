import * as express from 'express';

declare global {
  namespace Express {
    interface User {
      id: string;
      [key: string]: any;
    }
    interface Request {
      user?: any;
    }
  }
}
