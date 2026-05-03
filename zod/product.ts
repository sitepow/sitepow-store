import z from 'zod'

export const productFormSchema = z.object({
  title: z.string().min(5, 'ชื่อสินค้าต้องมีอย่างน้อย 5 ตัวอักษร'),
  slug: z.string().min(3, 'Slug ต้องมีอย่างน้อย 3 ตัวอักษร'),
  categoryId: z.string().min(1, 'กรุณาเลือกหมวดหมู่'),
  variants: z
    .array(
      z.object({
        title: z.string().min(1, 'กรุณาระบุชื่อรุ่น'),
        price: z.coerce.number().min(0, 'ราคาต้องไม่ต่ำกว่า 0'),
        stock: z.coerce.number().min(0, 'สต็อกต้องไม่ต่ำกว่า 0'),
        sku: z.string().optional(),
      }),
    )
    .min(1, 'ต้องมีอย่างน้อย 1 ตัวเลือก'),
  metadata: z.object({
    brand: z.string().optional(),
    material: z.string().optional(),
  }),
})
