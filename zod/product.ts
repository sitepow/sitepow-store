import { DiscountType } from '@/types/sites/product'
import z from 'zod'

export const productFormSchema = z.object({
  title: z.string().min(5, 'ชื่อสินค้าต้องมีอย่างน้อย 5 ตัวอักษร'),
  slug: z.string().min(3, 'Slug ต้องมีอย่างน้อย 3 ตัวอักษร'),
  categoryId: z.string().min(1, 'กรุณาเลือกหมวดหมู่'),

  variants: z
    .array(
      z.object({
        title: z.string().min(1, 'กรุณาระบุชื่อรุ่น'),
        price: z.number().min(0, 'ราคาต้องไม่ต่ำกว่า 0'),
        stock: z.number().min(0, 'สต็อกต้องไม่ต่ำกว่า 0'),
        sku: z.string().optional(),
        discount: z.object({
          active: z.boolean(),
          type: z.enum(DiscountType),
          amount: z.number(),
        }),
        rewardPoints: z.object({
          isActive: z.boolean(),
          amount: z.number(),
        }),
      }),
    )
    .min(1, 'ต้องมีอย่างน้อย 1 ตัวเลือก'),

  addons: z.array(
    z.object({
      title: z.string().min(1, 'ระบุชื่อบริการเสริม'),
      price: z.number().min(0),
      isAvailable: z.boolean(),
    }),
  ),

  metadata: z.array(
    z.object({
      key: z.string().min(1, 'ระบุชื่อหัวข้อ'),
      value: z.string().min(1, 'ระบุข้อมูล'),
    }),
  ),

  tags: z.string().optional(),
})

export type ProductFormValues = z.infer<typeof productFormSchema>
