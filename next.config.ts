import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: ['lvh.me', '*.lvh.me'],
  images: {
    remotePatterns: [new URL('https://images.sitepow.store/**')],
  },
}

const withNextIntl = createNextIntlPlugin()
export default withNextIntl(nextConfig)
