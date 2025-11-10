"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, FormEvent } from "react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const formData = new FormData(event.currentTarget);
      const email = formData.get("email") as string;
      const password = formData.get("password") as string;

      // Validasi input
      if (!email || !password) {
        setError("Email dan password harus diisi");
        setLoading(false);
        return;
      }

      const response = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      // Jika ada error dari NextAuth
      if (response?.error) {
        if (response.error === "Email tidak ditemukan") {
          setError("Email tidak ditemukan. Silakan periksa kembali.");
        } else if (response.error === "Password salah") {
          setError("Password salah. Silakan coba lagi.");
        } else {
          setError("Login gagal. Periksa kembali email dan password Anda.");
        }
        setLoading(false);
        return;
      }

      // Jika login berhasil
      if (response?.ok) {
        router.push("/");
        router.refresh();
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Terjadi kesalahan saat login. Coba lagi nanti.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Card Container */}
        <div className="bg-white rounded-xl shadow-2xl p-8 space-y-6">
          {/* Header */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">
              Selamat Datang
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Masuk ke akun Anda untuk melanjutkan
            </p>
          </div>

          {/* Form */}
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Email Field */}
              <div>
                <label 
                  htmlFor="email" 
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  disabled={loading}
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="nama@email.com"
                />
              </div>

              {/* Password Field */}
              <div>
                <label 
                  htmlFor="password" 
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  disabled={loading}
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                <div className="flex items-center">
                  <svg 
                    className="w-5 h-5 mr-2 flex-shrink-0" 
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    <path 
                      fillRule="evenodd" 
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" 
                      clipRule="evenodd" 
                    />
                  </svg>
                  <span>{error}</span>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 disabled:bg-blue-400 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <>
                    <svg 
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" 
                      xmlns="http://www.w3.org/2000/svg" 
                      fill="none" 
                      viewBox="0 0 24 24"
                    >
                      <circle 
                        className="opacity-25" 
                        cx="12" 
                        cy="12" 
                        r="10" 
                        stroke="currentColor" 
                        strokeWidth="4"
                      />
                      <path 
                        className="opacity-75" 
                        fill="currentColor" 
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Memproses...
                  </>
                ) : (
                  "Masuk"
                )}
              </button>
            </div>
          </form>

          {/* Footer Links */}
          <div className="text-center space-y-2">
            <div className="text-sm">
              <Link 
                href="/register" 
                className="font-medium text-blue-600 hover:text-blue-500 transition duration-150"
              >
                Belum punya akun? Daftar di sini
              </Link>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <p className="mt-6 text-center text-xs text-gray-600">
          Dengan masuk, Anda menyetujui{" "}
          <Link href="/terms" className="text-blue-600 hover:underline">
            Syarat & Ketentuan
          </Link>{" "}
          dan{" "}
          <Link href="/privacy" className="text-blue-600 hover:underline">
            Kebijakan Privasi
          </Link>
        </p>
      </div>
    </div>
  );
}
