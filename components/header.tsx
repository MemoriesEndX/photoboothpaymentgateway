"use client";
import { useLanguage } from "@/hooks/use-language";
import LanguageSelector from "./language-selector";
import Image from "next/image";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { useState, useRef, useEffect } from "react";
import { Settings, LogOut } from "lucide-react";


export default function Header() {
  const { t } = useLanguage();
  const { data: session } = useSession();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Ambil data user
  const userName = session?.user?.name ?? "Guest";
  const userEmail = session?.user?.email ?? "";
  const roleVal = (session?.user as unknown as { role?: string })?.role;
  const createdAt = (session?.user as unknown as { createdAt?: string })?.createdAt;
  const userRole = typeof roleVal === "string" ? roleVal : "guest";

  // Format tanggal akun dibuat
  const formattedDate = createdAt
    ? new Date(createdAt).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Tidak diketahui";

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      Cookies.remove("user_role");
      Cookies.remove("user_email");
      await signOut({ redirect: false });
      router.push("/login");
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Tutup dropdown kalau klik di luar area menu
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="bg-gradient-to-r from-[#000000] via-[#111111] to-[#1a1a1a] text-white shadow-lg relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* 🖼️ Logo */}
        <Link href="/" className="flex items-center space-x-3">
          <div className='flex items-center justify-center'>
            <Image
              src="/Asset 220.png"
              alt="Memories End XYZ"
              width={170}
              height={170}
              className="object-contain drop-shadow-md"
              priority
            />
          </div>
        </Link>


          {/* 🌐 Tombol Navigasi Tengah */}
          <nav className="hidden md:flex items-center justify-center space-x-8 text-sm font-medium">
            {[
              { name: "Home", href: "/" },
              { name: "Demo", href: "/demo" },
              { name: "Privacy", href: "/privacy" },
              { name: "Support", href: "/support" },
              { name: "Terms", href: "/terms" },
              { name: "Users", href: "/users" },
            ].map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="relative px-3 py-2 text-gray-300 hover:text-white transition group"
              >
                <span>{item.name}</span>
                <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-gradient-to-r from-indigo-400 to-pink-500 group-hover:w-full transition-all duration-300 rounded-full"></span>
              </Link>
            ))}
          </nav>

          {/* 🌐 Kanan Header */}
          <div className="flex items-center space-x-4">
            <LanguageSelector />

            {/* Dropdown User */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((prev) => !prev)}
                className="flex items-center space-x-2 bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm hover:bg-white/20 transition"
              >
                <Image
                  src="/avatar/avatar-1.png"
                  alt="User Avatar"
                  width={28}
                  height={28}
                  className="rounded-full bg-white/30"
                />
                <span className="text-sm font-medium flex items-center gap-1 text-white">
                  {userRole === "GUEST" && userEmail === "guest@photobooth.com"
                    ? "Pengunjung"
                    : userName}
                  {userRole === "super_admin" && (
                    <span className="text-xs bg-white/30 text-white px-2 py-0.5 rounded-md font-semibold">
                      Super Admin
                    </span>
                  )}
                </span>
                <svg
                  className={`w-4 h-4 transition-transform ${menuOpen ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Popup Menu */}
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-[#1e1e1e] text-white rounded-lg shadow-lg py-3 animate-fadeIn border border-white/10">
                  <div className="px-4 pb-2 border-b border-white/10">
                    <p className="text-sm font-semibold">
                      Halo, {userRole === "GUEST" ? "Pengunjung" : userName}
                    </p>
                    <p className="text-xs text-gray-400">Akun sejak: {formattedDate}</p>
                  </div>

                  <button
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-white/10 transition"
                    onClick={() => router.push("/")}
                  >
                    <Settings size={16} />
                    Halaman Utama
                  </button>
                  <button
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-white/10 transition"
                    onClick={() => router.push("/login")}
                  >
                    <Settings size={16} />
                    Halaman Login
                  </button>

                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-600/20 transition"
                  >
                    <LogOut size={16} />
                    {isLoggingOut ? "Logging out..." : "Logout"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Animasi simple */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.15s ease-out;
        }
      `}</style>
    </header>
  );
}
