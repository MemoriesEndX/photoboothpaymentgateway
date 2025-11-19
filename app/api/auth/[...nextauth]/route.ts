import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

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
          createdAt: user.createdAt,
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
    async signIn({ user }) {
      // 🔥 SINKRONISASI: Set cookie user_role saat login berhasil
      // Ini akan membuat middleware bisa langsung membaca role user
      try {
        const cookieStore = await cookies();
        if (user?.email && (user as any).role) {
          cookieStore.set("user_role", (user as any).role, { 
            path: "/",
            httpOnly: false, // Biar bisa diakses client-side juga
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7, // 7 hari
          });
          cookieStore.set("user_email", user.email, { 
            path: "/",
            httpOnly: false,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7,
          });
        }
      } catch (error) {
        console.error("Error setting cookies:", error);
      }
      return true; // Allow sign in
    },

    async jwt({ token, user }) {
      // 🧩 Saat user login pertama kali, simpan data ke token
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.createdAt = (user as any).createdAt;
      }
      return token;
    },

    async session({ session, token }) {
      // 🧩 Bawa data ke session.user agar bisa diakses di komponen
      if (token && session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).createdAt = token.createdAt;
      }
      return session;
    },
  },
});

export { handler as GET, handler as POST };
