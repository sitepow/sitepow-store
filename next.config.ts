import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const nextConfig: NextConfig = {
  output: 'standalone',
  experimental: {
    serverActions: {
      bodySizeLimit: '100mb',
      allowedOrigins: [
        '*.sitepow.store',
        'sitepow.store',
        'manage.sitepow.store',
        '*.lvh.me',
        'lvh.me:3000',
        '*.lvh.me:3000',
        'manage.lvh.me:3000',
        '*.localhost',
        'localhost:3000',
      ],
    },
  },
  allowedDevOrigins: ['lvh.me', '*.lvh.me', 'localhost', '*.localhost'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.sitepow.store',
      },
      {
        protocol: 'https',
        hostname: '**.susercontent.com',
      },
      {
        protocol: 'https',
        hostname: '**.alicdn.com',
      },
      {
        protocol: 'https',
        hostname: '**.slatic.net',
      },
      {
        protocol: 'https',
        hostname: '**.tiktokcdn.com',
      },
      {
        protocol: 'https',
        hostname: '**.byteoversea.com',
      },
      {
        protocol: 'https',
        hostname: '**.ibytedtos.com',
      },
    ],
  },
}

const withNextIntl = createNextIntlPlugin()
export default withNextIntl(nextConfig)
