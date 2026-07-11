import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'
import path from 'path' // เพิ่มบรรทัดนี้

const withNextIntl = createNextIntlPlugin()

const nextConfig: NextConfig = {
  output: 'standalone',
  // ใช้ path.resolve เพื่อให้ได้ค่า Absolute Path ที่ถูกต้อง
  turbopack: {
    root: path.resolve(__dirname),
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '100mb',
    },
  },
  allowedDevOrigins: ['lvh.me', '*.lvh.me'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.sitepow.store',
        pathname: '/**',
      },
    ],
  },
}

export default withNextIntl(nextConfig)