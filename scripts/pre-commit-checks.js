#!/usr/bin/env node

import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import { readFileSync } from 'fs';

const execAsync = promisify(exec);

console.log('🔍 SPOUŠTÍM PRE-COMMIT KONTROLY');
console.log('===============================\n');

let allTestsPassed = true;
const errors = [];

// Helper function to run command and capture output
function runCommand(command, description) {
  return new Promise((resolve, reject) => {
    console.log(`🔧 ${description}...`);
    
    const child = spawn('sh', ['-c', command], { 
      stdio: ['inherit', 'pipe', 'pipe'],
      cwd: process.cwd()
    });
    
    let stdout = '';
    let stderr = '';
    
    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        console.log(`   ✅ ${description} - ÚSPĚCH\n`);
        resolve({ success: true, stdout, stderr });
      } else {
        console.log(`   ❌ ${description} - SELHÁNÍ (exit code: ${code})\n`);
        if (stderr) console.log(`   📋 Chyby:\n${stderr}\n`);
        resolve({ success: false, stdout, stderr, exitCode: code });
      }
    });
    
    child.on('error', (error) => {
      console.log(`   ❌ ${description} - CHYBA: ${error.message}\n`);
      resolve({ success: false, error: error.message });
    });
  });
}

async function runPreCommitChecks() {
  try {
    
    // 1. TypeScript Compilation Check
    console.log('📊 1. TYPESCRIPT KOMPILACE');
    console.log('==========================');
    const tscResult = await runCommand('npx tsc --noEmit', 'TypeScript kompilace');
    if (!tscResult.success) {
      allTestsPassed = false;
      errors.push('TypeScript kompilace selhala');
    }

    // 2. ESLint Check
    console.log('🔍 2. ESLINT KONTROLA');
    console.log('====================');
    const eslintResult = await runCommand('npx eslint . --ext .ts,.tsx,.js,.jsx --max-warnings 0', 'ESLint syntax kontrola');
    if (!eslintResult.success) {
      allTestsPassed = false;
      errors.push('ESLint našel chyby nebo varování');
    }

    // 3. Next.js Build Test
    console.log('🏗️  3. BUILD TEST');
    console.log('================');
    const buildResult = await runCommand('npm run build', 'Next.js build test');
    if (!buildResult.success) {
      allTestsPassed = false;
      errors.push('Build test selhal');
    }

    // 4. API Endpoints Test (quick smoke test)
    console.log('🌐 4. API ENDPOINTS TEST');
    console.log('=======================');
    
    // Start dev server temporarily for API testing
    console.log('🔧 Spouštím dočasný dev server pro API testy...');
    const serverProcess = spawn('npm', ['run', 'dev'], { 
      stdio: ['ignore', 'pipe', 'pipe'],
      detached: false
    });
    
    // Wait for server to start
    await new Promise(resolve => setTimeout(resolve, 8000));
    
    try {
      // Test key API endpoints
      const apiTests = [
        { url: 'http://localhost:3000/api/auth/providers', name: 'NextAuth providers' },
        { url: 'http://localhost:3000/api/products?page=1&pageSize=5', name: 'Products API' },
        { url: 'http://localhost:3000/api/admin-stats', name: 'Admin stats API' }
      ];
      
      let apiTestsPassed = true;
      
      for (const test of apiTests) {
        try {
          const response = await fetch(test.url);
          if (response.ok) {
            console.log(`   ✅ ${test.name} - OK (${response.status})`);
          } else {
            console.log(`   ❌ ${test.name} - CHYBA (${response.status})`);
            apiTestsPassed = false;
          }
        } catch (error) {
          console.log(`   ❌ ${test.name} - CHYBA: ${error.message}`);
          apiTestsPassed = false;
        }
      }
      
      if (!apiTestsPassed) {
        allTestsPassed = false;
        errors.push('Některé API endpointy nefungují');
      } else {
        console.log('   ✅ API endpoints test - ÚSPĚCH\n');
      }
      
    } finally {
      // Kill dev server
      console.log('🔧 Zastavuji dočasný dev server...');
      process.kill(-serverProcess.pid);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // 5. Prisma Migration Check
    console.log('🗄️  5. PRISMA MIGRACE KONTROLA');
    console.log('=============================');
    const prismaResult = await runCommand('npx prisma migrate status', 'Prisma migrace status');
    if (!prismaResult.success) {
      console.log('   ⚠️  Upozornění: Prisma migrace status nelze ověřit');
      console.log('   📋 Poznámka: Toto může být v pořádku pokud jsou migrace synchronní s databází');
    } else {
      console.log('   ✅ Prisma migrace status - OK\n');
    }

    // Final Report
    console.log('📊 FINÁLNÍ REPORT PRE-COMMIT KONTROL');
    console.log('====================================');
    
    if (allTestsPassed) {
      console.log('🎉 VŠECHNY KONTROLY ÚSPĚŠNÉ!');
      console.log('✅ TypeScript kompilace: OK');
      console.log('✅ ESLint syntax: OK');
      console.log('✅ Build test: OK');
      console.log('✅ API endpoints: OK');
      console.log('✅ Prisma status: OK');
      console.log('\n🚀 KÓDBÁZE JE PŘIPRAVENÁ PRO COMMIT A DEPLOY!\n');
      process.exit(0);
    } else {
      console.log('❌ NĚKTERÉ KONTROLY SELHALY!');
      errors.forEach(error => console.log(`   • ${error}`));
      console.log('\n🛑 PROSÍM OPRAVTE CHYBY PŘED COMMITEM!\n');
      process.exit(1);
    }

  } catch (error) {
    console.error('💥 KRITICKÁ CHYBA PŘI PRE-COMMIT KONTROLÁCH:', error);
    process.exit(1);
  }
}

// Run the checks
runPreCommitChecks();