import CredentialsProvider from 'next-auth/providers/credentials';
import type { NextAuthOptions } from 'next-auth';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Heslo", type: "password" }
      },
      async authorize(credentials) {
        // Zde by měla být implementace ověření přihlašovacích údajů
        // Pro testovací účely vracíme mock uživatele
        if (credentials?.email === "admin@admin.com" && credentials?.password === "admin123") {
          return { id: "1", name: "Super Admin", email: "admin@admin.com" };
        }
        return null;
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: '/auth/signin',
  },
}; 