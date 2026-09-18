'use client'

import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'

import { useTranslations } from 'next-intl'

import {
  useRequestTableBill,
  useSubmitTableOrder,
} from '@/actions/hooks/restaurant/order'
import { TableCartItem } from '@/types/restaurant'

export function useTableCart({ token }: { token: string }) {
  const t = useTranslations('storefront.tableOrder')
  const [cart, setCart] = useState<TableCartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [kitchenNote, setKitchenNote] = useState('')

  const submitOrderMutation = useSubmitTableOrder()
  const requestBillMutation = useRequestTableBill()

  const totalCartCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart],
  )
  const cartTotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
    [cart],
  )

  const handleAddToCart = (item: TableCartItem) => {
    setCart((prev) => [...prev, item])
    toast.success(t('toasts.addedToCart', { name: item.title }))
  }

  const handleUpdateCartQuantity = (tempId: string, delta: number) => {
    setCart(
      (prev) =>
        prev
          .map((item) => {
            if (item.tempId !== tempId) return item
            const newQty = item.quantity + delta
            return newQty > 0 ? { ...item, quantity: newQty } : null
          })
          .filter(Boolean) as TableCartItem[],
    )
  }

  const handleRemoveFromCart = (tempId: string) => {
    setCart((prev) => prev.filter((item) => item.tempId !== tempId))
  }

  const handleClearCart = () => setCart([])

  const handleSubmitOrder = async (onSuccessCallback?: () => void) => {
    if (cart.length === 0) return
    const res = await submitOrderMutation.mutateAsync({
      tableToken: token,
      kitchenNote: kitchenNote.trim() || undefined,
      items: cart.map((c) => ({
        productId: c.productId,
        variantId: c.variantId,
        title: c.title,
        variantTitle: c.variantTitle,
        quantity: c.quantity,
        price: c.unitPrice,
        customerNote: c.customerNote,
      })),
    })

    if (res.success) {
      toast.success(t('toasts.orderSuccess'))
      setCart([])
      setKitchenNote('')
      setIsCartOpen(false)
      onSuccessCallback?.()
    } else {
      toast.error(res.messageTH || t('toasts.orderError'))
    }
  }

  const handleRequestBill = async () => {
    const res = await requestBillMutation.mutateAsync({ tableToken: token })
    if (res.success) toast.success(t('toasts.billSuccess'))
    else toast.error(res.messageTH || t('toasts.billError'))
  }

  return {
    cart,
    isCartOpen,
    setIsCartOpen,
    kitchenNote,
    setKitchenNote,
    totalCartCount,
    cartTotal,
    handleAddToCart,
    handleUpdateCartQuantity,
    handleRemoveFromCart,
    handleClearCart,
    handleSubmitOrder,
    handleRequestBill,
    isSubmittingOrder: submitOrderMutation.isPending,
    isRequestingBill: requestBillMutation.isPending,
  }
}
