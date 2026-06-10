import { StorefrontProductDetail } from '@/actions/storefront/product'

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
  variant: CartVariant
  selectedOptions: SelectedOption[]
  selectedAddons: CartAddon[]
  quantity: number
  unitPrice: number
  totalPrice: number
  rewardPoints: number
}

export interface CartSummary {
  subtotal: number
  totalDiscount: number
  totalPoints: number
  totalQuantity: number
  finalPrice: number
}
