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
    remotePatterns: [new URL('https://images.sitepow.store/**')],
  },
}

const withNextIntl = createNextIntlPlugin()
export default withNextIntl(nextConfig)
