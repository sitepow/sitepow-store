import { invalidateCacheByPattern } from '@/lib/cache'

export const invalidateLandingImageCache = async (folder: string) => {
  await Promise.all([invalidateCacheByPattern(`landing:images:*${folder}*`)])
}
