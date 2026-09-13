import { StoreStatus } from '@/generated/prisma/enums'

export interface SeoStoreLike {
  name: string
  slug?: string
  customDomain?: string | null
  coverImage?: string | null
  logo?: string | null
  status?: StoreStatus | string
  allowSearchEngineIndex?: boolean | null
  seoTitle?: string | null
  seoDescription?: string | null
  seoKeywords?: string | null
  description?: string | null
  baseCurrency?: string | null
}

export interface SeoProductImageLike {
  url: string
  isPrimary?: boolean
}

export interface SeoProductLike {
  id?: string
  title: string
  slug: string
  images?: SeoProductImageLike[]
  details?: unknown
  category?: { title: string } | null
  variants?: {
    id?: string
    price?: number | string | null
    isAvailable?: boolean
  }[]
  reviews?: {
    rating?: number
  }[]
  tags?: { name: string }[]
}

export interface SeoBlogLike {
  title: string
  slug: string
  image?: string | null
  content?: string
  createdAt?: Date | string
  tags?: string[]
}

/**
 * Returns the public canonical base URL for a store based on its custom domain or subdomain.
 */
export function getStoreUrl(
  store: { customDomain?: string | null } | null | undefined,
  domain: string,
): string {
  const storeDomain = store?.customDomain || domain
  if (!storeDomain) return 'https://sitepow.store'

  if (storeDomain.startsWith('http://') || storeDomain.startsWith('https://')) {
    return storeDomain.replace(/\/$/, '')
  }

  return storeDomain.includes('.')
    ? `https://${storeDomain}`
    : `https://${storeDomain}.sitepow.store`
}

/**
 * Ensures an image URL or path is fully qualified with the store's base URL.
 */
export function toAbsoluteUrl(pathOrUrl: string, baseUrl: string): string {
  if (!pathOrUrl) return baseUrl

  if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) {
    return pathOrUrl
  }

  try {
    const cleanedBase = baseUrl.replace(/\/$/, '')
    const cleanedPath = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`
    return new URL(cleanedPath, cleanedBase).toString()
  } catch {
    return pathOrUrl
  }
}

/**
 * Strips HTML tags, Markdown syntax, and extra whitespace to form a clean meta description.
 */
export function cleanDescription(
  content?: string | null,
  maxLength: number = 160,
): string {
  if (!content) return ''

  const cleaned = content
    // Remove code blocks
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`([^`]+)`/g, '$1')
    // Remove HTML tags
    .replace(/<[^>]+>/g, '')
    // Remove markdown images and links
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/\[([^\]]+)\]\(.*?\)/g, '$1')
    // Remove markdown headers, list markers, blockquotes
    .replace(/^[ \t]*[#*>+-]+[ \t]*/gm, '')
    // Remove bold and italics
    .replace(/[*_]{1,3}(.*?)[*_]{1,3}/g, '$1')
    // Normalize spaces and line breaks
    .replace(/\s+/g, ' ')
    .trim()

  if (cleaned.length <= maxLength) return cleaned
  return `${cleaned.slice(0, maxLength - 1).trim()}…`
}

/**
 * Fallback preview image resolution for product pages:
 * 1. Image with isPrimary === true
 * 2. Any image from product.images (e.g. first item)
 * 3. Store cover image (store.coverImage)
 * 4. Store logo (store.logo)
 * 5. Default fallback (/images/seo-cover.png)
 */
export function getProductPreviewImage(
  product: { images?: SeoProductImageLike[] } | null | undefined,
  store?: { coverImage?: string | null; logo?: string | null } | null,
  baseUrl?: string,
): string {
  const primaryImage = product?.images?.find((img) => img.isPrimary)?.url
  const anyImage = product?.images?.[0]?.url
  const storeCover = store?.coverImage
  const storeLogo = store?.logo
  const defaultFallback = '/images/seo-cover.png'

  const selectedImage =
    primaryImage || anyImage || storeCover || storeLogo || defaultFallback

  return baseUrl ? toAbsoluteUrl(selectedImage, baseUrl) : selectedImage
}

/**
 * Fallback preview image resolution for store / standard pages:
 * 1. Specific image passed in (e.g. blog image)
 * 2. Store cover image
 * 3. Store logo
 * 4. Default fallback (/images/seo-cover.png)
 */
export function getStorePreviewImage(
  store?: { coverImage?: string | null; logo?: string | null } | null,
  specificImage?: string | null,
  baseUrl?: string,
): string {
  const storeCover = store?.coverImage
  const storeLogo = store?.logo
  const defaultFallback = '/images/seo-cover.png'

  const selectedImage =
    specificImage || storeCover || storeLogo || defaultFallback

  return baseUrl ? toAbsoluteUrl(selectedImage, baseUrl) : selectedImage
}

/**
 * Standard Robots metadata generator based on store active status and search engine index setting.
 */
export function buildRobots(store?: SeoStoreLike | null) {
  const isSearchable =
    store?.status === StoreStatus.ACTIVE &&
    Boolean(store?.allowSearchEngineIndex ?? true)

  return isSearchable
    ? {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-video-preview': -1,
          'max-image-preview': 'large' as const,
          'max-snippet': -1,
        },
      }
    : {
        index: false,
        follow: false,
        nocache: true,
        googleBot: {
          index: false,
          follow: false,
        },
      }
}

