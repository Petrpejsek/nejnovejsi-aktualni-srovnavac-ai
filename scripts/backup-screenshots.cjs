#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

console.log('🔄 Creating screenshots backup...')

// Vytvoříme backup složku s timestampem
const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
const backupDir = `screenshots-backup-${timestamp}`
const screenshotsDir = 'public/screenshots'

try {
  // Zkontrolujeme, zda existuje složka screenshots
  if (!fs.existsSync(screenshotsDir)) {
    console.log('❌ Screenshots directory not found!')
    process.exit(1)
  }

  // Spočítáme screenshoty
  const screenshots = fs.readdirSync(screenshotsDir)
    .filter(file => file.endsWith('.png'))
  
  console.log(`📊 Found ${screenshots.length} screenshots to backup`)

  if (screenshots.length === 0) {
    console.log('⚠️ No screenshots to backup')
    process.exit(0)
  }

  // Vytvoříme backup složku
  fs.mkdirSync(backupDir, { recursive: true })
  console.log(`📁 Created backup directory: ${backupDir}`)

  // Zkopírujeme všechny screenshoty
  let copiedCount = 0
  screenshots.forEach(screenshot => {
    const sourcePath = path.join(screenshotsDir, screenshot)
    const backupPath = path.join(backupDir, screenshot)
    
    try {
      fs.copyFileSync(sourcePath, backupPath)
      copiedCount++
      
      if (copiedCount % 50 === 0) {
        console.log(`📋 Copied ${copiedCount}/${screenshots.length} screenshots...`)
      }
    } catch (error) {
      console.error(`❌ Error copying ${screenshot}:`, error.message)
    }
  })

  // Vytvoříme manifest soubor s metadaty
  const manifest = {
    created: new Date().toISOString(),
    totalScreenshots: screenshots.length,
    copiedScreenshots: copiedCount,
    sourceDirectory: screenshotsDir,
    screenshots: screenshots.map(file => {
      const stats = fs.statSync(path.join(screenshotsDir, file))
      return {
        filename: file,
        size: stats.size,
        modified: stats.mtime.toISOString()
      }
    })
  }

  fs.writeFileSync(
    path.join(backupDir, 'backup-manifest.json'), 
    JSON.stringify(manifest, null, 2)
  )

  console.log('✅ Backup completed successfully!')
  console.log(`📊 Backup summary:`)
  console.log(`   📁 Location: ${backupDir}`)
  console.log(`   📸 Screenshots: ${copiedCount}/${screenshots.length}`)
  console.log(`   💾 Total size: ${(manifest.screenshots.reduce((sum, s) => sum + s.size, 0) / 1024 / 1024).toFixed(2)} MB`)
  
  // Vytvoříme restore script
  const restoreScript = `#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

console.log('🔄 Restoring screenshots from backup...')

const backupDir = '${backupDir}'
const screenshotsDir = 'public/screenshots'

if (!fs.existsSync(backupDir)) {
  console.log('❌ Backup directory not found!')
  process.exit(1)
}

// Načteme manifest
const manifest = JSON.parse(fs.readFileSync(path.join(backupDir, 'backup-manifest.json')))
console.log(\`📊 Restoring \${manifest.totalScreenshots} screenshots...\`)

// Vytvoříme screenshots složku pokud neexistuje
fs.mkdirSync(screenshotsDir, { recursive: true })

let restoredCount = 0
manifest.screenshots.forEach(({ filename }) => {
  const backupPath = path.join(backupDir, filename)
  const targetPath = path.join(screenshotsDir, filename)
  
  if (fs.existsSync(backupPath)) {
    fs.copyFileSync(backupPath, targetPath)
    restoredCount++
    
    if (restoredCount % 50 === 0) {
      console.log(\`📋 Restored \${restoredCount}/\${manifest.totalScreenshots} screenshots...\`)
    }
  }
})

console.log(\`✅ Restore completed! Restored \${restoredCount}/\${manifest.totalScreenshots} screenshots\`)
`

  fs.writeFileSync(path.join(backupDir, 'restore-screenshots.cjs'), restoreScript)
  fs.chmodSync(path.join(backupDir, 'restore-screenshots.cjs'), '755')

  console.log(`🔧 Restore script created: ${backupDir}/restore-screenshots.cjs`)
  console.log(`\n📋 Usage:`)
  console.log(`   To restore: node ${backupDir}/restore-screenshots.cjs`)

} catch (error) {
  console.error('❌ Backup failed:', error.message)
  process.exit(1)
} 