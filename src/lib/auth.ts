import NextAuth from 'next-auth';
import DiscordProvider from 'next-auth/providers/discord';
import { SignJWT } from 'jose/jwt/sign';

declare module 'next-auth' {
  interface Session {
    apiToken?: string;
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID || '',
      clientSecret: process.env.DISCORD_CLIENT_SECRET || '',
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (!user.id) return false;
      const allowedAdmins = (process.env.ADMIN_DISCORD_IDS || '')
        .split(',')
        .map((id) => id.trim());
      if (allowedAdmins.includes(user.id)) {
        return true;
      }
      return false; // Deny access
    },
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;

        // Generate an admin API token signed with the shared HMAC_SECRET
        const secret = process.env.HMAC_SECRET || '';
        if (secret.length >= 32) {
          const secretKey = new TextEncoder().encode(secret);
          const apiToken = await new SignJWT({ userId: user.id })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setIssuer('astrox-license')
            .setAudience('astrox-license-admin')
            .setExpirationTime('5m') // 5 minutes validity
            .sign(secretKey);
          token.apiToken = apiToken;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.userId as string;
        session.apiToken = token.apiToken as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
});
