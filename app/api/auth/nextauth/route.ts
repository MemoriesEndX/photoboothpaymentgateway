import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import type { User } from "next-auth";

const prisma = new PrismaClient();

const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      // authorize must accept (credentials, req) and return a User | null
      async authorize(credentials, req): Promise<User | null> {
        const creds = credentials as { email?: string; password?: string } | undefined;
        if (!creds?.email || !creds?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: creds.email },
        });

        if (!user) return null;

        // check password (if not hashed yet, allow plain compare)
        const isPasswordValid =
          user.password === creds.password ||
          (await bcrypt.compare(creds.password, user.password));

        if (!isPasswordValid) return null;

        return {
          id: user.id.toString(),
          name: user.name || "User",
          email: user.email,
          role: user.role,
        } as unknown as User;
      },
    }),
  ],

  pages: {
    signIn: "/login",
  },

  session: {
    strategy: "jwt",
  },

  callbacks: {
    // NextAuth v5-style callbacks: single params object
    async jwt(params: unknown) {
      type TokenWithRole = Record<string, unknown> & { role?: string | null };
      type UserWithRole = Record<string, unknown> & { role?: string | null };
      const p = params as { token: TokenWithRole; user?: UserWithRole };
      const { token, user } = p;
      if (user) token.role = user.role ?? token.role;
      return token as unknown as Record<string, unknown>;
    },
    async session(params: unknown) {
      type TokenWithRole = Record<string, unknown> & { role?: string | null };
      const p = params as { session: Record<string, unknown>; token: TokenWithRole };
      const { session, token } = p;
      if (session?.user) {
        (session.user as Record<string, unknown>).role = token.role ?? (session.user as any).role;
      }
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions as any);

export { handler as GET, handler as POST };
import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import type { User } from "next-auth";

const prisma = new PrismaClient();

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) return null;

        // cek password (sementara kalau belum hash, pakai perbandingan langsung)
        const authOptions: NextAuthOptions = {
          providers: [
            CredentialsProvider({
              name: "Credentials",
              credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
              },
              // authorize must accept (credentials, req) and return a User | null
              async authorize(credentials, req): Promise<User | null> {
                const creds = credentials as { email?: string; password?: string } | undefined;
                if (!creds?.email || !creds?.password) return null;

                const user = await prisma.user.findUnique({
                  where: { email: creds.email },
                });

                if (!user) return null;

                // cek password (sementara kalau belum hash, pakai perbandingan langsung)
                const isPasswordValid =
                  user.password === creds.password ||
                  (await bcrypt.compare(creds.password, user.password));

                if (!isPasswordValid) return null;

                // Return object matching `User` shape. Cast to `User` to satisfy types.
                return {
                  id: user.id.toString(),
                  name: user.name || "User",
                  email: user.email,
                  role: user.role,
                } as unknown as User;
              },
            }),
          ],

          pages: {
            signIn: "/login",
          },

          session: {
            strategy: "jwt",
          },

          callbacks: {
            // Follow NextAuth v5 callback signature: receive single params object
            async jwt(params: unknown) {
              type TokenWithRole = Record<string, unknown> & { role?: string | null };
              type UserWithRole = Record<string, unknown> & { role?: string | null };
              const p = params as { token: TokenWithRole; user?: UserWithRole };
              const { token, user } = p;
              if (user) {
                token.role = user.role ?? token.role;
              }
              return token as unknown as Record<string, unknown>;
            },
            async session(params: unknown) {
              type TokenWithRole = Record<string, unknown> & { role?: string | null };
              const p = params as { session: Record<string, any>; token: TokenWithRole };
              const { session, token } = p;
              if (session?.user) {
                (session.user as Record<string, unknown>).role = token.role ?? (session.user as any).role;
              }
              return session;
            },
          },
        };

        const handler = NextAuth(authOptions);
  