import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

// 🚀 UNIFIED AUTH ENDPOINT - handles all roles (user, admin, company)
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }; 