import * as PrismaModule from '@prisma/client';

const PrismaClient: any = (PrismaModule as any).PrismaClient || (PrismaModule as any).default?.PrismaClient;

declare global {
  // eslint-disable-next-line no-var
  var prisma: any;
}

export const prisma = global.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development'
    ? ['query', 'error', 'warn']
    : ['error'],
});

// Always store globally to reuse connection pool in serverless environments
global.prisma = prisma;

export default prisma;
