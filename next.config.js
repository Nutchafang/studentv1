/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // ลบ appDir: true ออกจากตรงนี้
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig
