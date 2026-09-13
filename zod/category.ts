import z from 'zod'

export const createCategorySchema = z.object({
  title: z
    .string()
    .min(2, { message: 'ชื่อหมวดหมู่ต้องระบุอย่างน้อย 2 ตัวอักษร' }),
  slug: z
    .string()
    .min(2, { message: 'URL Slug ต้องระบุอย่างน้อย 2 ตัวอักษร' })
    .regex(/^[a-zA-Z0-9-ก-๙]+$/, {
      message: 'URL ต้องประกอบด้วยตัวอักษร ตัวเลข หรือเครื่องหมายขีดเท่านั้น',
    }),
  description: z.string().optional().or(z.literal('')),
  image: z.any().optional(),
  translations: z.record(z.string(), z.any()).optional().nullable(),
})

export type CreateCategoryFormValues = z.input<typeof createCategorySchema>
