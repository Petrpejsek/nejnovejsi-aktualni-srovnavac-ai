import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import type { NextAuthOptions } from 'next-auth';

// Funkce pro vytvoření admin konfigurace
export const createAuthOptions = (loginType: 'admin' | 'user' = 'user'): NextAuthOptions => ({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Heslo", type: "password" },
        loginType: { label: "Login Type", type: "hidden" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log('❌ Missing credentials');
          return null;
        }

        const currentLoginType = credentials.loginType || loginType; // použij parametr jako fallback
        console.log(`🔍 Login attempt: ${credentials.email} via ${currentLoginType}`);

        // 🚨 STRIKTNÍ KONTROLY NA ZAČÁTKU - PŘED VYTVOŘENÍM SESSION

        // 🚨 Blokace admin loginu v user login provideru
        if (currentLoginType === 'user' && credentials.email === 'admin@admin.com') {
          console.log('🚨 BLOCKED: Admin account cannot be used in user login');
          throw new Error('Admin account cannot be used in user login');
        }

        // 🚨 Blokace user loginu v admin login provideru  
        if (currentLoginType === 'admin' && credentials.email !== 'admin@admin.com') {
          console.log('🚨 BLOCKED: Only admin account can use admin login');
          throw new Error('Only admin account can use admin login');
        }

        // ✅ ADMIN LOGIN - pouze admin@admin.com a pouze z admin oblasti
        if (currentLoginType === 'admin' && credentials.email === "admin@admin.com" && credentials.password === "admin123") {
          console.log('✅ Admin login successful:', credentials.email);
          return { 
            id: "admin1", 
            name: "Super Admin", 
            email: "admin@admin.com",
            userType: 'admin',
            isAdmin: true,
            loginType: 'admin'
          };
        }

        // ✅ BĚŽNÍ UŽIVATELÉ - pouze z user oblasti, nikdy nejsou admin
        if (currentLoginType === 'user') {
          // Dodatečná kontrola - admin email nesmí projít
          if (credentials.email === 'admin@admin.com') {
            console.log('🚨 DOUBLE CHECK: Admin account blocked in user login');
            throw new Error('Admin account cannot be used in user login');
          }

          try {
            const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3001'
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
                console.log('✅ Regular user login successful:', credentials.email);
                return {
                  id: data.user.id,
                  name: data.user.name,
                  email: data.user.email,
                  userType: 'regular',
                  isAdmin: false,
                  loginType: 'user'
                };
              }
            }
          } catch (error) {
            console.error('User login failed:', error);
            throw new Error('Invalid user credentials');
          }
        }
        
        console.log('❌ Login failed for:', credentials.email);
        throw new Error('Invalid credentials');
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 2 * 60 * 60, // 2 hodiny
  },
  pages: {
    signIn: loginType === 'admin' ? '/auth/login' : '/user-area/login',
  },
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production' 
        ? (loginType === 'admin' ? `__Secure-next-auth.admin` : `__Secure-next-auth.user`)
        : (loginType === 'admin' ? `next-auth.admin` : `next-auth.user`),
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      }
    },
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.userType = (user as any).userType || 'regular';
        token.isAdmin = Boolean((user as any).isAdmin);
        token.loginType = (user as any).loginType || loginType;
        
        // Pro Google OAuth uživatele NIKDY nejsou admin a vždy user login
        if (account?.provider === 'google') {
          token.userType = 'regular';
          token.isAdmin = false;
          token.loginType = 'user';
        }
        
        console.log('JWT token created:', { 
          email: (user as any).email, 
          userType: token.userType, 
          isAdmin: token.isAdmin,
          loginType: token.loginType
        });
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).userType = token.userType;
        (session.user as any).isAdmin = Boolean(token.isAdmin);
        (session.user as any).loginType = token.loginType;
        
        console.log('Session created:', { 
          email: session.user.email, 
          userType: (session.user as any).userType, 
          isAdmin: (session.user as any).isAdmin,
          loginType: (session.user as any).loginType
        });
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      // Pro Google OAuth jednoduše povolíme přihlášení (ale NIKDY nejsou admin)
      if (account?.provider === 'google' && user.email) {
        console.log('Google OAuth přihlášení pro:', user.email, '(isAdmin: false, loginType: user)');
        return true;
      }
      
      return true;
    }
  },
});

// Default export pro admin login
export const authOptions = createAuthOptions('admin'); 