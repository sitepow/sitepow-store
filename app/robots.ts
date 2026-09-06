import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/merchant/', '/api/', '/user/'],
      },
    ],
    sitemap: 'https://sitepow.store/sitemap.xml',
  }
}
