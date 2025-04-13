import { PrismaClient } from '@prisma/client'

/**
 * Optimalizovaná konfigurace Prisma klienta pro Neon serverless databázi
 * - Nastavení timeoutů
 * - Správa odpojení a znovupřipojení
 */

// Globální instance Prisma klienta
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Vytvoření Prisma klienta s optimalizovaným nastavením
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: ['error', 'warn'],
  
  // Nastavení datasource
  datasources: {
    db: {
      url: process.env.DATABASE_URL
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