/**
 * Generates Schema.org Product structured data (JSON-LD) for rich search snippets.
 */
export function generateProductJsonLd(
  product: SeoProductLike,
  store: SeoStoreLike,
  productUrl: string,
  previewImageUrl: string,
) {
  const prices = (product.variants || [])
    .map((v) => (v.price != null ? Number(v.price) : NaN))
    .filter((p) => !isNaN(p) && p >= 0)

  const minPrice = prices.length > 0 ? Math.min(...prices) : undefined
  const hasStock = (product.variants || []).some((v) => v.isAvailable !== false)

  const ratings = (product.reviews || [])
    .map((r) => r.rating)
    .filter((r): r is number => typeof r === 'number' && r > 0)

  const avgRating =
    ratings.length > 0
      ? (ratings.reduce((sum, r) => sum + r, 0) / ratings.length).toFixed(1)
      : undefined

  const details = product.details as Record<string, unknown> | null | undefined
  const rawDescription =
    typeof details?.description === 'string' ? details.description : ''
  const description =
    cleanDescription(rawDescription, 300) ||
    `${product.title} - ${store.name}`

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    image: [previewImageUrl],
    description,
    sku: product.variants?.[0]?.id || product.id || product.slug,
    category: product.category?.title || undefined,
    offers: minPrice !== undefined
      ? {
          '@type': 'Offer',
          price: minPrice,
          priceCurrency: store.baseCurrency || 'THB',
          availability: hasStock
            ? 'https://schema.org/InStock'
            : 'https://schema.org/OutOfStock',
          url: productUrl,
          seller: {
            '@type': 'Organization',
            name: store.name,
          },
        }
      : undefined,
    aggregateRating: avgRating
      ? {
          '@type': 'AggregateRating',
          ratingValue: avgRating,
          reviewCount: ratings.length,
        }
      : undefined,
  }
}

/**
 * Generates Schema.org BlogPosting structured data (JSON-LD).
 */
export function generateBlogJsonLd(
  blog: SeoBlogLike,
  store: SeoStoreLike,
  blogUrl: string,
  previewImageUrl: string,
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: blog.title,
    image: [previewImageUrl],
    url: blogUrl,
    datePublished: blog.createdAt
      ? new Date(blog.createdAt).toISOString()
      : undefined,
    author: {
      '@type': 'Organization',
      name: store.name,
    },
    publisher: {
      '@type': 'Organization',
      name: store.name,
      logo: store.logo ? { '@type': 'ImageObject', url: store.logo } : undefined,
    },
    description: cleanDescription(blog.content, 200),
  }
}

