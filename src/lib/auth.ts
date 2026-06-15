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
    async signIn({ user, account, profile }) {
      const discordId = account?.providerAccountId || user?.id;
      console.log("[Auth Debug] SignIn Attempt:", {
        userId: user?.id,
        providerAccountId: account?.providerAccountId,
        profileId: profile?.id,
        allowedAdminsRaw: process.env.ADMIN_DISCORD_IDS
      });

      if (!discordId) {
        console.warn("[Auth Debug] Denied: No Discord ID resolved.");
        return false;
      }

      const allowedAdmins = (process.env.ADMIN_DISCORD_IDS || '')
        .split(',')
        .map((id) => id.replace(/['"]/g, '').trim());

      const isAllowed = allowedAdmins.includes(discordId);
      console.log("[Auth Debug] Access Check:", {
        resolvedId: discordId,
        isAllowed,
        matchedInList: allowedAdmins
      });

      return isAllowed;
    },
    async jwt({ token, user }) {
      if (user) {
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
            .setIssuer('astrox-license')
            .setAudience('astrox-license-admin')
            .setExpirationTime('24h') // 24 hours validity
            .sign(secretKey);
          token.apiToken = apiToken;
        } catch (err) {
          console.error("[Auth Debug] Token signing failed:", err);
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
