import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Format data tidak valid (JSON tidak dapat dibaca)" },
        { status: 400 }
      );
    }

    const { name, email, password } = body || {};

    // Validasi input email
    if (!email || typeof email !== "string" || !email.trim()) {
      return NextResponse.json(
        { error: "Email wajib diisi" },
        { status: 400 }
      );
    }

    const sanitizedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sanitizedEmail)) {
      return NextResponse.json(
        { error: "Format email tidak valid" },
        { status: 400 }
      );
    }

    // Validasi input password
    if (!password || typeof password !== "string" || password.length < 6) {
      return NextResponse.json(
        { error: "Password wajib diisi dan minimal 6 karakter" },
        { status: 400 }
      );
    }

    // Validasi input name (opsional)
    const sanitizedName = typeof name === "string" && name.trim() ? name.trim() : null;

    // Cek apakah email sudah terdaftar
    const existingUser = await prisma.user.findUnique({
      where: { email: sanitizedEmail },
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
        name: sanitizedName,
        email: sanitizedEmail,
        password: hashedPassword,
        role: "GUEST",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      message: "Registrasi berhasil",
      user: { id: newUser.id, name: newUser.name, email: newUser.email },
    }, { status: 201 });
  } catch (error) {
    console.error("Register Error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan di server" }, { status: 500 });
  }
}
