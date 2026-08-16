import { z } from 'zod'

export const reviewFormSchema = z.object({
  rating: z.number().min(1, 'กรุณาให้คะแนนอย่างน้อย 1 ดาว').max(5),

  comment: z.string().optional(),

  images: z
    .array(
      z.object({
        url: z.union([z.string(), z.instanceof(File), z.any()]),
        isPrimary: z.boolean().default(false),
        file: z.instanceof(File).optional(),
      }),
    )
    .default([]),
})

export type ReviewFormValues = z.input<typeof reviewFormSchema>
