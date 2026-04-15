export enum DiscountType {
  PERCENTAGE = 'Percentage',
  FIXED = 'Fixed',
}

export interface RewardPoints {
  amount: number
  isActive: boolean
}

export interface Discount {
  type: DiscountType
  amount: number
  active: boolean
}

export interface ProductChoice {
  name: string
  extraPrice: number
}

export interface ProductOption {
  title: string
  maxSelect: number
  require: boolean
  choices: ProductChoice[]
}

export interface ProductVariant {
  variantId: string
  title: string
  price: number
  discount?: Discount
  stock: number
  sku: string
  rewardPoints?: RewardPoints
}

export interface ProductAddon {
  addonId: string
  title: string
  price: number
  isAvailable: boolean
}

export interface ProductMetadata {
  brand?: string
  tags?: string[]
  [key: string]: unknown
}

export interface Product {
  productId: string
  categoryId: string
  title: string
  slug: string
  image: string
  variants: ProductVariant[]
  options: ProductOption[]
  addons: ProductAddon[]
  metadata: ProductMetadata
}
