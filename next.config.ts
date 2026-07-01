import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: ['lvh.me', '*.lvh.me'],
  images: {
    remotePatterns: [new URL('https://images.sitepow.store/**')],
  },
}

export default nextConfig
