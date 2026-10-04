import { StorefrontProductDetail } from '@/actions/storefront/product/actions'
import { ProductType } from '@/generated/prisma/enums'

export type CartVariant = StorefrontProductDetail['variants'][number]
export type CartAddon = NonNullable<StorefrontProductDetail['addons']>[number]

export interface SelectedOption {
  optionTitle: string
  choiceName: string
  extraPrice: number
}

export interface CartItem {
  cartItemId: string
  productId: string
  productTitle: string
  image: string
  weight: number
  variant: CartVariant
  selectedOptions: SelectedOption[]
  selectedAddons: CartAddon[]
  quantity: number
  unitPrice: number
  originalPrice?: number
  totalPrice: number
  rewardPoints: number
  branchId: string
  branchName: string
  productType: ProductType
  isReseller?: boolean
  agreementId?: string
  storeId?: string
  supplierStoreId?: string
}

export interface CartSummary {
  subtotal: number
  totalDiscount: number
  totalPoints: number
  totalQuantity: number
  finalPrice: number
  totalWeight: number
}
