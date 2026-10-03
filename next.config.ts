import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const nextConfig: NextConfig = {
  output: 'standalone',
  compress: true,
  poweredByHeader: false,
  experimental: {
    serverActions: {
      bodySizeLimit: '100mb',
      allowedOrigins: [
        '*.sitepow.store',
        'sitepow.store',
        '*.lvh.me',
        'lvh.me:3000',
      ],
    },
  },
  allowedDevOrigins: ['lvh.me', '*.lvh.me'],
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.sitepow.store',
      },
      {
        protocol: 'https',
        hostname: 'thesvg.org',
      },
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
      },
    ],
  },
}

const withNextIntl = createNextIntlPlugin()
export default withNextIntl(nextConfig)
