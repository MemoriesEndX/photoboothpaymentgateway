import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ error: "Email tidak ditemukan" }, { status: 404 });
    }

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return NextResponse.json({ error: "Password salah" }, { status: 401 });
    }

    // jika cocok
    const res = NextResponse.json({ success: true, message: "Login berhasil" });
    // Only set cookies when values are non-null/defined and are strings
    if (typeof user.role === "string" && user.role) {
      res.cookies.set("user_role", user.role, { path: "/" });
    }
    if (typeof user.email === "string" && user.email) {
      res.cookies.set("user_email", user.email, { path: "/" });
    }
    return res;

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Terjadi kesalahan di server" }, { status: 500 });
  }
}
