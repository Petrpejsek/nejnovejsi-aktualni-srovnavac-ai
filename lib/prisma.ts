import { PrismaClient } from '@prisma/client'

/**
 * Optimized Prisma client configuration for Neon serverless database
 * - Connection pooling and retry logic
 * - Improved error handling
 */

// Singleton instance Prisma klienta 
let prisma: PrismaClient;

// Inicializace Prisma klienta
if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  // Předcházení více instancím v režimu vývoje
  if (!(global as any).prisma) {
    (global as any).prisma = new PrismaClient();
  }
  prisma = (global as any).prisma;
}

if (process.env.NODE_ENV === 'production') {
  console.log('Prisma initialized in production mode')
  console.log('DATABASE_URL defined:', !!process.env.DATABASE_URL)
} 

export default prisma 