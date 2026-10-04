import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',
  compress: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  experimental: {
    optimizePackageImports: [
      '@tabler/icons-react',
      'lucide-react',
      'radix-ui',
      '@tanstack/react-query',
    ],
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
    qualities: [65, 75],
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

export default nextConfig
