import toast from 'react-hot-toast'

import { ProductType } from '@/generated/prisma/enums'
import { CartItem, CartSummary } from '@/types/sites/cart'
import { getRemainingStock, isSameCartItem } from '@/utils/cart'
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

  addItem: (item: Omit<CartItem, 'cartItemId' | 'totalPrice'>) => void
  removeItem: (cartItemId: string) => void
  updateQuantity: (cartItemId: string, qty: number) => void
  clearCart: () => void

  setAppliedCoupon: (coupon: AppliedCoupon | null) => void
  setUsedPoints: (points: number) => void

  getCartSummary: () => CartSummary
}

const getRewardPoints = (variant: CartItem['variant'], quantity: number) =>
  variant.pointsActive ? variant.pointsAmount * quantity : 0

const getStockByBranch = (variant: CartItem['variant'], branchId: string) => {
  const stock = variant.stocks.find((s) => s.branchId === branchId)
  return stock ? stock.quantity : 0
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      appliedCoupon: null,
      usedPoints: 0,

      addItem: (newItem) => {
        const { items } = get()

        const getAvailableStock = () => {
          if (
            newItem.productType === ProductType.DIGITAL_LINK ||
            newItem.productType === ProductType.DIGITAL_SERVICE
          ) {
            return 999999
          }

          return getStockQuantity(
            newItem.variant,
            newItem.productType,
            newItem.branchId,
          )
        }

        const branchStock = getAvailableStock()

        const itemsInSameBranch = items.filter(
          (i) => i.branchId === newItem.branchId,
        )

        const remaining = getRemainingStock(itemsInSameBranch, {
          variantId: newItem.variant.id,
          stock: branchStock,
        })

        if (
          newItem.productType !== ProductType.DIGITAL_LINK &&
          newItem.productType !== ProductType.DIGITAL_SERVICE &&
          remaining <= 0
        ) {
          toast.error('สินค้าในสาขานี้หมดแล้ว')
          return
        }

        const existingIndex = items.findIndex(
          (item) =>
            isSameCartItem(item, newItem) && item.branchId === newItem.branchId,
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
          updatedItems[existingIndex].rewardPoints = getRewardPoints(
            newItem.variant,
            updatedItems[existingIndex].quantity,
          )
          set({ items: updatedItems })
        } else {
          const cartItem: CartItem = {
            ...newItem,
            cartItemId: uuidv7(),
            quantity: finalQty,
            totalPrice: newItem.unitPrice * finalQty,
            rewardPoints: getRewardPoints(newItem.variant, finalQty),
          }
          set({ items: [...items, cartItem] })
        }

        toast.success('เพิ่มสินค้าลงในตะกร้าแล้ว')
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

        const branchStock = getStockByBranch(target.variant, target.branchId)

        const itemsInSameBranch = items.filter(
          (i) => i.branchId === target.branchId && i.cartItemId !== cartItemId,
        )

        const remaining = getRemainingStock(itemsInSameBranch, {
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
                  rewardPoints: getRewardPoints(item.variant, validatedQty),
                }
              : item,
          ),
        })
      },

      clearCart: () => set({ items: [], appliedCoupon: null, usedPoints: 0 }),

      setAppliedCoupon: (coupon) => set({ appliedCoupon: coupon }),

      setUsedPoints: (points) => set({ usedPoints: Math.max(0, points) }),

      getCartSummary: () => {
        const { items } = get()
        return items.reduce(
          (acc, item) => ({
            subtotal: acc.subtotal + item.variant.price * item.quantity,
            totalDiscount:
              acc.totalDiscount +
              (item.variant.price - item.unitPrice) * item.quantity,
            totalPoints: acc.totalPoints + item.rewardPoints,
            totalQuantity: acc.totalQuantity + item.quantity,
            finalPrice: acc.finalPrice + item.totalPrice,
            totalWeight: acc.totalWeight + (item.weight || 0) * item.quantity,
          }),
          {
            subtotal: 0,
            totalDiscount: 0,
            totalPoints: 0,
            totalQuantity: 0,
            finalPrice: 0,
            totalWeight: 0,
          },
        )
      },
    }),
    {
      name: 'shopping-cart-storage',
    },
  ),
)
