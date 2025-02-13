import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

const handler = NextAuth({
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
        if (credentials?.email === "test@test.com" && credentials?.password === "test") {
          return { id: "1", name: "Test User", email: "test@test.com" };
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
});

export { handler as GET, handler as POST }; 