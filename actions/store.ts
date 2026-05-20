import { prisma } from '@/lib/prisma'

export async function getStore({ domain }: { domain: string }) {
  if (!domain) {
    return null
  }

  return await prisma.store.findUnique({
    where: {
      slug: domain,
    },
    select: {
      id: true,
      name: true,
      description: true,
      logo: true,
      status: true,
    },
  })
}
