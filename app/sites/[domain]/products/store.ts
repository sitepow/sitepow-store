import { StorefrontProductDetail } from '@/actions/storefront/product'
import { CalculatedProduct } from '@/utils/product'
import { calculateProduct, getVariantNetPrice } from '@/utils/product'
import { create } from 'zustand'

type StorefrontVariant = StorefrontProductDetail['variants'][number]

interface ProductStore {
  isLoading: boolean
  product: StorefrontProductDetail | null
  price: CalculatedProduct | null
  selectedVariant: StorefrontVariant | null
  selectedOptions: Record<string, string[]>
  selectedAddons: string[]
  quantity: number
  setIsLoading: (isLoading: boolean) => void
  setProduct: (product: StorefrontProductDetail) => void
  selectVariant: (variantId: string) => void
  toggleOption: (
    optionTitle: string,
    choiceName: string,
    maxSelect: number,
  ) => void
  toggleAddon: (addonId: string) => void
  setQuantity: (qty: number) => void

  getVariantPrice: (variant: StorefrontVariant) => number
  getTotalPrice: () => number
  getCurrentPoints: () => number
}

export const useProductPurchaseStore = create<ProductStore>((set, get) => ({
  isLoading: true,
  product: null,
  price: null,
  selectedVariant: null,
  selectedOptions: {},
  selectedAddons: [],
  quantity: 1,
  setIsLoading: (isLoading) => set({ isLoading }),

  setProduct: (product) => {
    set({
      product,
      price: calculateProduct(product),
      selectedVariant: product.variants[0] ?? null,
      selectedOptions: {},
      selectedAddons: [],
      quantity: 1,
    })
  },

  selectVariant: (variantId) => {
    const { product, quantity } = get()
    const variant = product?.variants.find((v) => v.id === variantId) ?? null

    if (variant) {
      const stock = variant.stocks.reduce((sum, s) => sum + s.quantity, 0)
      set({
        selectedVariant: variant,
        quantity: Math.max(1, Math.min(quantity, stock)),
      })
    }
  },

  toggleOption: (optionTitle, choiceName, maxSelect) => {
    set((state) => {
      const current = state.selectedOptions[optionTitle] ?? []
      let next: string[]

      if (current.includes(choiceName)) {
        next = current.filter((n) => n !== choiceName)
      } else {
        next =
          maxSelect === 1
            ? [choiceName]
            : [...current, choiceName].slice(-maxSelect)
      }

      return {
        selectedOptions: { ...state.selectedOptions, [optionTitle]: next },
      }
    })
  },

  toggleAddon: (addonId) => {
    set((state) => ({
      selectedAddons: state.selectedAddons.includes(addonId)
        ? state.selectedAddons.filter((id) => id !== addonId)
        : [...state.selectedAddons, addonId],
    }))
  },

  setQuantity: (qty) => {
    const stock =
      get().selectedVariant?.stocks.reduce((sum, s) => sum + s.quantity, 0) ?? 0
    set({ quantity: Math.max(1, Math.min(qty, stock)) })
  },

  getVariantPrice: (variant) => getVariantNetPrice(variant),

  getTotalPrice: () => {
    const { selectedVariant, selectedAddons, product, quantity } = get()
    if (!selectedVariant) {
      return 0
    }

    let unitPrice = getVariantNetPrice(selectedVariant)

    selectedAddons.forEach((id) => {
      const addon = product?.addons.find((a) => a.id === id)
      if (addon?.isAvailable) {
        unitPrice += addon.price
      }
    })

    return unitPrice * quantity
  },

  getCurrentPoints: () => {
    const { selectedVariant, quantity } = get()
    if (!selectedVariant?.pointsActive) {
      return 0
    }
    return selectedVariant.pointsAmount * quantity
  },
}))
