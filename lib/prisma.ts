import { PrismaClient } from '@/app/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

declare global {
  var __prisma: PrismaClient | null
}

const connectionString = process.env.DATABASE_URL!
export const prisma = global.__prisma || new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
})

if (process.env.NODE_ENV !== 'production') {
  global.__prisma = prisma
}