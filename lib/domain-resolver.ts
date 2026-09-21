import { redis } from '@/lib/redis'

export async function getStoreSlugByDomain(
  hostname: string,
  origin: string,
): Promise<string> {
  const cacheKey = `domain:slug:${hostname}`

  try {
    const cachedSlug = await redis.get(cacheKey)
    if (cachedSlug) {
      return cachedSlug
    }
  } catch (err) {
    console.error(err)
  }

  try {
    const resolveRes = await fetch(
      `${origin}/api/internal/resolve-domain?domain=${hostname}`,
      {
        headers: {
          'x-internal-secret': process.env.INTERNAL_API_SECRET || '',
        },
        next: { revalidate: 300 },
      },
    )

    if (resolveRes.ok) {
      const data = await resolveRes.json()
      const storeSlug = data.slug
      if (storeSlug) {
        await Promise.all([
          redis.setex(cacheKey, 3600, storeSlug),
          redis.setex(`slug:domain:${storeSlug}`, 3600, hostname),
        ])
        return storeSlug
      }
    }
  } catch (error) {
    console.error(error)
  }

  return ''
}
