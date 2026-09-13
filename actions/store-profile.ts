'use server'

import { ActorType, LogAction, Prisma } from '@/generated/prisma/client'
import { StoreProfileFormValues } from '@/zod/store-profile'

import { createLog } from '@/lib/activity-log'
import { getCurrentUser } from '@/lib/auth-server'
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
  baseCurrency: true,
  allowSearchEngineIndex: true,
  seoTitle: true,
  seoDescription: true,
  seoKeywords: true,
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
    const userSession = await getCurrentUser()
    const userId = userSession?.id

    if (!userId) {
      return null
    }

    const authCheck = await verifyEmployeePermission({
      userId,
      storeId,
      permission: 'canViewStoreProfile',
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
      return {
        success: false,
        messageTH: 'ไม่พบ Store ID',
        messageEN: 'Store ID not found',
      }
    }

    const userSession = await getCurrentUser()
    const userId = userSession?.id

    if (!userId) {
      return {
        success: false,
        messageTH: 'กรุณาเข้าสู่ระบบก่อนทำรายการ',
        messageEN: 'Please sign in to proceed',
      }
    }

    const authCheck = await verifyEmployeePermission({
      userId,
      storeId,
      permission: 'canUpdateStoreProfile',
    })

    if (!authCheck.isAuthorized) {
      return {
        success: false,
        messageTH: authCheck.messageTH || 'สิทธิ์การใช้งานของคุณไม่เพียงพอ',
        messageEN: authCheck.messageEN || 'Insufficient permissions',
      }
    }

    if (input.slug) {
      const existing = await prisma.store.findFirst({
        where: { slug: input.slug, id: { not: storeId } },
        select: { id: true },
      })
      if (existing) {
        return {
          success: false,
          messageTH: 'URL Slug นี้ถูกใช้งานไปแล้ว',
          messageEN: 'This URL slug is already taken',
        }
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

    return {
      success: true,
      messageTH: 'บันทึกข้อมูลร้านค้าสำเร็จ',
      messageEN: 'Store profile updated successfully',
    }
  } catch (error) {
    console.error(error)
    return { success: false }
  }
}
