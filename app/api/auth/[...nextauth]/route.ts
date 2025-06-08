import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export const authOptions = {
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
    strategy: "jwt" as const,
  },
  pages: {
    signIn: '/auth/signin',
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }; 