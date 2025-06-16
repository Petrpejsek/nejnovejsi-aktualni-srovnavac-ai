import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import type { NextAuthOptions } from 'next-auth';

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
        password: { label: "Heslo", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Try to login with our user API
          const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
          const response = await fetch(`${baseUrl}/api/users/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password
            })
          });

          if (response.ok) {
            const data = await response.json();
            if (data.success) {
              return {
                id: data.user.id,
                name: data.user.name,
                email: data.user.email,
                userType: 'regular'
              };
            }
          }
        } catch (error) {
          console.error('User login failed:', error);
        }

        // Fallback to admin login for backward compatibility
        if (credentials?.email === "admin@admin.com" && credentials?.password === "admin123") {
          return { 
            id: "admin1", 
            name: "Super Admin", 
            email: "admin@admin.com",
            userType: 'admin'
          };
        }
        
        return null;
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: '/',
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.userType = (user as any).userType || 'regular';
        
        // Pro Google OAuth uživatele nastavíme userType na 'regular'
        if (account?.provider === 'google') {
          token.userType = 'regular';
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        (session.user as any).userType = token.userType;
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      // Pro Google OAuth jednoduše povolíme přihlášení
      if (account?.provider === 'google' && user.email) {
        console.log('Google OAuth přihlášení pro:', user.email);
        return true;
      }
      
      return true;
    }
  },
}; 