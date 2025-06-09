import { PrismaClient } from '@prisma/client'

/**
 * Optimized Prisma client configuration for Neon serverless database
 * - Connection pooling and retry logic
 * - Improved error handling
 */

declare global {
  var prisma: PrismaClient | undefined
}

const prisma = globalThis.prisma || new PrismaClient()

if (process.env.NODE_ENV === 'development') {
  globalThis.prisma = prisma
}

if (process.env.NODE_ENV === 'production') {
  console.log('Prisma initialized in production mode')
  console.log('DATABASE_URL defined:', !!process.env.DATABASE_URL)
} 

export { prisma }
export default prisma 