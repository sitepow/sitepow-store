import { DiscountType, ProductType } from '@/generated/prisma/enums'
import z from 'zod'

const digitalItemSchema = z.object({
  content: z.string().optional(),
  isUsed: z.boolean().default(false),
})

const discountSchema = z.object({
  active: z.boolean().default(false),
  type: z.enum(DiscountType).default(DiscountType.PERCENTAGE),
  amount: z.number().min(0).default(0),
})

const rewardPointsSchema = z.object({
  isActive: z.boolean().default(false),
  amount: z.number().min(0).int().default(0),
})

const stockSchema = z.object({
  branchId: z.string().min(1, { message: 'กรุณาเลือกสาขา' }),
  quantity: z.number().min(0).int().default(0),
  minStock: z.number().min(0).int().default(0),
})

export const variantSchema = z.object({
  title: z.string().min(1, { message: 'กรุณาระบุชื่อตัวเลือก' }),
  price: z.number().min(0, { message: 'ราคาต้องไม่ต่ำกว่า 0' }),
  image: z
    .union([z.string(), z.instanceof(File)])
    .nullable()
    .optional(),
  digitalUrl: z.string().optional(),
  sku: z.string().optional().or(z.literal('')),
  weight: z.number().min(0).optional(),
  width: z.number().min(0).optional(),
  height: z.number().min(0).optional(),
  length: z.number().min(0).optional(),
  stocks: z.array(stockSchema).min(1),
  discount: discountSchema,
  rewardPoints: rewardPointsSchema,
  digitalItems: z.array(digitalItemSchema).default([]),
  isAvailable: z.boolean().default(true),
})

const addonSchema = z.object({
  title: z.string().min(1, { message: 'กรุณาระบุชื่อบริการเสริม' }),
  price: z.number().min(0),
  isAvailable: z.boolean().default(true),
})

const metadataSchema = z.object({
  key: z.string().min(1),
  value: z.string(),
})

export const productFormSchema = z.object({
  title: z
    .string()
    .min(2, { message: 'ชื่อสินค้าต้องระบุอย่างน้อย 2 ตัวอักษร' }),
  slug: z
    .string()
    .min(3, { message: 'Slug ต้องระบุอย่างน้อย 3 ตัวอักษร' })
    .regex(/^[a-zA-Z0-9-]+$/, {
      message: 'Slug ใช้ได้เฉพาะตัวอักษร ตัวเลข และขีดกลาง',
    }),
  categoryId: z.string().min(1, { message: 'กรุณาเลือกหมวดหมู่' }),
  images: z.array(
    z.object({
      url: z.union([z.string(), z.instanceof(File)]),
      isPrimary: z.boolean().default(false),
    }),
  ),
  variants: z
    .array(variantSchema)
    .min(1, { message: 'ต้องมีอย่างน้อย 1 ตัวเลือก' }),
  addons: z.array(addonSchema).default([]),
  metadata: z.array(metadataSchema).default([]),
  tags: z.string().optional().or(z.literal('')),
  productType: z.enum(ProductType).default(ProductType.PHYSICAL),
})

export type ProductFormValues = z.input<typeof productFormSchema>
