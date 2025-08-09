import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import type { NextAuthOptions } from 'next-auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// 🚀 DATABÁZOVÝ AUTH SYSTÉM - JEDEN ENDPOINT PRO VŠECHNY ROLE (admin, company, user)
export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
        role: { label: "Role", type: "hidden" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log('❌ Missing credentials');
          return null;
        }

        const email = credentials.email;
        const password = credentials.password;
        const role = credentials.role || 'user'; // default role
        
        console.log(`🔍 Login attempt: ${email} (role: ${role})`);

        try {
          // 🔐 ADMIN ACCOUNTS - Database authentication
          if (role === 'admin') {
            const admin = await prisma.admin.findUnique({
              where: { email }
            });

            if (!admin) {
              console.log('❌ Admin not found in database');
              return null;
            }

            if (!admin.isActive) {
              console.log('❌ Admin account is disabled');
              return null;
            }

            const isValidPassword = await bcrypt.compare(password, admin.hashedPassword);
            if (!isValidPassword) {
              console.log('❌ Invalid admin password');
              return null;
            }

            // Update last login
            await prisma.admin.update({
              where: { id: admin.id },
              data: { lastLoginAt: new Date() }
            });

            console.log('✅ Admin login successful');
            return {
              id: admin.id,
              name: admin.name,
              email: admin.email,
              role: 'admin',
              isAdmin: true
            };
          }

          // 🏢 COMPANY ACCOUNTS - Database authentication
          if (role === 'company') {
            const company = await prisma.company.findUnique({
              where: { email }
            });

            if (!company) {
              console.log('❌ Company not found in database');
              return null;
            }

            if (company.status !== 'active' && company.status !== 'approved') {
              console.log('❌ Company account not approved');
              return null;
            }

            const isValidPassword = await bcrypt.compare(password, company.hashedPassword);
            if (!isValidPassword) {
              console.log('❌ Invalid company password');
              return null;
            }

            // Update last login and activate if approved
            const updateData: any = { lastLoginAt: new Date() };
            if (company.status === 'approved') {
              updateData.status = 'active';
            }

            await prisma.company.update({
              where: { id: company.id },
              data: updateData
            });

            console.log('✅ Company login successful');
            return {
              id: company.id,
              name: company.name,
              email: company.email,
              role: 'company',
              isAdmin: false
            };
          }

          // 👤 USER ACCOUNTS - Database authentication
          if (role === 'user' || !role) {
            const user = await prisma.user.findUnique({
              where: { email }
            });

            if (!user) {
              console.log('❌ User not found in database');
              return null;
            }

            if (!user.isActive) {
              console.log('❌ User account is disabled');
              return null;
            }

            // Check if user has password (Google OAuth users don't have hashed password)
            if (!user.hashedPassword) {
              console.log('❌ User must use Google login');
              return null;
            }

            const isValidPassword = await bcrypt.compare(password, user.hashedPassword);
            if (!isValidPassword) {
              console.log('❌ Invalid user password');
              return null;
            }

            // Update last login
            await prisma.user.update({
              where: { id: user.id },
              data: { lastLoginAt: new Date() }
            });

            console.log('✅ User login successful');
            return {
              id: user.id,
              name: user.name,
              email: user.email,
              role: 'user',
              isAdmin: false
            };
          }

          console.log('❌ Unknown role:', role);
          return null;

        } catch (error) {
          console.error('❌ Database authentication error:', error);
          return null;
        }
      },
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 2 * 60 * 60, // 2 hours
  },
  pages: {
    signIn: '/auth/login', // Default admin login page
  },
  callbacks: {
    // Force correct callback/base URL in production to avoid stale domain issues
    async redirect({ url, baseUrl }) {
      const forced = process.env.NEXTAUTH_URL || process.env.NEXTAUTH_CALLBACK_URL || 'http://localhost:3000'
      // Only allow relative or same-origin redirects
      try {
        const u = new URL(url, forced)
        const allowedBase = new URL(forced)
        if (u.origin === allowedBase.origin) return u.toString()
        return allowedBase.toString()
      } catch {
        return forced
      }
    },
    async jwt({ token, user, account }) {
      if (user) {
        // Set role from user object
        token.role = (user as any).role || 'user';
        token.isAdmin = Boolean((user as any).isAdmin);
        
        // Google OAuth users are always 'user' role
        if (account?.provider === 'google') {
          token.role = 'user';
          token.isAdmin = false;
        }
        
        console.log('🔍 JWT token created:', { 
          email: user.email, 
          role: token.role, 
          isAdmin: token.isAdmin
        });
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        // Add role to session
        (session.user as any).role = token.role;
        (session.user as any).isAdmin = Boolean(token.isAdmin);
        
        console.log('🔍 Session created:', { 
          email: session.user.email, 
          role: (session.user as any).role, 
          isAdmin: (session.user as any).isAdmin
        });
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      // Handle Google OAuth users - create in database if not exists
      if (account?.provider === 'google' && user.email) {
        try {
          let dbUser = await prisma.user.findUnique({
            where: { email: user.email }
          });

          if (!dbUser) {
            // Create new user from Google OAuth
            const generatedName = user.name || user.email!.split('@')[0];
            
            dbUser = await prisma.user.create({
              data: {
                id: crypto.randomUUID(),
                name: generatedName,
                email: user.email,
                hashedPassword: null, // Google OAuth users don't have password
                googleId: user.id,
                avatar: user.image,
                isActive: true
              }
            });
            
            console.log('✅ New Google user created:', user.email);
          } else {
            // Update existing user's last login
            await prisma.user.update({
              where: { id: dbUser.id },
              data: { 
                lastLoginAt: new Date(),
                googleId: user.id, // Update Google ID if missing
                avatar: user.image // Update avatar if changed
              }
            });
          }

          console.log('✅ Google OAuth login approved:', user.email, '(role: user)');
          return true;
        } catch (error) {
          console.error('❌ Google OAuth database error:', error);
          return false;
        }
      }
      
      console.log('✅ Credentials login approved');
      return true;
    }
  },
};