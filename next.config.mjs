/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // ❌ eslint dan typescript tidak boleh lagi di sini
  // ✅ tapi kamu bisa atur di file terpisah (.eslintrc.json, tsconfig.json)

  typescript: {
    ignoreBuildErrors: true, // Masih boleh di sini ✅
  },

  images: {
    // ✅ gunakan remotePatterns alih-alih domains
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placeholder.com',
      },
    ],
    unoptimized: true,
  },
};

export default nextConfig;
