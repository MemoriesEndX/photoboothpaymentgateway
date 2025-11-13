import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(req: NextRequest) {
  const url = req.nextUrl.clone();

  // Cek apakah user sudah punya cookie "user_role"
  const userRole = req.cookies.get("user_role")?.value;

  // Kalau belum ada -> set otomatis sebagai GUEST
  if (!userRole) {
    const res = NextResponse.next();
    res.cookies.set("user_role", "GUEST", { path: "/" });
    res.cookies.set("user_email", "guest@photobooth.com", { path: "/" });
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/:path*"], // biar jalan di semua route
};
