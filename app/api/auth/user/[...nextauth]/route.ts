import NextAuth from 'next-auth';
import { createAuthOptions } from '@/lib/auth';

// Použij user konfiguraci
const userAuthOptions = createAuthOptions('user');

const handler = NextAuth(userAuthOptions);

export { handler as GET, handler as POST }; 