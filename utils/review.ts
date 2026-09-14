import { ReviewRewardConfig } from '@/generated/prisma/client'

export const getRatingLabel = (rating: number) => {
  const labels: Record<number, string> = {
    5: 'ดีเยี่ยม',
    4: 'ดีมาก',
    3: 'ใช้ได้',
    2: 'ควรปรับปรุง',
    1: 'แย่',
    0: 'ไม่มีคะแนน',
  }

  const roundedRating = Math.round(rating)
  return labels[roundedRating] || 'ไม่มีข้อมูล'
}

export interface CalculateReviewPointsParams {
  rating: number
  comment: string
  images?: string[]
  video?: string
  config?: ReviewRewardConfig | null
}

export function calculateReviewPoints(params: CalculateReviewPointsParams) {
  const breakdown: { description: string; points: number }[] = []

  const basePoints = params.config?.basePoints ?? 10
  const photoBonus = params.config?.photoBonus ?? 5
  const videoBonus = params.config?.videoBonus ?? 20
  const minCommentLength = params.config?.minCommentLength ?? 50
  const longReviewBonus = params.config?.longReviewBonus ?? 10

  breakdown.push({ description: 'เขียนรีวิวสินค้า', points: basePoints })

  if (params.images && params.images.length > 0) {
    const imageCount = Math.min(params.images.length, 3)
    const imagePoints = imageCount * photoBonus
    breakdown.push({
      description: `แนบรูปภาพ (${imageCount} รูป)`,
      points: imagePoints,
    })
  }

  if (params.video && params.video.trim() !== '') {
    breakdown.push({ description: 'แนบวิดีโอรีวิว', points: videoBonus })
  }

  if (params.comment && params.comment.trim().length >= minCommentLength) {
    breakdown.push({
      description: `เขียนรีวิวละเอียด (>= ${minCommentLength} ตัวอักษร)`,
      points: longReviewBonus,
    })
  }

  const totalPoints = breakdown.reduce((sum, item) => sum + item.points, 0)

  return {
    totalPoints,
    breakdown,
  }
}
