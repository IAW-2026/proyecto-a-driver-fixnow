// lib/prisma.ts
import { PrismaClient } from '@/app/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

declare global {
  var __prisma: PrismaClient | null;
}

const connectionString = process.env.DATABASE_URL!;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not defined');
}

export const prisma = global.__prisma || new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
  log: process.env.NODE_ENV === 'development' ? ['query', 'error'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
  global.__prisma = prisma;
}