import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

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
        interface UserWithRole { role?: string; createdAt?: Date }
        const userWithRole = user as UserWithRole;
        if (user?.email && userWithRole.role) {
          cookieStore.set("user_role", userWithRole.role, { 
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
        interface UserWithRole { role?: string; createdAt?: Date }
        const userWithRole = user as UserWithRole;
        token.id = user.id;
        token.role = userWithRole.role;
        token.createdAt = userWithRole.createdAt;
      }
      return token;
    },

    async session({ session, token }) {
      // 🧩 Bawa data ke session.user agar bisa diakses di komponen
      if (token && session.user) {
        interface SessionUserExtended { id?: string; role?: string; createdAt?: Date }
        const extendedUser = session.user as SessionUserExtended;
        extendedUser.id = token.id as string;
        extendedUser.role = token.role as string;
        extendedUser.createdAt = token.createdAt as Date;
      }
      return session;
    },
  },
});

export { handler as GET, handler as POST };
