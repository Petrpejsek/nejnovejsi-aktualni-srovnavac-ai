import { PrismaClient } from '@prisma/client'

/**
 * Optimized Prisma client configuration for Neon serverless database
 * - Connection pooling and retry logic
 * - Improved error handling
 */

// Global Prisma client instance
const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined
}

// Detect if URL has line breaks and fix them
const fixDatabaseUrl = (url?: string): string | undefined => {
  if (!url) return undefined;
  
  // Remove all whitespace, including line breaks
  return url.replace(/\s+/g, '');
}

// Create PrismaClient instance with optimized connection pooling
const basePrisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['error'],
    datasources: {
      db: {
        url: fixDatabaseUrl(process.env.DATABASE_URL)
      }
    }
  })

// Connection management state
let isConnected = false
const MAX_OPERATION_RETRIES = 3

// Initialize the connection
const connect = async () => {
  try {
    if (!isConnected) {
      console.log('Connecting to Neon database...')
      await basePrisma.$connect()
      isConnected = true
      console.log('✓ Connected to Neon database')
    }
    return true
  } catch (error) {
    console.error('❌ Error connecting to database:', error)
    isConnected = false
    return false
  }
}

// Handle disconnect
const disconnect = async () => {
  try {
    if (isConnected) {
      await basePrisma.$disconnect()
      isConnected = false
      console.log('✓ Disconnected from Neon database')
    }
  } catch (error) {
    console.error('❌ Error disconnecting from database:', error)
  }
}

// Connect on startup
connect().catch(console.error)

// Proper disconnection when application terminates
process.on('beforeExit', disconnect)
process.on('SIGINT', disconnect)
process.on('SIGTERM', disconnect)

// Create a wrapper around Prisma client that handles disconnects
const prisma = new Proxy(basePrisma, {
  get(target, prop) {
    // Return the original property if it's a symbol or a method of the PrismaClient itself
    if (typeof prop === 'symbol' || prop === 'then' || prop === '$connect' || prop === '$disconnect' || prop === '$on' || prop === '$transaction' || prop === '$queryRaw') {
      return target[prop as keyof typeof target]
    }
    
    // For model operations (e.g., prisma.user.findMany), add retry logic
    const model = target[prop as keyof typeof target]
    if (model && typeof model === 'object') {
      return new Proxy(model, {
        get(modelTarget, operation) {
          if (typeof operation === 'symbol' || typeof modelTarget[operation as keyof typeof modelTarget] !== 'function') {
            return modelTarget[operation as keyof typeof modelTarget]
          }
          
          const originalOperation = modelTarget[operation as keyof typeof modelTarget] as Function
          
          // Return a function that will retry the operation if it fails
          return async (...args: any[]) => {
            let retries = 0
            
            while (retries <= MAX_OPERATION_RETRIES) {
              try {
                // Make sure we're connected before executing
                if (!isConnected) {
                  await connect()
                }
                
                // Try to execute the operation
                return await originalOperation.apply(modelTarget, args)
              } catch (error: any) {
                // If the error is related to a connection issue, retry
                const isConnectionError = 
                  error.message?.includes('Error in PostgreSQL') || 
                  error.message?.includes('connection') ||
                  error.message?.includes('Connection') ||
                  error.message?.includes('prisma') ||
                  error.kind === 'Closed' ||
                  error.code === 'P1001' || // Authentication failed
                  error.code === 'P1002' || // Connection timed out
                  error.code === 'P1008' || // Operations timed out
                  error.code === 'P1017';   // Server closed the connection
                
                if (isConnectionError && retries < MAX_OPERATION_RETRIES) {
                  retries++
                  console.log(`Database operation failed, retrying (${retries}/${MAX_OPERATION_RETRIES})...`)
                  isConnected = false
                  
                  // Wait before retry with exponential backoff
                  const delay = Math.min(1000 * Math.pow(2, retries), 8000)
                  console.log(`Waiting ${delay}ms before retry...`)
                  await new Promise(resolve => setTimeout(resolve, delay))
                  
                  // Try to reconnect
                  await connect()
                  continue
                }
                
                // On last retry, try to reconnect one more time
                if (retries === MAX_OPERATION_RETRIES) {
                  console.log('Final retry attempt, trying to reconnect...')
                  isConnected = false
                  await connect()
                  
                  try {
                    return await originalOperation.apply(modelTarget, args)
                  } catch (finalError) {
                    console.error('All retries failed:', finalError)
                    throw finalError
                  }
                }
                
                // If it's not a connection error or we've exhausted retries, throw
                throw error
              }
            }
          }
        }
      })
    }
    
    return target[prop as keyof typeof target]
  }
})

// For development environment - preserve global instance
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma 