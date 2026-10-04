import {
  DOMAIN_CACHE_TTL_SECONDS,
  DOMAIN_NOT_FOUND_CACHE_TTL_SECONDS,
} from '@/constants/system'
import { DomainStatus } from '@/generated/prisma/enums'

import { prisma } from '@/lib/prisma'
import { redis } from '@/lib/redis'

export async function getStoreSlugByDomain(
  hostname: string,
  origin?: string,
): Promise<string> {
  const cleanHostname = hostname
    .toLowerCase()
    .trim()
    .replace(/^https?:\/\//, '')
    .replace(/\/.*$/, '')
    .replace(/^www\./, '')

  if (!cleanHostname) {
    return ''
  }

  const cacheKey = `domain:slug:${cleanHostname}`

  try {
    const cachedSlug = await redis.get(cacheKey)
    if (cachedSlug) {
      if (cachedSlug === '__NOT_FOUND__') {
        return ''
      }
      return cachedSlug
    }
  } catch (err) {
    console.error('Redis error in domain-resolver:', err)
  }

  try {
    const storeDomain = await prisma.storeDomain.findFirst({
      where: {
        OR: [
          { domain: cleanHostname },
          { domain: `www.${cleanHostname}` },
          { domain: `${cleanHostname}/` },
          { domain: `www.${cleanHostname}/` },
        ],
        status: {
          in: [
            DomainStatus.ACTIVE,
            DomainStatus.PENDING,
            DomainStatus.VERIFIED,
          ],
        },
      },
      select: {
        store: {
          select: { slug: true },
        },
      },
    })

    let storeSlug = storeDomain?.store?.slug

    if (!storeSlug) {
      const store = await prisma.store.findFirst({
        where: {
          OR: [
            { customDomain: cleanHostname },
            { customDomain: `www.${cleanHostname}` },
            { customDomain: `${cleanHostname}/` },
            { customDomain: `www.${cleanHostname}/` },
          ],
        },
        select: { slug: true },
      })
      storeSlug = store?.slug
    }

    if (storeSlug) {
      await Promise.all([
        redis.setex(cacheKey, DOMAIN_CACHE_TTL_SECONDS, storeSlug), // 7 days
        redis.setex(
          `domain:slug:www.${cleanHostname}`,
          DOMAIN_CACHE_TTL_SECONDS,
          storeSlug,
        ),
        redis.setex(
          `slug:domain:${storeSlug}`,
          DOMAIN_CACHE_TTL_SECONDS,
          cleanHostname,
        ),
      ]).catch(console.error)
      return storeSlug
    }

    await redis
      .setex(cacheKey, DOMAIN_NOT_FOUND_CACHE_TTL_SECONDS, '__NOT_FOUND__')
      .catch(console.error)
  } catch (error) {
    console.error(
      `Failed to resolve domain "${cleanHostname}" via Prisma:`,
      error,
    )
  }

  return ''
}
