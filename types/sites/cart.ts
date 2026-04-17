import { ProductAddon, ProductVariant } from './product'

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
  variant: ProductVariant
  selectedOptions: SelectedOption[]
  selectedAddons: ProductAddon[]
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
