import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  const requestId = `REQ-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  console.log('🚨 ===== ADMIN LOGIN START =====', requestId)
  
  try {
    console.log('🚨 ADMIN LOGIN START')
    
    // Parse request data
    const data = await request.json()
    console.log(`🔍 [${requestId}] RAW request data:`, data)
    
    const { email, password } = data
    console.log(`🔍 [${requestId}] EXTRACTED:`, { email, passwordLength: password?.length })
    
    // 🚨 FALLBACK LOGIC FIRST - NO DATABASE ACCESS! 🚨
    console.log(`🔍 [${requestId}] CHECKING FALLBACK CONDITIONS...`)
    console.log(`🔍 [${requestId}] email === "admin@admin.com":`, email === 'admin@admin.com')
    console.log(`🔍 [${requestId}] password === "admin123":`, password === 'admin123')
    
    if (email === 'admin@admin.com' && password === 'admin123') {
      console.log(`✅ [${requestId}] FALLBACK LOGIN SUCCESS - Bypassing database!`)
      console.log(`✅ [${requestId}] Returning admin success response`)
      console.log(`✅ [${requestId}] EARLY RETURN - No further code should execute!`)
      
      const successResponse = NextResponse.json(
        {
          success: true,
          admin: {
            id: 'admin-fallback-id',
            email: 'admin@admin.com',
            name: 'Super Admin',
            role: 'super_admin',
            isActive: true
          }
        },
        { status: 200 }
      )
      
      console.log(`✅ [${requestId}] SUCCESS RESPONSE CREATED - EXITING NOW!`)
      return successResponse
    }
    
    console.log(`❌ [${requestId}] FALLBACK NOT TRIGGERED - email or password mismatch`)
    console.log(`❌ [${requestId}] Proceeding to database validation (will likely fail)`)

    // === DATABASE LOGIC (only if fallback fails) ===

    // Validation (only after fallback check)
    if (!email || !password) {
      console.log('❌ Missing email or password')
      return NextResponse.json(
        { 
          success: false, 
          error: 'Email and password are required' 
        },
        { status: 400 }
      )
    }

    // Find admin in database (ONLY if not fallback)
    console.log(`🔍 [${requestId}] Looking for admin in database:`, email)
    console.log(`🚨 [${requestId}] DATABASE CALL - This should NOT happen for fallback!`)
    
    let admin = null
    try {
      admin = await prisma.admin.findUnique({
        where: { email }
      })

      if (!admin) {
        console.log('❌ Admin not found in database:', email)
        return NextResponse.json(
          { 
            success: false, 
            error: 'Invalid email or password' 
          },
          { status: 401 }
        )
      }

      console.log('✅ Admin found in database:', { id: admin.id, email: admin.email, isActive: admin.isActive })
      
      // Check if admin is active
      if (!admin.isActive) {
        console.log('❌ Admin account is disabled')
        return NextResponse.json(
          { 
            success: false, 
            error: 'Account is disabled' 
          },
          { status: 403 }
        )
      }

      // Check password
      console.log('🔍 Verifying password...')
      const isValidPassword = await bcrypt.compare(password, admin.hashedPassword)

      if (!isValidPassword) {
        console.log('❌ Invalid password for admin:', email)
        return NextResponse.json(
          { 
            success: false, 
            error: 'Invalid email or password' 
          },
          { status: 401 }
        )
      }

      console.log('✅ Password verified, updating last login...')
      // Update last login
      await prisma.admin.update({
        where: { id: admin.id },
        data: { lastLoginAt: new Date() }
      })

      console.log('✅ Admin login successful:', admin.email)
      return NextResponse.json({
        success: true,
        message: 'Admin login successful',
        admin: {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          role: admin.role
        }
      })
      
    } catch (error) {
      console.log('❌ Database error (Admin table might not exist):', error instanceof Error ? error.message : String(error))
      // If admin table doesn't exist, deny access for non-fallback emails
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid email or password' 
        },
        { status: 401 }
      )
    }

  } catch (error) {
    console.error('❌ Admin login error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'An error occurred during login' 
      },
      { status: 500 }
    )
  }
} 