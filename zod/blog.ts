import z from 'zod'

export const blogFormSchema = z.object({
  title: z
    .string()
    .min(2, { message: 'ชื่อบทความต้องระบุอย่างน้อย 2 ตัวอักษร' }),
  slug: z
    .string()
    .min(3, { message: 'Slug ต้องระบุอย่างน้อย 3 ตัวอักษร' })
    .regex(/^[a-zA-Z0-9-]+$/, {
      message: 'Slug ใช้ได้เฉพาะตัวอักษร ตัวเลข และขีดกลาง (-)',
    }),
  image: z
    .union([z.string(), z.instanceof(File)])
    .optional()
    .or(z.literal('')),
  content: z.string().optional().or(z.literal('')),
  tags: z.string().optional().or(z.literal('')),
})

export type BlogFormValues = z.input<typeof blogFormSchema>
