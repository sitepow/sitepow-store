import { redis } from '@/lib/redis'

export async function getStoreSlugByDomain(
  hostname: string,
  origin?: string,
): Promise<string> {
  const cleanHostname = hostname.toLowerCase().trim()
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

  const internalPort = process.env.PORT || '3000'
  const internalApiBase =
    process.env.INTERNAL_API_URL || `http://127.0.0.1:${internalPort}`
  const internalSecret = process.env.INTERNAL_API_SECRET || ''

  try {
    const resolveRes = await fetch(
      `${internalApiBase}/api/internal/resolve-domain?domain=${encodeURIComponent(cleanHostname)}`,
      {
        headers: {
          'x-internal-secret': internalSecret,
        },
        signal: AbortSignal.timeout(3000),
      },
    )

    if (resolveRes.ok) {
      const data = (await resolveRes.json()) as { slug?: string }
      const storeSlug = data.slug
      if (storeSlug) {
        await Promise.all([
          redis.setex(cacheKey, 604800, storeSlug), // 7 days
          redis.setex(`slug:domain:${storeSlug}`, 604800, cleanHostname),
        ]).catch(console.error)
        return storeSlug
      }
    }

    // Cache negative lookup for 5 minutes so invalid domains / bots don't hit the internal endpoint repeatedly
    await redis.setex(cacheKey, 300, '__NOT_FOUND__').catch(console.error)
  } catch (error) {
    console.error(
      `Failed to resolve domain "${cleanHostname}" via internal API:`,
      error,
    )
  }

  return ''
}
