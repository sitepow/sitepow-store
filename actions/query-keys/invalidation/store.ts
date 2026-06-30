import { invalidateCacheByPattern } from '@/lib/cache'

export const invalidateStoreCache = async (storeSlug: string) => {
  await Promise.all([invalidateCacheByPattern(`store:detail:*${storeSlug}*`)])
  await Promise.all([invalidateCacheByPattern(`store:landing`)])
}
