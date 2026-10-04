export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    try {
      const { prisma } = await import('@/lib/db/prisma')
      const { redis } = await import('@/lib/redis/client')
      const { DomainStatus } = await import('@/generated/prisma/enums')

      const stores = await prisma.store.findMany({
        where: {
          customDomain: { not: null },
          customDomainStatus: DomainStatus.ACTIVE,
        },
        select: {
          customDomain: true,
          slug: true,
        },
      })

      for (const store of stores) {
        if (store.customDomain && store.slug) {
          const cleanDomain = store.customDomain
            .toLowerCase()
            .trim()
            .replace(/^https?:\/\//, '')
            .replace(/\/.*$/, '')
            .replace(/^www\./, '')
          await redis.set(`domain:slug:${cleanDomain}`, store.slug)
          await redis.set(`domain:slug:www.${cleanDomain}`, store.slug)
          await redis.set(`slug:domain:${store.slug}`, cleanDomain)
        }
      }

      const storeDomains = await prisma.storeDomain.findMany({
        where: {
          status: DomainStatus.ACTIVE,
        },
        select: {
          domain: true,
          store: {
            select: { slug: true },
          },
        },
      })

      for (const sd of storeDomains) {
        if (sd.domain && sd.store?.slug) {
          const cleanDomain = sd.domain
            .toLowerCase()
            .trim()
            .replace(/^https?:\/\//, '')
            .replace(/\/.*$/, '')
            .replace(/^www\./, '')
          await redis.set(`domain:slug:${cleanDomain}`, sd.store.slug)
          await redis.set(`domain:slug:www.${cleanDomain}`, sd.store.slug)
          await redis.set(`slug:domain:${sd.store.slug}`, cleanDomain)
        }
      }

      console.log(
        `[Domain Sync] Synced ${stores.length + storeDomains.length} active custom domain(s) to Redis.`,
      )
    } catch (err) {
      console.error(
        '[Domain Sync] Failed to sync custom domains to Redis:',
        err,
      )
    }
  }
}
