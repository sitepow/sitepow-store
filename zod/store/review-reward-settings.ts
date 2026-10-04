import z from 'zod'

export const reviewRewardConfigSchema = z.object({
  isEnabled: z.boolean(),
  basePoints: z
    .number({ message: 'กรุณาระบุคะแนนพื้นฐาน' })
    .min(0, { message: 'คะแนนต้องไม่ติดลบ' }),
  photoBonus: z
    .number({ message: 'กรุณาระบุคะแนนโบนัสรูปภาพ' })
    .min(0, { message: 'คะแนนต้องไม่ติดลบ' }),
  videoBonus: z
    .number({ message: 'กรุณาระบุคะแนนโบนัสวิดีโอ' })
    .min(0, { message: 'คะแนนต้องไม่ติดลบ' }),
  minCommentLength: z
    .number({ message: 'กรุณาระบุจำนวนตัวอักษรขั้นต่ำ' })
    .min(0, { message: 'จำนวนตัวอักษรต้องไม่ติดลบ' }),
  longReviewBonus: z
    .number({ message: 'กรุณาระบุคะแนนโบนัสรีวิวยาว' })
    .min(0, { message: 'คะแนนต้องไม่ติดลบ' }),
})

export type ReviewRewardConfigFormValues = z.infer<
  typeof reviewRewardConfigSchema
>
