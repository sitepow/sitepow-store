'use server'

import { serializeDecimal } from '@/utils/shared/decimal'
import { ReviewRewardConfigFormValues } from '@/zod/store/review-reward-settings'

import { getCurrentUser } from '@/lib/auth/server'
import { verifyEmployeePermission } from '@/lib/auth/permission'
import { prisma } from '@/lib/db/prisma'

export async function getReviewRewardConfig(storeId: string) {
  try {
    if (!storeId) {
      return { success: false, message: 'ไม่พบ Store ID' }
    }

    const userSession = await getCurrentUser()
    const userId = userSession?.id

    if (!userId) {
      return { success: false, message: 'กรุณาเข้าสู่ระบบก่อนทำรายการ' }
    }

    const authCheck = await verifyEmployeePermission({
      userId,
      storeId,
      permission: 'canViewStoreProfile',
    })

    if (!authCheck.isAuthorized) {
      return {
        success: false,
        message: authCheck.message || 'สิทธิ์การใช้งานของคุณไม่เพียงพอ',
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
      return { success: false, message: 'ไม่พบ Store ID' }
    }

    const userSession = await getCurrentUser()
    const userId = userSession?.id

    if (!userId) {
      return { success: false, message: 'กรุณาเข้าสู่ระบบก่อนทำรายการ' }
    }

    const authCheck = await verifyEmployeePermission({
      userId,
      storeId,
      permission: 'canUpdateStoreProfile',
    })

    if (!authCheck.isAuthorized) {
      return {
        success: false,
        message: authCheck.message || 'สิทธิ์การใช้งานของคุณไม่เพียงพอ',
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
      message: 'บันทึกการตั้งค่าคะแนนรีวิวเรียบร้อยแล้ว',
      data: serializeDecimal(config),
    }
  } catch (error) {
    console.error(error)
    return { success: false }
  }
}
