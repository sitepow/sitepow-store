import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const nextConfig: NextConfig = {
  output: 'standalone',
  experimental: {
    serverActions: {
      bodySizeLimit: '100mb',
    },
  },
  allowedDevOrigins: ['lvh.me', '*.lvh.me'],
  images: {
    remotePatterns: [new URL('https://images.sitepow.store/**')],
  },
}

const withNextIntl = createNextIntlPlugin()
export default withNextIntl(nextConfig)
