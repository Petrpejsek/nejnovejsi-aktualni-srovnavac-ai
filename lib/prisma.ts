import { PrismaClient } from '@prisma/client'

/**
 * Optimalizovaná konfigurace Prisma klienta pro Neon serverless databázi
 * - Nastavení timeoutů
 * - Správa odpojení a znovupřipojení
 */

// Globální instance Prisma klienta
const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined
}

// Vytvoření instance PrismaClient s optimalizovaným connection poolingem
const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL?.replace(
          '?sslmode=require',
          '?sslmode=require&connection_limit=15&pool_timeout=30&connect_timeout=15'
        )
      }
    }
  })

// Správa ukončení pro všechny režimy - produkce i vývoj
// Neon serverless potřebuje správné odpojení pro každý proces
let isConnected = false

// Připojení s opakováním při selhání
const connect = async () => {
  try {
    if (!isConnected) {
      await prisma.$connect()
      isConnected = true
      console.log('✓ Připojeno k Neon databázi')
    }
  } catch (error) {
    console.error('❌ Chyba při připojení k databázi:', error)
    isConnected = false
    
    // Zkusíme znovu za chvíli
    setTimeout(connect, 5000)
  }
}

// Korektní odpojení při ukončení
const gracefulShutdown = async () => {
  try {
    await prisma.$disconnect()
    isConnected = false
    console.log('✓ Odpojeno od Neon databáze')
  } catch (error) {
    console.error('❌ Chyba při odpojování od databáze:', error)
  }
}

// Připojení při startu
connect()

// Správné odpojení při ukončení aplikace
process.on('beforeExit', gracefulShutdown)
process.on('SIGINT', gracefulShutdown)
process.on('SIGTERM', gracefulShutdown)

// Pro development prostředí - zachování globální instance
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma 