import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import prisma from "@/lib/prisma"; // pastikan kamu punya prisma client di sini

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    // Cek apakah email sudah terdaftar
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email sudah digunakan" },
        { status: 400 }
      );
    }

    // Enkripsi password
    const hashedPassword = await hash(password, 10);

    // Simpan user baru
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "GUEST", // role default
      },
    });

    return NextResponse.json({
      message: "Registrasi berhasil",
      user: { id: newUser.id, name: newUser.name, email: newUser.email },
    });
  } catch (error) {
    console.error("Register Error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 });
  }
}
