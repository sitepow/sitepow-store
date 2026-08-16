'use server'

import { serializeDecimal } from '@/utils/decimal'

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
