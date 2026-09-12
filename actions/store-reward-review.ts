'use server'

import { serializeDecimal } from '@/utils/decimal'
import { ReviewRewardConfigFormValues } from '@/zod/review-reward'

import { getCurrentUser } from '@/lib/auth-server'
import { verifyEmployeePermission } from '@/lib/permission'
import { prisma } from '@/lib/prisma'

export async function getReviewRewardConfig(storeId: string) {
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
      permission: 'canViewStoreProfile',
    })

    if (!authCheck.isAuthorized) {
      return {
        success: false,
        messageTH: authCheck.messageTH || 'สิทธิ์การใช้งานของคุณไม่เพียงพอ',
        messageEN: authCheck.messageEN || 'Insufficient permissions',
      }
    }

    const config = await prisma.reviewRewardConfig.findUnique({
      where: { storeId },
    })

    if (!config) {
      return {
        success: true,
        data: {
          id: '',
          storeId,
          isEnabled: true,
          basePoints: 10,
          photoBonus: 5,
          videoBonus: 20,
          minCommentLength: 50,
          longReviewBonus: 10,
        },
      }
    }

    return {
      success: true,
      data: serializeDecimal(config),
    }
  } catch (error) {
    console.error(error)
    return { success: false }
  }
}

export async function updateReviewRewardConfig(
  storeId: string,
  input: ReviewRewardConfigFormValues,
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

    const config = await prisma.reviewRewardConfig.upsert({
      where: { storeId },
      update: {
        isEnabled: input.isEnabled,
        basePoints: input.basePoints,
        photoBonus: input.photoBonus,
        videoBonus: input.videoBonus,
        minCommentLength: input.minCommentLength,
        longReviewBonus: input.longReviewBonus,
      },
      create: {
        storeId,
        isEnabled: input.isEnabled,
        basePoints: input.basePoints,
        photoBonus: input.photoBonus,
        videoBonus: input.videoBonus,
        minCommentLength: input.minCommentLength,
        longReviewBonus: input.longReviewBonus,
      },
    })

    return {
      success: true,
      messageTH: 'บันทึกการตั้งค่าคะแนนรีวิวเรียบร้อยแล้ว',
      messageEN: 'Review reward configuration updated successfully',
      data: serializeDecimal(config),
    }
  } catch (error) {
    console.error(error)
    return { success: false }
  }
}
