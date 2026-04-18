import {
  CalculatedProduct,
  Product,
  ProductVariant,
} from '@/types/sites/product'
import {
  calculateProduct,
  calculateRewardPoints,
  getVariantNetPrice,
} from '@/utils/product'
import { create } from 'zustand'

interface ProductStore {
  product: Product | null
  price: CalculatedProduct | null
  selectedVariant: ProductVariant | null
  selectedOptions: Record<string, string[]>
  selectedAddons: string[]
  quantity: number

  setProduct: (product: Product) => void
  selectVariant: (variantId: string) => void
  toggleOption: (
    optionTitle: string,
    choiceName: string,
    maxSelect: number,
  ) => void
  toggleAddon: (addonId: string) => void
  setQuantity: (qty: number) => void

  getVariantPrice: (variant: ProductVariant) => number
  getTotalPrice: () => number
  getCurrentPoints: () => number
}

export const useProductPurchaseStore = create<ProductStore>((set, get) => ({
  product: null,
  price: null,
  selectedVariant: null,
  selectedOptions: {},
  selectedAddons: [],
  quantity: 1,

  setProduct: (product) => {
    const calculatedPrice = calculateProduct(product)

    set({
      product,
      price: calculatedPrice,
      selectedVariant: product.variants[0] || null,
      selectedOptions: {},
      selectedAddons: [],
      quantity: 1,
    })
  },

  selectVariant: (variantId) => {
    const { product, quantity } = get()
    const variant = product?.variants.find(
      (variant) => variant.variantId === variantId,
    )

    if (variant) {
      const newStock = variant.stock ?? 0

      set({
        selectedVariant: variant,
        quantity: Math.max(1, Math.min(quantity, newStock)),
      })
    }
  },

  toggleOption: (optionTitle, choiceName, maxSelect) => {
    set((state) => {
      const currentChoices = state.selectedOptions[optionTitle] || []
      let newChoices: string[]

      if (currentChoices.includes(choiceName)) {
        newChoices = currentChoices.filter((name) => name !== choiceName)
      } else {
        newChoices =
          maxSelect === 1
            ? [choiceName]
            : [...currentChoices, choiceName].slice(-maxSelect)
      }

      return {
        selectedOptions: {
          ...state.selectedOptions,
          [optionTitle]: newChoices,
        },
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
    const stock = get().selectedVariant?.stock ?? 0
    set({ quantity: Math.max(1, Math.min(qty, stock)) })
  },

  getVariantPrice: (variant) => getVariantNetPrice(variant),

  getTotalPrice: () => {
    const state = get()

    if (!state.selectedVariant) {
      return 0
    }

    let unitPrice = getVariantNetPrice(state.selectedVariant)

    state.selectedAddons.forEach((id) => {
      const addon = state.product?.addons.find((addon) => addon.addonId === id)
      if (addon && addon.isAvailable) {
        unitPrice += addon.price
      }
    })

    return unitPrice * state.quantity
  },

  getCurrentPoints: () => {
    return calculateRewardPoints(get().selectedVariant, get().quantity)
  },
}))
