import { cache } from 'react'
import { unstable_cache } from 'next/cache'

import { Prisma } from '@/generated/prisma/client'

import { prisma } from '@/lib/db/prisma'

const storeSelect = {
  id: true,
  name: true,
  description: true,
  logo: true,
  coverImage: true,
  primaryColor: true,
  status: true,
  plan: true,
  email: true,
  taxId: true,
  slug: true,
  ownerId: true,
  customDomain: true,
} satisfies Prisma.StoreSelect

export type StoreData = Prisma.StoreGetPayload<{
  select: typeof storeSelect
}>

const getCachedStore = (domain: string) =>
  unstable_cache(
    async () => {
      if (!domain) return null

      return await prisma.store.findUnique({
        where: { slug: domain },
        select: storeSelect,
      })
    },
    ['store-by-domain', domain],
    {
      revalidate: 300,
      tags: ['stores', `store:${domain}`, `store-domain:${domain}`],
    },
  )()

export const getStoreByDomain = cache(
  async (domain: string): Promise<StoreData | null> => {
    if (!domain) return null
    return await getCachedStore(domain)
  },
)
