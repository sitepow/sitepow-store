import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://sitepow.store'
  const currentDate = new Date()

  return [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
      alternates: {
        languages: {
          th: `${baseUrl}/?lang=th`,
          en: `${baseUrl}/?lang=en`,
        },
      },
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
      alternates: {
        languages: {
          th: `${baseUrl}/pricing?lang=th`,
          en: `${baseUrl}/pricing?lang=en`,
        },
      },
    },
    {
      url: `${baseUrl}/register`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
      alternates: {
        languages: {
          th: `${baseUrl}/register?lang=th`,
          en: `${baseUrl}/register?lang=en`,
        },
      },
    },
    {
      url: `${baseUrl}/login`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
      alternates: {
        languages: {
          th: `${baseUrl}/login?lang=th`,
          en: `${baseUrl}/login?lang=en`,
        },
      },
    },
  ]
}
