import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

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
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email dan password harus diisi");
        }

        // 1️⃣ Cari user di database
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          throw new Error("Email tidak ditemukan");
        }

        // 2️⃣ Cek password
        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) {
          throw new Error("Password salah");
        }

        // 3️⃣ Return semua data yang ingin disimpan ke token/session
        return {
          id: user.id.toString(),
          name: user.name || "",
          email: user.email || "",
          role: user.role,
          createdAt: user.createdAt, // ✅ tambahkan ini
        };
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
    async jwt({ token, user }) {
      // 🧩 Saat user login pertama kali, simpan createdAt ke token
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.createdAt = (user as any).createdAt; // ✅ tambahkan ini
      }
      return token;
    },

    async session({ session, token }) {
      // 🧩 Bawa data createdAt ke session.user agar bisa diakses di Header
      if (token && session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).createdAt = token.createdAt; // ✅ tambahkan ini
      }
      return session;
    },
  },
});

export { handler as GET, handler as POST };
