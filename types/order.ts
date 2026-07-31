import { PaymentMethod, ProductType } from '@/generated/prisma/enums'

export interface CreateOrderItemInput {
  productId: string
  variantId: string
  title: string
  variantTitle: string
  quantity: number
  price: number
  productType: ProductType
  branchId?: string
}

export interface CreateOrderInput {
  storeSlug: string
  addressId: string
  shippingMethod: string
  shippingFee: number
  storeCourierServiceId?: string
  paymentMethod: PaymentMethod
  bankAccountId?: string
  couponId?: string
  couponDiscount?: number
  usedPoints?: number
  pointsDiscount?: number
  earnedPoints?: number
  items: CreateOrderItemInput[]
}
