import { CartItem, CartSummary } from '@/types/sites/cart'
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

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (newItem) => {
        const { items } = get()

        const optionKey = JSON.stringify(newItem.selectedOptions)
        const addonKey = JSON.stringify(
          newItem.selectedAddons.map((a) => a.addonId).sort(),
        )

        const existingItemIndex = items.findIndex(
          (item) =>
            item.productId === newItem.productId &&
            item.variant.variantId === newItem.variant.variantId &&
            JSON.stringify(item.selectedOptions) === optionKey &&
            JSON.stringify(item.selectedAddons.map((a) => a.addonId).sort()) ===
              addonKey,
        )

        if (existingItemIndex > -1) {
          const updatedItems = [...items]
          const existingItem = updatedItems[existingItemIndex]

          const newQty = existingItem.quantity + newItem.quantity
          existingItem.quantity = newItem.variant.stock
            ? Math.min(newQty, newItem.variant.stock)
            : newQty

          existingItem.totalPrice =
            existingItem.unitPrice * existingItem.quantity
          set({ items: updatedItems })
        } else {
          const cartItem: CartItem = {
            ...newItem,
            cartItemId: uuidv7(),
            totalPrice: newItem.unitPrice * newItem.quantity,
          }
          set({ items: [...items, cartItem] })
        }
      },

      removeItem: (cartItemId) => {
        set((state) => ({
          items: state.items.filter((item) => item.cartItemId !== cartItemId),
        }))
      },

      updateQuantity: (cartItemId, qty) => {
        set((state) => ({
          items: state.items.map((item) => {
            if (item.cartItemId === cartItemId) {
              const validatedQty = Math.max(
                1,
                item.variant.stock ? Math.min(qty, item.variant.stock) : qty,
              )
              return {
                ...item,
                quantity: validatedQty,
                totalPrice: item.unitPrice * validatedQty,
              }
            }
            return item
          }),
        }))
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
