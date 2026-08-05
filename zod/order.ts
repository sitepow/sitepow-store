import {
  OrderStatus,
  PaymentMethod,
  ProductType,
} from '@/generated/prisma/enums'
import { z } from 'zod'

export const orderItemSchema = z.object({
  productId: z.string().min(1, 'ต้องระบุสินค้า'),
  variantId: z.string().min(1, 'ต้องระบุ Variant'),
  title: z.string(),
  variantTitle: z.string().default(''),
  quantity: z.number().int().min(1),
  price: z.number().min(0),
  productType: z.enum(ProductType),
  branchId: z.string().optional(),
  customerNote: z.string().optional(),
})

export const posCheckoutSchema = z.object({
  storeId: z.string().min(1, 'ต้องระบุ Store'),
  branchId: z.string().min(1, 'ต้องระบุ Branch'),
  customerId: z.string().optional(),
  customerName: z.string().optional(),
  customerPhone: z.string().optional(),
  customerPoints: z.number().optional(),
  usedPoints: z.number().min(0).optional().default(0),
  couponCode: z.string().optional(),
  couponDiscount: z.number().min(0).optional().default(0),
  discountAmount: z.number().min(0).optional().default(0),
  status: z.enum(OrderStatus).default(OrderStatus.SHIPPED),
  paymentMethod: z.enum(PaymentMethod).default(PaymentMethod.CASH_ON_DELIVERY),
  receivedAmount: z.number().optional(),
  changeAmount: z.number().optional(),
  items: z.array(orderItemSchema).min(1, 'ไม่มีสินค้าในตะกร้า'),
})

export type POSCheckoutInput = z.input<typeof posCheckoutSchema>
export type POSCheckoutOutput = z.output<typeof posCheckoutSchema>
