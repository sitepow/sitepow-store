'use server'

import { ActorType, DomainStatus, LogAction } from '@/generated/prisma/client'
import { resolveCname } from 'node:dns/promises'

import { createLog } from '@/lib/activity-log'
import { getCurrentUser } from '@/lib/auth-server'
import { invalidateCacheByPattern } from '@/lib/cache'
import {
  addCloudflareCustomHostname,
  deleteCloudflareCustomHostname,
  getCloudflareCustomHostname,
} from '@/lib/cloudflare'
import { verifyEmployeePermission } from '@/lib/permission'
import { prisma } from '@/lib/prisma'
import { redis } from '@/lib/redis'

export interface StoreDomainResult {
  domain: string
  status: DomainStatus
  cnameTarget: string
}

export async function getStoreDomain(
  storeId: string,
): Promise<StoreDomainResult | null> {
  const userSession = await getCurrentUser()
  const userId = userSession?.id

  if (!userId || !storeId) {
    return null
  }

  try {
    const authCheck = await verifyEmployeePermission({
      userId,
      storeId,
      permission: 'canViewDomain',
    })

    if (!authCheck.isAuthorized) {
      return null
    }

    const store = await prisma.store.findUnique({
      where: { id: storeId },
      select: {
        customDomain: true,
        customDomainStatus: true,
        slug: true,
      },
    })

    if (!store || !store.customDomain) {
      return null
    }

    const baseDomain = process.env.NEXT_PUBLIC_APP_DOMAIN || 'sitepow.store'

    return {
      domain: store.customDomain,
      status: store.customDomainStatus as DomainStatus,
      cnameTarget: `${store.slug}.${baseDomain}`,
    }
  } catch (error) {
    console.error(error)
    return null
  }
}

