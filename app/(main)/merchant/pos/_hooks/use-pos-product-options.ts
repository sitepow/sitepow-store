'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import { POSProductItem } from '@/actions/pos/product'
import { DiscountType } from '@/generated/prisma/enums'
import { useBranchFilter } from '@/stores/use-branch-filter'
import { CartItem } from '@/types/sites/cart'
import { calculateCartUnitPrice, getRemainingStock } from '@/utils/cart'
import { calculateNetPrice } from '@/utils/product'

export interface SelectedOptionPayload {
  groupTitle: string
  choiceName: string
}

export interface SelectedAddonPayload {
  id: string
  title: string
  price: number
}

interface UsePosProductOptionsParams {
  product: POSProductItem | null
  cartItems?: CartItem[]
  onClose: () => void
  onConfirm: (
    product: POSProductItem,
    variantId: string,
    options?: SelectedOptionPayload[],
    addons?: SelectedAddonPayload[],
    quantity?: number,
  ) => void
}

export function usePosProductOptions({
  product,
  cartItems = [],
  onClose,
  onConfirm,
}: UsePosProductOptionsParams) {
  const { selectedBranchId } = useBranchFilter()

  const [selectedVariantId, setSelectedVariantId] = useState<string>(
    product?.variants[0]?.id ?? '',
  )
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string>
  >(() => {
    const initialOptions: Record<string, string> = {}
    product?.options?.forEach((opt) => {
      if (opt.choices.length > 0) {
        initialOptions[opt.title] = opt.choices[0].name
      }
    })
    return initialOptions
  })
  const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>([])
  const [quantity, setQuantity] = useState<number>(1)

  useEffect(() => {
    if (product?.variants?.length) {
      setSelectedVariantId(product.variants[0].id)
    }
    setQuantity(1)
    setSelectedAddonIds([])
    const initialOptions: Record<string, string> = {}
    product?.options?.forEach((opt) => {
      if (opt.choices.length > 0) {
        initialOptions[opt.title] = opt.choices[0].name
      }
    })
    setSelectedOptions(initialOptions)
  }, [product])

  const getVariantAvailableStock = useCallback(
    (variant: POSProductItem['variants'][number]) => {
      if (product?.isReseller) {
        const resellerStock = variant.stocks[0]?.quantity ?? 0
        return getRemainingStock(cartItems, {
          variantId: variant.id,
          stock: resellerStock,
        })
      }

      if (!selectedBranchId) {
        return 0
      }

      const branchStock =
        variant.stocks.find((s) => s.branchId === selectedBranchId)?.quantity ??
        0

      return getRemainingStock(cartItems, {
        variantId: variant.id,
        stock: branchStock,
      })
    },
    [product?.isReseller, selectedBranchId, cartItems],
  )

  const currentVariant = useMemo(() => {
    if (!product) {
      return null
    }
    return (
      product.variants.find((v) => v.id === selectedVariantId) ||
      product.variants[0]
    )
  }, [product, selectedVariantId])

  const currentVariantStock = useMemo(() => {
    if (!currentVariant) {
      return 0
    }
    return getVariantAvailableStock(currentVariant)
  }, [currentVariant, getVariantAvailableStock])

  useEffect(() => {
    if (currentVariantStock > 0 && quantity > currentVariantStock) {
      setQuantity(currentVariantStock)
    }
  }, [selectedVariantId, currentVariantStock, quantity])

  const isInvalidQuantity =
    currentVariantStock <= 0 || quantity > currentVariantStock

  const selectedOptionsMap = useMemo(() => {
    const map: Record<string, string[]> = {}
    Object.entries(selectedOptions).forEach(([k, v]) => {
      if (v) map[k] = [v]
    })
    return map
  }, [selectedOptions])

  const unitPrice = useMemo(() => {
    if (!product || !currentVariant) {
      return 0
    }

    return calculateCartUnitPrice({
      variant: currentVariant,
      options: product.options,
      selectedOptionsMap,
      addons: product.addons,
      selectedAddonIds,
    })
  }, [product, currentVariant, selectedOptionsMap, selectedAddonIds])

  const handleConfirmAddToCart = () => {
    if (!product || !currentVariant || isInvalidQuantity) {
      return
    }

    const formattedOptions: SelectedOptionPayload[] = Object.entries(
      selectedOptions,
    ).map(([groupTitle, choiceName]) => ({
      groupTitle,
      choiceName,
    }))

    const formattedAddons: SelectedAddonPayload[] = selectedAddonIds
      .map((id) => {
        const addon = product.addons?.find((a) => a.id === id)
        if (!addon) {
          return null
        }
        return {
          id: addon.id,
          title: addon.title,
          price: addon.price,
        }
      })
      .filter((item): item is SelectedAddonPayload => item !== null)

    onConfirm(
      product,
      currentVariant.id,
      formattedOptions,
      formattedAddons,
      quantity,
    )

    onClose()
  }

  const handleOptionChange = (groupTitle: string, choiceName: string) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [groupTitle]: choiceName,
    }))
  }

  const handleAddonToggle = (addonId: string) => {
    setSelectedAddonIds((prev) =>
      prev.includes(addonId)
        ? prev.filter((id) => id !== addonId)
        : [...prev, addonId],
    )
  }

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1)
    }
  }

  const handleIncrement = () => {
    if (quantity < currentVariantStock) {
      setQuantity((prev) => prev + 1)
    }
  }

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10)
    if (!isNaN(val)) {
      const maxVal = currentVariantStock > 0 ? currentVariantStock : 1
      const clamped = Math.max(1, Math.min(val, maxVal))
      setQuantity(clamped)
    }
  }

  const currentDiscountConfig =
    currentVariant?.discountActive && currentVariant?.discountType
      ? {
          active: true,
          type: currentVariant.discountType as DiscountType,
          amount: currentVariant.discountAmount ?? 0,
        }
      : undefined

  const rawVariantPrice = Number(currentVariant?.price ?? 0)
  const netVariantPrice = calculateNetPrice({
    price: rawVariantPrice,
    discount: currentDiscountConfig,
  })
  const currentVariantHasDiscount =
    !!currentDiscountConfig && netVariantPrice < rawVariantPrice

  return {
    selectedVariantId,
    setSelectedVariantId,
    selectedOptions,
    selectedAddonIds,
    quantity,
    setQuantity,
    currentVariant,
    currentVariantStock,
    isInvalidQuantity,
    unitPrice,
    rawVariantPrice,
    currentVariantHasDiscount,
    getVariantAvailableStock,
    handleConfirmAddToCart,
    handleOptionChange,
    handleAddonToggle,
    handleDecrement,
    handleIncrement,
    handleQuantityChange,
  }
}

