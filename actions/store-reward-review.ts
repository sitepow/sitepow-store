'use server'

import { serializeDecimal } from '@/utils/decimal'
import { ReviewRewardConfigFormValues } from '@/zod/review-reward'

import { prisma } from '@/lib/prisma'

export async function getReviewRewardConfig(storeId: string) {
  try {
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
