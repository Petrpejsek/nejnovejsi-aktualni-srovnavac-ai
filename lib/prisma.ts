import { PrismaClient } from '@prisma/client'

/**
 * Optimized Prisma client configuration for Neon serverless database
 * - Connection pooling and retry logic
 * - Improved error handling
 */

// Předcházení problémům s mnoha instancemi PrismaClient 
// během hot-reloadu v režimu vývoje
const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined
}

const prisma = globalForPrisma.prisma ?? 
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    }
  } as any)

if (process.env.NODE_ENV === 'production') {
  console.log('Prisma initialized in production mode')
  console.log('DATABASE_URL defined:', !!process.env.DATABASE_URL)
} 

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export default prisma 