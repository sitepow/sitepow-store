import { TENANT_ORIGIN_CACHE_TTL_SECONDS } from '@/constants/system'
import { DomainStatus } from '@/generated/prisma/enums'

import { prisma } from '@/lib/prisma'
import { redis } from '@/lib/redis'

const ROOT_DOMAINS = ['sitepow.store', 'lvh.me', 'localhost']
const isProd = process.env.NODE_ENV === 'production'

export async function getTenantBaseUrl(
  storeSlugOrDomain: string,
): Promise<string> {
  const clean = storeSlugOrDomain
    .toLowerCase()
    .trim()
    .replace(/^https?:\/\//, '')
    .replace(/\/.*$/, '')
    .replace(/^www\./, '')

  if (!clean) {
    return isProd ? `https://${ROOT_DOMAINS[0]}` : 'http://localhost:3000'
  }

  const cacheKey = `tenant:base_url:${clean}`
  try {
    const cached = await redis.get(cacheKey)
    if (cached) {
      return cached
    }
  } catch (err) {
    console.error('Redis error in getTenantBaseUrl:', err)
  }

  try {
    const store = await prisma.store.findFirst({
      where: {
        OR: [
          { slug: clean },
          { customDomain: clean },
          { customDomain: `www.${clean}` },
          { StoreDomain: { some: { domain: clean } } },
        ],
      },
      select: {
        slug: true,
        customDomain: true,
        StoreDomain: {
          where: {
            status: {
              in: [DomainStatus.ACTIVE, DomainStatus.VERIFIED],
            },
          },
          orderBy: [{ isPrimary: 'desc' }, { updatedAt: 'desc' }],
          select: { domain: true },
          take: 1,
        },
      },
    })

    let origin = ''
    if (store) {
      const activeCustomDomain =
        store.StoreDomain[0]?.domain || store.customDomain

      if (activeCustomDomain) {
        origin = `https://${activeCustomDomain.replace(/^https?:\/\//, '').replace(/\/$/, '')}`
      } else {
        origin = isProd
          ? `https://${store.slug}.${ROOT_DOMAINS[0]}`
          : `http://${store.slug}.lvh.me:3000`
      }
    } else {
      origin = clean.includes('.')
        ? `https://${clean}`
        : isProd
          ? `https://${clean}.${ROOT_DOMAINS[0]}`
          : `http://${clean}.lvh.me:3000`
    }

    await redis
      .setex(cacheKey, TENANT_ORIGIN_CACHE_TTL_SECONDS, origin)
      .catch(console.error)
    return origin
  } catch (err) {
    console.error('Failed to get tenant base URL:', err)
    return isProd
      ? `https://${clean}.${ROOT_DOMAINS[0]}`
      : `http://${clean}.lvh.me:3000`
  }
}

export function cleanDescription(
  text?: string | null,
  maxLength = 160,
): string {
  if (!text) return ''
  const clean = text
    .replace(/<[^>]*>?/gm, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  if (clean.length <= maxLength) return clean
  return clean.slice(0, maxLength - 3).trim() + '...'
}
