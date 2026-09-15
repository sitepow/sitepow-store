import { prisma } from '@/lib/prisma'
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

  // 1. อ่านจาก Redis Cache
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

  // 2. Query ตรงผ่าน Prisma (ไม่ต้อง fetch HTTP ย้อนกลับเข้าตัวเอง)
  try {
    // เช็คจาก StoreDomain หรือฟิลด์ customDomain ใน Store[cite: 1]
    const storeDomain = await prisma.storeDomain.findFirst({
      where: {
        domain: cleanHostname,
        status: 'ACTIVE',
      },
      select: {
        store: {
          select: { slug: true },
        },
      },
    })

    let storeSlug = storeDomain?.store?.slug

    // รองรับกรณีเก็บไว้ที่ store.customDomain โดยตรง[cite: 1]
    if (!storeSlug) {
      const store = await prisma.store.findFirst({
        where: {
          customDomain: cleanHostname,
        },
        select: { slug: true },
      })
      storeSlug = store?.slug
    }

    if (storeSlug) {
      await Promise.all([
        redis.setex(cacheKey, 604800, storeSlug), // 7 days
        redis.setex(`slug:domain:${storeSlug}`, 604800, cleanHostname),
      ]).catch(console.error)
      return storeSlug
    }

    // Domain Not Found - Cache ไว้ 5 นาที
    await redis.setex(cacheKey, 300, '__NOT_FOUND__').catch(console.error)
  } catch (error) {
    console.error(
      `Failed to resolve domain "${cleanHostname}" via Prisma:`,
      error,
    )
  }

  return ''
}
