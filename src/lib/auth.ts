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
    async signIn({ user, account }) {
      const discordId = account?.providerAccountId || user?.id;

      if (!discordId) {
        return false;
      }

      const allowedAdmins = (process.env.ADMIN_DISCORD_IDS || '')
        .split(',')
        .map((id) => id.replace(/['"]/g, '').trim());

      return allowedAdmins.includes(discordId);
    },
    async jwt({ token, user, account }) {
      if (account?.providerAccountId) {
        token.userId = account.providerAccountId;
      } else if (user && !token.userId) {
        token.userId = user.id;
      }

      // Generate or refresh the admin API token on every session validation
      const secret = process.env.HMAC_SECRET || '';
      const userId = token.userId as string;
      if (userId && secret.length >= 32) {
        try {
          const secretKey = new TextEncoder().encode(secret);
          const apiToken = await new SignJWT({ userId })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setIssuer('cipher-license')
            .setAudience('cipher-license-admin')
            .setExpirationTime('1h') // 1 hour validity (reduced from 24h)
            .sign(secretKey);
          token.apiToken = apiToken;
        } catch (err) {
          console.error("Token signing failed:", err);
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
