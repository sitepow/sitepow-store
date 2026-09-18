import { DiscountType } from '@/generated/prisma/enums'

export interface ResellerStockVariant {
  id: string
  title?: string
  sku?: string | null
  price?: number | string
  costPrice?: number | string | null
  product?: {
    id: string
    title: string
    images?: { url: string }[]
  }
  resellerPrices?: {
    id: string
    specialPrice?: number | string | null
    discountType?: DiscountType | null
    discountAmount?: number | string | null
  }[]
}

export interface ResellerStockItem {
  id: string
  agreementId: string
  variantId: string
  allocatedQuantity: number
  acceptedQuantity: number
  soldQuantity: number
  returnedQuantity?: number
  acceptedAt?: Date | string | null
  createdAt: Date | string
  updatedAt: Date | string
  variant?: ResellerStockVariant
  agreement?: {
    supplierStoreId: string
    resellerStoreId?: string | null
    resellerCustomerId?: string | null
    defaultDiscountType?: DiscountType | null
    defaultDiscountAmount?: number | string | null
  }
  customPrice?: number | null
  effectivePrice?: number
  defaultCommissionRate?: number
}
