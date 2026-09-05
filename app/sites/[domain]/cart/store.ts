import toast from 'react-hot-toast'

import { ProductType } from '@/generated/prisma/enums'
import { CartItem, CartSummary } from '@/types/sites/cart'
import {
  calculateCartSummary,
  calculateRewardPoints,
  getRemainingStock,
  getStockByBranch,
  isSameCartItem,
} from '@/utils/cart'
import { getStockQuantity } from '@/utils/product'
import { uuidv7 } from 'uuidv7'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface AppliedCoupon {
  id: string
  code: string
  discountAmount: number
}

interface CartStore {
  items: CartItem[]
  appliedCoupon: AppliedCoupon | null
  usedPoints: number
  addItem: (
    item: Omit<CartItem, 'cartItemId' | 'totalPrice'>,
    messages?: {
      consignmentStockOut?: string
      branchStockOut?: string
      addedToCart?: string
    },
  ) => void
  removeItem: (cartItemId: string) => void
  updateQuantity: (cartItemId: string, qty: number) => void
  clearCart: () => void
  setAppliedCoupon: (coupon: AppliedCoupon | null) => void
  setUsedPoints: (points: number) => void
  getCartSummary: () => CartSummary
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      appliedCoupon: null,
      usedPoints: 0,
      addItem: (newItem, messages) => {
        const { items } = get()

        const getAvailableStock = () => {
          if (
            newItem.productType === ProductType.DIGITAL_LINK ||
            newItem.productType === ProductType.DIGITAL_SERVICE
          ) {
            return 999999
          }
          if (newItem.isReseller) {
            return newItem.variant.stocks[0]?.quantity ?? 0
          }
          return getStockQuantity(
            newItem.variant,
            newItem.productType,
            newItem.branchId,
          )
        }

        const branchStock = getAvailableStock()

        const itemsToCompare = newItem.isReseller
          ? items.filter((i) => i.isReseller)
          : items.filter((i) => i.branchId === newItem.branchId)

        const remaining = getRemainingStock(itemsToCompare, {
          variantId: newItem.variant.id,
          stock: branchStock,
        })

        if (
          newItem.productType !== ProductType.DIGITAL_LINK &&
          newItem.productType !== ProductType.DIGITAL_SERVICE &&
          remaining <= 0
        ) {
          toast.error(
            newItem.isReseller
              ? (messages?.consignmentStockOut ?? 'Consignment stock sold out')
              : (messages?.branchStockOut ?? 'Branch stock sold out'),
          )
          return
        }

        const existingIndex = items.findIndex(
          (item) =>
            isSameCartItem(item, newItem) &&
            (newItem.isReseller
              ? item.isReseller
              : item.branchId === newItem.branchId),
        )

        const finalQty =
          newItem.productType === ProductType.DIGITAL_LINK ||
          newItem.productType === ProductType.DIGITAL_SERVICE
            ? newItem.quantity
            : Math.min(newItem.quantity, remaining)

        if (existingIndex > -1) {
          const updatedItems = [...items]
          updatedItems[existingIndex].quantity += finalQty
          updatedItems[existingIndex].totalPrice =
            updatedItems[existingIndex].unitPrice *
            updatedItems[existingIndex].quantity
          updatedItems[existingIndex].rewardPoints = calculateRewardPoints({
            variant: newItem.variant,
            quantity: updatedItems[existingIndex].quantity,
          })
          set({ items: updatedItems })
        } else {
          const cartItem: CartItem = {
            ...newItem,
            cartItemId: uuidv7(),
            quantity: finalQty,
            totalPrice: newItem.unitPrice * finalQty,
            rewardPoints: calculateRewardPoints({
              variant: newItem.variant,
              quantity: finalQty,
            }),
          }
          set({ items: [...items, cartItem] })
        }
        toast.success(messages?.addedToCart ?? 'Added to cart')
      },
      removeItem: (cartItemId) => {
        set((state) => ({
          items: state.items.filter((item) => item.cartItemId !== cartItemId),
        }))
      },
      updateQuantity: (cartItemId, qty) => {
        const { items } = get()
        const target = items.find((i) => i.cartItemId === cartItemId)
        if (!target) {
          return
        }

        const branchStock = target.isReseller
          ? (target.variant.stocks[0]?.quantity ?? 0)
          : getStockByBranch(target.variant, target.branchId)

        const itemsToCompare = target.isReseller
          ? items.filter((i) => i.isReseller && i.cartItemId !== cartItemId)
          : items.filter(
              (i) =>
                i.branchId === target.branchId && i.cartItemId !== cartItemId,
            )

        const remaining = getRemainingStock(itemsToCompare, {
          variantId: target.variant.id,
          stock: branchStock,
        })

        const validatedQty = Math.max(1, Math.min(qty, remaining))
        set({
          items: items.map((item) =>
            item.cartItemId === cartItemId
              ? {
                  ...item,
                  quantity: validatedQty,
                  totalPrice: item.unitPrice * validatedQty,
                  rewardPoints: calculateRewardPoints({
                    variant: item.variant,
                    quantity: validatedQty,
                  }),
                }
              : item,
          ),
        })
      },
      clearCart: () => set({ items: [], appliedCoupon: null, usedPoints: 0 }),
      setAppliedCoupon: (coupon) => set({ appliedCoupon: coupon }),
      setUsedPoints: (points) => set({ usedPoints: Math.max(0, points) }),
      getCartSummary: () => calculateCartSummary(get().items),
    }),
    {
      name: 'shopping-cart-storage',
    },
  ),
)
