import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getToken } from 'next-auth/jwt';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

// 🔐 ADMIN REGISTRACE - POUZE PRO SUPER ADMINY
export async function POST(request: NextRequest) {
  try {
    // 1. Ověření autentifikace a oprávnění
    const token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET
    });

    if (!token || token.role !== 'admin') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Unauthorized - Admin access required' 
        },
        { status: 401 }
      );
    }

    console.log(`🔐 Admin registration request from: ${token.email}`);

    // 2. Parse request data
    const data = await request.json();
    const { name, email, password, role = 'admin' } = data;

    // 3. Validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Please fill all required fields (name, email, password)' 
        },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Please enter a valid email address' 
        },
        { status: 400 }
      );
    }

    // Password validation
    if (password.length < 8) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Password must be at least 8 characters long' 
        },
        { status: 400 }
      );
    }

    // Role validation
    const validRoles = ['admin', 'super_admin'];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid role. Must be admin or super_admin' 
        },
        { status: 400 }
      );
    }

    // 4. Check if admin already exists
    const existingAdmin = await prisma.admin.findUnique({
      where: { email }
    });

    if (existingAdmin) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'An admin with this email already exists' 
        },
        { status: 400 }
      );
    }

    // 5. Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // 6. Create new admin in database
    const newAdmin = await prisma.admin.create({
      data: {
        id: uuidv4(),
        name: name.trim(),
        email: email.toLowerCase().trim(),
        hashedPassword,
        role,
        isActive: true
      }
    });

    console.log(`✅ New admin created: ${newAdmin.email} (role: ${newAdmin.role}) by ${token.email}`);

    return NextResponse.json(
      { 
        success: true,
        message: 'Admin created successfully',
        admin: {
          id: newAdmin.id,
          name: newAdmin.name,
          email: newAdmin.email,
          role: newAdmin.role,
          isActive: newAdmin.isActive
        }
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('❌ Admin registration error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}

// 📋 GET - List all admins (super admin only)
export async function GET(request: NextRequest) {
  try {
    // Authentication check
    const token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET
    });

    if (!token || token.role !== 'admin') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Unauthorized - Admin access required' 
        },
        { status: 401 }
      );
    }

    // Get all admins (without passwords)
    const admins = await prisma.admin.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(
      { 
        success: true,
        admins
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('❌ Admin list error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}