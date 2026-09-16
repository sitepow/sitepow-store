'use server'

import { ActorType, LogAction, Prisma } from '@/generated/prisma/client'

import { createLog } from '@/lib/activity-log'
import { getCurrentUser } from '@/lib/auth-server'
import { verifyEmployeePermission } from '@/lib/permission'
import { prisma } from '@/lib/prisma'

import { invalidateStoreCache } from './query-keys/invalidation/store'

const storePagesSelect = {
  id: true,
  name: true,
  slug: true,
  description: true,
  aboutPage: true,
  faqsPage: true,
  descriptionPage: true,
  privacyPolicyPage: true,
  refundPolicyPage: true,
  phone: true,
  lineId: true,
  facebookPage: true,
  instagramPage: true,
  tiktokPage: true,
  youtubePage: true,
  discordUrl: true,
  messengerUrl: true,
  socialLinks: true,
  footerText: true,
  footerCopyright: true,
} satisfies Prisma.StoreSelect

export type StorePagesData = Prisma.StoreGetPayload<{
  select: typeof storePagesSelect
}>

export interface UpdateStorePagesInput {
  aboutPage?: string | null
  faqsPage?: string | null
  descriptionPage?: string | null
  privacyPolicyPage?: string | null
  refundPolicyPage?: string | null
  phone?: string | null
  lineId?: string | null
  facebookPage?: string | null
  instagramPage?: string | null
  tiktokPage?: string | null
  youtubePage?: string | null
  discordUrl?: string | null
  messengerUrl?: string | null
  socialLinks?: Prisma.InputJsonValue
  footerText?: string | null
  footerCopyright?: string | null
}

export async function getStorePages(
  storeId: string,
): Promise<StorePagesData | null> {
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
      permission: 'canViewStoreSettings',
    })

    if (!authCheck.isAuthorized) {
      return null
    }

    return await prisma.store.findUnique({
      where: { id: storeId },
      select: storePagesSelect,
    })
  } catch (error) {
    console.error('getStorePages error:', error)
    return null
  }
}

export async function updateStorePages(
  storeId: string,
  input: UpdateStorePagesInput,
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
      permission: 'canUpdateStoreSettings',
    })

    if (!authCheck.isAuthorized) {
      return {
        success: false,
        messageTH: authCheck.messageTH || 'สิทธิ์การใช้งานของคุณไม่เพียงพอ',
        messageEN: authCheck.messageEN || 'Insufficient permissions',
      }
    }

    const store = await prisma.store.update({
      where: { id: storeId },
      data: input,
      select: { slug: true },
    })

    await createLog({
      action: LogAction.UPDATE_STORE_SETTING,
      actorType: ActorType.MERCHANT,
      storeId,
      entity: 'Store',
      entityId: storeId,
      details: { setting: 'pages', updatedFields: Object.keys(input) },
    })

    await invalidateStoreCache(store?.slug)

    return {
      success: true,
      messageTH: 'บันทึกข้อมูลหน้าเว็บสำเร็จเรียบร้อย',
      messageEN: 'Store pages updated successfully',
    }
  } catch (error) {
    console.error('updateStorePages error:', error)
    return {
      success: false,
      messageTH: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล',
      messageEN: 'Failed to update store pages',
    }
  }
}
