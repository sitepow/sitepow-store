export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    try {
      const { prisma } = await import('@/lib/prisma')
      const { redis } = await import('@/lib/redis')
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
            .replace(/^www\./, '')
          await redis.set(`domain:slug:${cleanDomain}`, store.slug)
          await redis.set(`slug:domain:${store.slug}`, cleanDomain)
        }
      }
      console.log(
        `[Domain Sync] Synced ${stores.length} active custom domain(s) to Redis.`,
      )
    } catch (err) {
      console.error(
        '[Domain Sync] Failed to sync custom domains to Redis:',
        err,
      )
    }
  }
}
