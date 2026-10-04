import { StorefrontProductDetail } from '@/actions/storefront/product/actions'
import {
  CalculatedProduct,
  calculateNetPrice,
  getStockQuantity,
} from '@/utils/product/product-calculation'
import { calculateProduct } from '@/utils/product/product-calculation'
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
  selectedBranchId: string | null
  selectedBranchName: string | null
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
  setSelectedBranch: (id: string, name: string) => void
  getVariantPrice: (variant: StorefrontVariant) => number
  getTotalPrice: () => number
  getCurrentPoints: () => number
  activeImageIndex: number
  setActiveImageIndex: (index: number) => void
}

export const useProductPurchaseStore = create<ProductStore>((set, get) => ({
  isLoading: true,
  product: null,
  price: null,
  selectedVariant: null,
  selectedOptions: {},
  selectedAddons: [],
  quantity: 1,
  selectedBranchId: null,
  selectedBranchName: null,

  setIsLoading: (isLoading) => set({ isLoading }),

  setSelectedBranch: (id, name) => {
    const { selectedVariant, quantity, product } = get()
    if (!product || !selectedVariant) {
      return
    }

    const stock = getStockQuantity(selectedVariant, product.productType, id)

    set({
      selectedBranchId: id,
      selectedBranchName: name,
      quantity: Math.max(1, Math.min(quantity, stock || 1)),
    })
  },

  setProduct: (product) => {
    set({
      product,
      price: calculateProduct(product),
      selectedVariant: product.variants[0] ?? null,
      selectedOptions: {},
      selectedAddons: [],
      quantity: 1,
      selectedBranchId: null,
      selectedBranchName: null,
    })
  },

  selectVariant: (variantId) => {
    const { product, quantity, selectedBranchId } = get()
    const variant = product?.variants.find((v) => v.id === variantId) ?? null

    if (variant && product) {
      const stock = getStockQuantity(
        variant,
        product.productType,
        selectedBranchId,
      )

      set({
        selectedVariant: variant,
        quantity: Math.max(1, Math.min(quantity, stock || 1)),
      })
    }
  },

  setQuantity: (qty) => {
    const { selectedVariant, selectedBranchId, product } = get()
    if (!selectedVariant || !product) {
      return
    }

    const stock = getStockQuantity(
      selectedVariant,
      product.productType,
      selectedBranchId,
    )

    set({ quantity: Math.max(1, Math.min(qty, stock || 1)) })
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

  getVariantPrice: (variant) => {
    return calculateNetPrice({
      price: variant.price,
      discount: {
        active: variant.discountActive ?? false,
        type: variant.discountType ?? '',
        amount: variant.discountAmount ?? 0,
      },
    })
  },

  getTotalPrice: () => {
    const {
      selectedVariant,
      selectedAddons,
      product,
      quantity,
      getVariantPrice,
    } = get()
    if (!selectedVariant) return 0
    let unitPrice = getVariantPrice(selectedVariant)
    selectedAddons.forEach((id) => {
      const addon = product?.addons.find((a) => a.id === id)
      if (addon?.isAvailable) unitPrice += addon.price
    })
    return unitPrice * quantity
  },

  getCurrentPoints: () => {
    const { selectedVariant, quantity } = get()
    return selectedVariant?.pointsActive
      ? selectedVariant.pointsAmount * quantity
      : 0
  },

  activeImageIndex: 0,
  setActiveImageIndex: (index) => set({ activeImageIndex: index }),
}))
