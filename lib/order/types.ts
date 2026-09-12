import {
  ActorType,
  OrderStatus,
  PaymentMethod,
  ProductType,
} from '@/generated/prisma/enums'

export interface OrderItemInput {
  productId: string
  variantId: string
  title: string
  variantTitle: string
  image?: string | null
  variant?: {
    id?: string
    image?: string | null
    [key: string]: any
  } | null
  quantity: number
  price: number
  originalPrice?: number
  productType: ProductType
  branchId?: string
  customerNote?: string
}

export type CreateOrderItemInput = OrderItemInput

interface BaseOrderInput {
  paymentMethod: PaymentMethod
  shippingMethod?: string
  shippingFee?: number
  addressId?: string
  couponId?: string
  bankAccountId?: string
  usedPoints?: number
  earnedPoints?: number
  affiliateCode?: string
  items: OrderItemInput[]
}

export interface CreateOrderCoreInput extends BaseOrderInput {
  storeId: string
  customerId?: string
  employeeId?: string
  branchId?: string
  status?: OrderStatus
  discountAmount?: number
  receivedAmount?: number
  changeAmount?: number
  isPOS?: boolean
}

export interface CreateOrderInput extends Omit<
  BaseOrderInput,
  'addressId' | 'shippingMethod' | 'shippingFee'
> {
  storeSlug: string
  addressId: string
  shippingMethod: string
  shippingFee: number
  storeCourierServiceId?: string
  couponDiscount?: number
  pointsDiscount?: number
}

export interface CancelOrderCoreInput {
  orderId: string
  actorId?: string
  actorType?: ActorType
  skipAuthCheck?: boolean
}
