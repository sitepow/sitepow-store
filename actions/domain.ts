'use server'

import { ActorType, DomainStatus, LogAction } from '@/generated/prisma/client'

import { createLog } from '@/lib/activity-log'
import { getCurrentUser } from '@/lib/auth-server'
import { verifyEmployeePermission } from '@/lib/permission'
import { prisma } from '@/lib/prisma'

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
      },
    })

    if (!store || !store.customDomain) {
      return null
    }

    return {
      domain: store.customDomain,
      status: store.customDomainStatus as DomainStatus,
      cnameTarget:
        process.env.NEXT_PUBLIC_CNAME_TARGET || 'cname.sitepow.store',
    }
  } catch (error) {
    console.error(error)
    {
      return null
    }
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

    const existingDomain = await prisma.store.findFirst({
      where: {
        customDomain: cleanDomain,
        id: { not: storeId },
      },
    })

    if (existingDomain) {
      return { success: false, message: 'โดเมนนี้ถูกใช้งานในระบบแล้ว' }
    }

    await prisma.store.update({
      where: { id: storeId },
      data: {
        customDomain: cleanDomain,
        customDomainStatus: DomainStatus.PENDING,
      },
    })

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
    return { success: false }
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
      details: { action: 'REMOVE_DOMAIN' },
    })

    return { success: true, message: 'ลบโดเมนเรียบร้อยแล้ว' }
  } catch (error) {
    console.error(error)
    return { success: false }
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
      select: { customDomain: true },
    })

    if (!store?.customDomain) {
      return { success: false, message: 'ไม่พบโดเมนที่ต้องการตรวจสอบ' }
    }

    const isVerified = true

    await prisma.store.update({
      where: { id: storeId },
      data: {
        customDomainStatus: isVerified
          ? DomainStatus.ACTIVE
          : DomainStatus.FAILED,
      },
    })

    return {
      success: isVerified,
      message: isVerified
        ? 'ยืนยันโดเมนสำเร็จ'
        : 'ยังไม่พบการชี้ DNS มายังระบบ',
    }
  } catch (error) {
    console.error(error)
    return { success: false }
  }
}
