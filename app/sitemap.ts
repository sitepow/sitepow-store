import type { MetadataRoute } from 'next'

const BASE_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://sitepow.store'
    : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export default function sitemap(): MetadataRoute.Sitemap {
  const currentDate = new Date()

  const generateLanguageAlternates = (path = '') => ({
    languages: {
      th: `${BASE_URL}${path}${path.includes('?') ? '&' : '?'}lang=th`,
      en: `${BASE_URL}${path}${path.includes('?') ? '&' : '?'}lang=en`,
      'zh-Hans': `${BASE_URL}${path}${path.includes('?') ? '&' : '?'}lang=cn`,
      'x-default': `${BASE_URL}${path}`,
    },
  })

  return [
    {
      url: BASE_URL,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
      alternates: generateLanguageAlternates(''),
    },
    {
      url: `${BASE_URL}/pricing`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
      alternates: generateLanguageAlternates('/pricing'),
    },
    {
      url: `${BASE_URL}/register`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
      alternates: generateLanguageAlternates('/register'),
    },
    {
      url: `${BASE_URL}/login`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.5,
      alternates: generateLanguageAlternates('/login'),
    },
  ]
}
