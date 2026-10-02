import type { MetadataRoute } from 'next'

const BASE_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://sitepow.store'
    : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/merchant',
          '/merchant/*',
          '/api',
          '/api/*',
          '/sites',
          '/sites/*',
          '/user',
          '/user/*',
          '/auth',
          '/auth/*',
        ],
      },
      {
        userAgent: [
          'GPTBot',
          'ChatGPT-User',
          'PerplexityBot',
          'ClaudeBot',
          'Google-Extended',
          'Amazonbot',
          'Bytespider',
          'CCBot',
        ],
        allow: ['/', '/pricing', '/login', '/register'],
        disallow: [
          '/merchant',
          '/merchant/*',
          '/api',
          '/api/*',
          '/sites',
          '/sites/*',
          '/user',
          '/user/*',
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  }
}
