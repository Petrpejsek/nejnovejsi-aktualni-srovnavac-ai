import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'

type Issue = { type: 'error' | 'warning'; message: string; file?: string; line?: number }

const projectRoot = process.cwd()

function loadEnvFiles(): void {
  const candidates = [
    path.join(projectRoot, '.env.production'),
    path.join(projectRoot, '.env.local'),
    path.join(projectRoot, '.env'),
  ]
  for (const envPath of candidates) {
    if (fs.existsSync(envPath)) {
      dotenv.config({ path: envPath })
    }
  }
}

function listCodeFiles(dir: string): string[] {
  const exts = new Set(['.ts', '.tsx', '.js', '.jsx'])
  const ignoreDirs = new Set(['node_modules', '.next', 'venv', 'venv_new', 'venv_stable', 'venv_working', 'backend/venv', 'backend/venv_new', 'backend/venv_stable', 'backend/venv_working'])
  const result: string[] = []

  const stack: string[] = [dir]
  while (stack.length) {
    const current = stack.pop() as string
    const entries = fs.readdirSync(current, { withFileTypes: true })
    for (const entry of entries) {
      const full = path.join(current, entry.name)
      if (entry.isDirectory()) {
        if (ignoreDirs.has(entry.name)) continue
        stack.push(full)
        continue
      }
      const ext = path.extname(entry.name)
      if (exts.has(ext)) result.push(full)
    }
  }
  return result
}

function parseEnvExample(examplePath: string): Set<string> {
  const required = new Set<string>()
  if (!fs.existsSync(examplePath)) return required
  const content = fs.readFileSync(examplePath, 'utf8')
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) continue
    const eq = line.indexOf('=')
    if (eq <= 0) continue
    const key = line.slice(0, eq).trim()
    if (/^[A-Z0-9_]+$/.test(key)) required.add(key)
  }
  return required
}

function scanEnvUsage(files: string) {
  // placeholder, real implementation below. This stub keeps TS happy for function type inference.
}

function scanForEnvUsage(files: string[]): { usedEnv: Set<string>; fallbackHits: Issue[] } {
  const usedEnv = new Set<string>()
  const fallbackHits: Issue[] = []
  const envUsageRegex = /process\.env\.([A-Z0-9_]+)/g
  const fallbackRegex = /process\.env\.([A-Z0-9_]+)\s*\|\|\s*([`'\"])\s*[^`'\"]+\s*\1/g

  for (const file of files) {
    let content: string
    try {
      content = fs.readFileSync(file, 'utf8')
    } catch {
      continue
    }

    // collect used env keys
    for (const match of content.matchAll(envUsageRegex)) {
      usedEnv.add(match[1])
    }

    // detect literal fallbacks next to env
    let lineOffset = 0
    const lines = content.split(/\r?\n/)
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const m = line.match(/process\.env\.([A-Z0-9_]+)\s*\|\|\s*([`'\"]).+?\2/)
      if (m) {
        fallbackHits.push({ type: 'error', message: `Literal fallback for \'${m[1]}\' detected`, file, line: i + 1 })
      }
    }
  }

  return { usedEnv, fallbackHits }
}

function main(): void {
  const issues: Issue[] = []

  // 1) Load env files
  loadEnvFiles()

  // 2) Determine required variables
  const requiredFromExample = parseEnvExample(path.join(projectRoot, 'env.example'))
  const codeFiles = listCodeFiles(projectRoot)
  const { usedEnv, fallbackHits } = scanForEnvUsage(codeFiles)

  const ignoreKeys = new Set(['NODE_ENV', 'VERCEL_REGION', 'VERCEL_URL'])
  const required = new Set<string>([...requiredFromExample, ...[...usedEnv].filter(k => !ignoreKeys.has(k))])

  // 3) Check missing env values
  const missing: string[] = []
  for (const key of required) {
    const val = process.env[key]
    if (!(typeof val === 'string' && val.length > 0)) {
      missing.push(key)
    }
  }
  if (missing.length) {
    issues.push({ type: 'error', message: `Chybí environment proměnné: ${missing.sort().join(', ')}` })
  }

  // 4) Forbid literal fallbacks for env in code (security + clarity)
  issues.push(...fallbackHits)

  // 5) Prisma sanity checks (schema presence)
  const prismaSchemaPath = path.join(projectRoot, 'prisma', 'schema.prisma')
  if (!fs.existsSync(prismaSchemaPath)) {
    issues.push({ type: 'error', message: 'Nenalezeno prisma/schema.prisma' })
  }

  // 6) Summary
  const errors = issues.filter(i => i.type === 'error')
  const warnings = issues.filter(i => i.type === 'warning')

  if (warnings.length) {
    console.log(`\nWarnings (${warnings.length}):`)
    for (const w of warnings) {
      console.log(`- ${w.message}${w.file ? ` [${path.relative(projectRoot, w.file)}:${w.line ?? ''}]` : ''}`)
    }
  }

  if (errors.length) {
    console.error(`\nPredeploy check selhal. Errors (${errors.length}):`)
    for (const e of errors) {
      console.error(`- ${e.message}${e.file ? ` [${path.relative(projectRoot, e.file)}:${e.line ?? ''}]` : ''}`)
    }
    process.exit(1)
  }

  console.log('Predeploy check OK')
}

main()




