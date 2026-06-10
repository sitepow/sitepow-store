import toast from 'react-hot-toast'

import { CartItem, CartSummary } from '@/types/sites/cart'
import { getRemainingStock, isSameCartItem } from '@/utils/cart'
import { uuidv7 } from 'uuidv7'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface CartStore {
  items: CartItem[]

  addItem: (item: Omit<CartItem, 'cartItemId' | 'totalPrice'>) => void
  removeItem: (cartItemId: string) => void
  updateQuantity: (cartItemId: string, qty: number) => void
  clearCart: () => void

  getCartSummary: () => CartSummary
}

const getStock = (variant: CartItem['variant']) =>
  variant.stocks.reduce((sum, s) => sum + s.quantity, 0)

const getRewardPoints = (variant: CartItem['variant'], quantity: number) =>
  variant.pointsActive ? variant.pointsAmount * quantity : 0

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (newItem) => {
        const { items } = get()

        const remaining = getRemainingStock(items, {
          variantId: newItem.variant.id,
          stock: getStock(newItem.variant),
        })

        if (remaining <= 0) {
          toast.error('สินค้าในสต็อกไม่เพียงพอ')
          return
        }

        const existingIndex = items.findIndex((item) =>
          isSameCartItem(item, newItem),
        )
        const finalQty = Math.min(newItem.quantity, remaining)

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

        const remaining = getRemainingStock(items, {
          variantId: target.variant.id,
          stock: getStock(target.variant),
          excludeCartItemId: cartItemId,
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

      clearCart: () => set({ items: [] }),

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
          }),
          {
            subtotal: 0,
            totalDiscount: 0,
            totalPoints: 0,
            totalQuantity: 0,
            finalPrice: 0,
          },
        )
      },
    }),
    {
      name: 'shopping-cart-storage',
    },
  ),
)
