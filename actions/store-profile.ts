'use server'

import { ActorType, LogAction, Prisma } from '@/generated/prisma/client'
import { StoreProfileFormValues } from '@/zod/store-profile'

import { createLog } from '@/lib/activity-log'
import { auth } from '@/lib/auth'
import { verifyEmployeePermission } from '@/lib/permission'
import { prisma } from '@/lib/prisma'

import { invalidateStoreCache } from './query-keys/invalidation/store'

const storeProfileSelect = {
  id: true,
  name: true,
  slug: true,
  email: true,
  taxId: true,
  logo: true,
  coverImage: true,
  description: true,
  primaryColor: true,
} satisfies Prisma.StoreSelect

export type GetStoreProfileResult = Prisma.StoreGetPayload<{
  select: typeof storeProfileSelect
}>

export async function getStoreProfile(
  storeId: string,
): Promise<GetStoreProfileResult | null> {
  if (!storeId) {
    return null
  }

  try {
    const session = await auth()
    const userId = session?.user?.id

    if (!userId) {
      return null
    }

    const authCheck = await verifyEmployeePermission({
      userId,
      storeId,
      permission: 'canManageStoreSettings',
    })

    if (!authCheck.isAuthorized) {
      return null
    }

    return await prisma.store.findUnique({
      where: { id: storeId },
      select: storeProfileSelect,
    })
  } catch {
    return null
  }
}

export async function updateStoreProfile(
  storeId: string,
  input: StoreProfileFormValues,
) {
  try {
    if (!storeId) {
      return { success: false, message: 'ไม่พบ Store ID' }
    }

    const session = await auth()
    const userId = session?.user?.id

    if (!userId) {
      return { success: false, message: 'กรุณาเข้าสู่ระบบก่อนทำรายการ' }
    }

    const authCheck = await verifyEmployeePermission({
      userId,
      storeId,
      permission: 'canManageStoreSettings',
    })

    if (!authCheck.isAuthorized) {
      return {
        success: false,
        message: authCheck.message || 'สิทธิ์การใช้งานของคุณไม่เพียงพอ',
      }
    }

    if (input.slug) {
      const existing = await prisma.store.findFirst({
        where: { slug: input.slug, id: { not: storeId } },
        select: { id: true },
      })
      if (existing) {
        return { success: false, message: 'URL Slug นี้ถูกใช้งานไปแล้ว' }
      }
    }

    const store = await prisma.store.update({
      where: { id: storeId },
      data: {
        ...input,
        email: input.email || null,
        taxId: input.taxId || null,
      },
      select: { slug: true },
    })

    await createLog({
      action: LogAction.UPDATE_STORE_SETTING,
      actorType: ActorType.MERCHANT,
      storeId,
      entity: 'Store',
      entityId: storeId,
      details: { setting: 'profile', updatedFields: Object.keys(input) },
    })

    await invalidateStoreCache(store?.slug)

    return { success: true, message: 'บันทึกข้อมูลร้านค้าสำเร็จ' }
  } catch (error) {
    console.error(error)
    return { success: false }
  }
}
