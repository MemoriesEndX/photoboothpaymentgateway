import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * 🔒 Middleware Autentikasi Next.js 15
 * 
 * ATURAN:
 * 1. Tanpa cookie user_role → redirect ke /login
 * 2. Role GUEST → tidak boleh akses /admin/*
 * 3. Role SUPERADMIN → bebas akses semua, auto-redirect dari "/" ke "/admin"
 * 4. User sudah login → tidak bisa akses /login atau /register
 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  // Ambil cookie user_role
  const userRole = req.cookies.get("user_role")?.value;
  
  // ======================================
  // PUBLIC ROUTES - Bebas diakses tanpa login
  // ======================================
  const publicRoutes = [
    "/login", 
    "/register", 
    "/privacy", 
    "/terms", 
    "/support", 
    "/demo"
  ];
  
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
  
  // ======================================
  // 1️⃣ TIDAK ADA COOKIE user_role
  // ======================================
  if (!userRole) {
    // Jika user belum login DAN bukan di public route → redirect ke /login
    if (!isPublicRoute) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname); // Simpan URL tujuan
      return NextResponse.redirect(loginUrl);
    }
    
    // Jika di public route → boleh akses
    return NextResponse.next();
  }
  
  // ======================================
  // 2️⃣ ADA COOKIE user_role (User sudah login)
  // ======================================
  
  // A. Cegah user yang sudah login akses /login atau /register
  if (pathname === "/login" || pathname === "/register") {
    if (userRole === "SUPERADMIN") {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
    if (userRole === "GUEST") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }
  
  // B. GUEST tidak boleh akses /admin/*
  if (userRole === "GUEST" && pathname.startsWith("/admin")) {
    return NextResponse.redirect(new URL("/", req.url));
  }
  
  // C. SUPERADMIN auto-redirect dari "/" ke "/admin"
  if (userRole === "SUPERADMIN" && pathname === "/") {
    return NextResponse.redirect(new URL("/admin", req.url));
  }
  
  // D. SUPERADMIN bebas akses semua route lainnya
  // E. GUEST bebas akses semua route non-admin
  return NextResponse.next();
}

/**
 * 🎯 Matcher Configuration
 * 
 * Middleware akan berjalan pada semua route KECUALI:
 * - API routes (/api/*)
 * - Static files (_next/static, _next/image)
 * - Public assets (favicon, manifest, robots, sitemap, images, fonts)
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, manifest.json, robots.txt, sitemap.xml
     * - Public assets: svg, png, jpg, jpeg, gif, webp, ico, woff, woff2, ttf, eot
     */
    "/((?!api|_next/static|_next/image|favicon.ico|manifest.json|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|eot)$).*)",
  ],
};