export async function addStoreDomain(storeId: string, domain: string) {
  const userSession = await getCurrentUser()
  const userId = userSession?.id

  if (!userId) {
    return { success: false, message: 'กรุณาเข้าสู่ระบบก่อนทำรายการ' }
  }

  try {
    const authCheck = await verifyEmployeePermission({
      userId,
      storeId,
      permission: 'canManageDomain',
    })

    if (!authCheck.isAuthorized) {
      return {
        success: false,
        message: authCheck.message || 'สิทธิ์การใช้งานของคุณไม่เพียงพอ',
      }
    }

    const cleanDomain = domain
      .toLowerCase()
      .trim()
      .replace(/^https?:\/\//, '')
      .replace(/\/.*$/, '')

    const domainRegex =
      /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/i

    if (!cleanDomain || !domainRegex.test(cleanDomain)) {
      return {
        success: false,
        message: 'รูปแบบโดเมนไม่ถูกต้อง กรุณากรอกชื่อโดเมนให้ถูกต้อง',
      }
    }

    const baseDomain = process.env.NEXT_PUBLIC_APP_DOMAIN || 'sitepow.store'
    if (cleanDomain.endsWith(`.${baseDomain}`) || cleanDomain === baseDomain) {
      return {
        success: false,
        message: `ไม่สามารถใช้โดเมน ${baseDomain} เป็น Custom Domain ได้`,
      }
    }

    const existingDomain = await prisma.store.findFirst({
      where: {
        customDomain: cleanDomain,
        id: { not: storeId },
      },
    })

    if (existingDomain) {
      return { success: false, message: 'โดเมนนี้ถูกใช้งานในระบบแล้ว' }
    }

    const cfResult = await addCloudflareCustomHostname(cleanDomain)
    if (cfResult && !cfResult.success) {
      const errorMessage =
        cfResult.errors?.[0]?.message ||
        'ไม่สามารถลงทะเบียนโดเมนกับ Cloudflare ได้'
      console.error('Cloudflare Error:', cfResult.errors)
      return { success: false, message: errorMessage }
    }

    const store = await prisma.store.update({
      where: { id: storeId },
      data: {
        customDomain: cleanDomain,
        customDomainStatus: DomainStatus.PENDING,
      },
      select: { slug: true },
    })

    await Promise.all([
      redis.del(`domain:slug:${cleanDomain}`),
      redis.del(`slug:domain:${store.slug}`),
      invalidateCacheByPattern(`domain:slug:${cleanDomain}`),
    ]).catch(console.error)

    await createLog({
      action: LogAction.UPDATE_STORE,
      actorType: ActorType.MERCHANT,
      storeId,
      entity: 'StoreDomain',
      entityId: storeId,
      details: { domain: cleanDomain },
    })

    return { success: true, message: 'เพิ่มโดเมนเรียบร้อยแล้ว' }
  } catch (error) {
    console.error(error)
    return { success: false, message: 'เกิดข้อผิดพลาดในการเพิ่มโดเมน' }
  }
}

export async function removeStoreDomain(storeId: string) {
  const userSession = await getCurrentUser()
  const userId = userSession?.id

  if (!userId) {
    return { success: false, message: 'กรุณาเข้าสู่ระบบก่อนทำรายการ' }
  }

  try {
    const authCheck = await verifyEmployeePermission({
      userId,
      storeId,
      permission: 'canManageDomain',
    })

    if (!authCheck.isAuthorized) {
      return {
        success: false,
        message: authCheck.message || 'สิทธิ์การใช้งานของคุณไม่เพียงพอ',
      }
    }

    const store = await prisma.store.findUnique({
      where: { id: storeId },
      select: { customDomain: true, slug: true },
    })

    if (store?.customDomain) {
      await deleteCloudflareCustomHostname(store.customDomain).catch((err) =>
        console.error('Failed to remove Cloudflare hostname:', err),
      )

      await Promise.all([
        redis.del(`domain:slug:${store.customDomain}`),
        redis.del(`slug:domain:${store.slug}`),
        invalidateCacheByPattern(`domain:slug:${store.customDomain}`),
      ]).catch(console.error)
    }

    await prisma.store.update({
      where: { id: storeId },
      data: {
        customDomain: null,
        customDomainStatus: null,
      },
    })

    await createLog({
      action: LogAction.UPDATE_STORE,
      actorType: ActorType.MERCHANT,
      storeId,
      entity: 'StoreDomain',
      entityId: storeId,
      details: {
        action: 'REMOVE_DOMAIN',
        previousDomain: store?.customDomain,
      },
    })

    return { success: true, message: 'ลบโดเมนเรียบร้อยแล้ว' }
  } catch (error) {
    console.error(error)
    return { success: false, message: 'เกิดข้อผิดพลาดในการลบโดเมน' }
  }
}

export async function verifyStoreDomain(storeId: string) {
  const userSession = await getCurrentUser()
  const userId = userSession?.id

  if (!userId) {
    return { success: false, message: 'กรุณาเข้าสู่ระบบก่อนทำรายการ' }
  }

  try {
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      select: { customDomain: true, slug: true },
    })

    if (!store?.customDomain) {
      return { success: false, message: 'ไม่พบโดเมนที่ต้องการตรวจสอบ' }
    }

    const baseDomain = process.env.NEXT_PUBLIC_APP_DOMAIN || 'sitepow.store'
    const expectedTarget = `${store.slug}.${baseDomain}`.toLowerCase()

    let isVerified = false

    try {
      const cfHostname = await getCloudflareCustomHostname(store.customDomain)
      if (cfHostname) {
        const isHostnameActive = cfHostname.status === 'active'
        const isSslActive = cfHostname.ssl?.status === 'active'
        if (isHostnameActive || isSslActive) {
          isVerified = true
        }
      }
    } catch (err) {
      console.error('Error verifying domain via Cloudflare:', err)
    }

    if (!isVerified) {
      try {
        const records = await resolveCname(store.customDomain)
        isVerified = records.some(
          (record) =>
            record.replace(/\.$/, '').toLowerCase() === expectedTarget,
        )
      } catch {
        try {
          const response = await fetch(`https://${store.customDomain}`, {
            method: 'HEAD',
            redirect: 'manual',
            signal: AbortSignal.timeout(5000),
          })
          isVerified = response.status < 500
        } catch {
          isVerified = false
        }
      }
    }

    await prisma.store.update({
      where: { id: storeId },
      data: {
        customDomainStatus: isVerified
          ? DomainStatus.ACTIVE
          : DomainStatus.FAILED,
      },
    })

    if (isVerified) {
      await Promise.all([
        redis.del(`domain:slug:${store.customDomain}`),
        redis.del(`slug:domain:${store.slug}`),
      ]).catch(console.error)
    }

    return {
      success: isVerified,
      message: isVerified
        ? 'ยืนยันโดเมนสำเร็จ โดเมนพร้อมใช้งานแล้ว'
        : 'ตรวจสอบไม่พบ CNAME Record หรือค่ายังไม่อัปเดต กรุณารอ 5-15 นาทีแล้วลองใหม่',
    }
  } catch (error) {
    console.error(error)
    return { success: false }
  }
}
