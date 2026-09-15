import type { MetadataRoute } from 'next'

import { getStaticBlogs } from '@/constants/blogs'
import { FEATURE_METAS } from '@/constants/features'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://sitepow.store'
  const currentDate = new Date()

  const staticRoutes: MetadataRoute.Sitemap = [
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
      url: `${baseUrl}/features`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
      alternates: {
        languages: {
          th: `${baseUrl}/features?lang=th`,
          en: `${baseUrl}/features?lang=en`,
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
      url: `${baseUrl}/pricing/buyout`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
      alternates: {
        languages: {
          th: `${baseUrl}/pricing/buyout?lang=th`,
          en: `${baseUrl}/pricing/buyout?lang=en`,
        },
      },
    },
    {
      url: `${baseUrl}/download-pos`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
      alternates: {
        languages: {
          th: `${baseUrl}/download-pos?lang=th`,
          en: `${baseUrl}/download-pos?lang=en`,
        },
      },
    },
    {
      url: `${baseUrl}/blogs`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
      alternates: {
        languages: {
          th: `${baseUrl}/blogs?lang=th`,
          en: `${baseUrl}/blogs?lang=en`,
        },
      },
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
      alternates: {
        languages: {
          th: `${baseUrl}/contact?lang=th`,
          en: `${baseUrl}/contact?lang=en`,
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

  const featureRoutes: MetadataRoute.Sitemap = FEATURE_METAS.map((feature) => ({
    url: `${baseUrl}/features/${feature.slug}`,
    lastModified: currentDate,
    changeFrequency: 'weekly',
    priority: 0.85,
    alternates: {
      languages: {
        th: `${baseUrl}/features/${feature.slug}?lang=th`,
        en: `${baseUrl}/features/${feature.slug}?lang=en`,
      },
    },
  }))

  const blogs = getStaticBlogs('th')
  const blogRoutes: MetadataRoute.Sitemap = blogs.map((blog) => ({
    url: `${baseUrl}/blogs/${blog.slug}`,
    lastModified: new Date(blog.createdAt),
    changeFrequency: 'weekly',
    priority: 0.85,
    alternates: {
      languages: {
        th: `${baseUrl}/blogs/${blog.slug}?lang=th`,
        en: `${baseUrl}/blogs/${blog.slug}?lang=en`,
      },
    },
  }))

  return [...staticRoutes, ...featureRoutes, ...blogRoutes]
}
