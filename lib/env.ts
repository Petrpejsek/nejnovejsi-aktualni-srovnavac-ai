export function getRequiredEnv(key: string): string {
  const value = process.env[key]
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
  return value
}

export const PUBLIC_BASE_URL: string = (() => {
  const raw = getRequiredEnv('NEXT_PUBLIC_BASE_URL')
  // Normalize by stripping trailing slashes
  return raw.replace(/\/+$/, '')
})()


