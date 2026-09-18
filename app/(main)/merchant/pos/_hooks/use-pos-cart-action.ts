'use client'

import toast from 'react-hot-toast'
import { useTranslations } from 'next-intl'

import { POSProductItem } from '@/actions/pos/product'
import { CartItem } from '@/types/sites/cart'
import { calculateCartUnitPrice, getRemainingStock } from '@/utils/cart'

import {
  SelectedAddonPayload,
  SelectedOptionPayload,
} from '../_components/PosProductOptionDialog'

interface UsePosCartActionParams {
  cartItems: CartItem[]
  addItem: (item: Omit<CartItem, 'cartItemId' | 'totalPrice'>) => void
  selectedBranchId: string
}

export function usePosCartAction({
  cartItems,
  addItem,
  selectedBranchId,
}: UsePosCartActionParams) {
  const t = useTranslations('merchant.pos')

  const handleAddToCart = (
    product: POSProductItem,
    variantId: string,
    options?: SelectedOptionPayload[],
    addons?: SelectedAddonPayload[],
    quantity: number = 1,
  ) => {
    if (!selectedBranchId) {
      return
    }

    const variant = product.variants.find((v) => v.id === variantId)
    if (!variant) {
      return
    }

    const branchStock =
      variant.stocks.find((s) => s.branchId === selectedBranchId)?.quantity ?? 0

    const remainingStock = getRemainingStock(cartItems, {
      variantId: variant.id,
      stock: branchStock,
    })

    if (quantity > remainingStock) {
      toast.error(
        product.isReseller
          ? t('resellerStockNotEnough', { count: remainingStock })
          : t('stockNotEnough', { count: remainingStock }),
      )
      return
    }

    const currentBranchStock = variant.stocks.find(
      (s) => s.branchId === selectedBranchId,
    )

    const selectedOptionsMap: Record<string, string[]> = {}
    const formattedOptions = (options ?? []).map((opt) => {
      selectedOptionsMap[opt.groupTitle] = [opt.choiceName]
      const optionGroup = product.options?.find(
        (o) => o.title === opt.groupTitle,
      )
      const choice = optionGroup?.choices.find((c) => c.name === opt.choiceName)

      return {
        optionTitle: opt.groupTitle,
        choiceName: opt.choiceName,
        extraPrice: choice?.extraPrice ?? 0,
      }
    })

    const selectedAddonIds = addons?.map((a) => a.id) ?? []
    const formattedAddons = (addons ?? []).map((addon) => ({
      id: addon.id,
      title: addon.title,
      price: addon.price,
      isAvailable: true,
      translations:
        'translations' in addon ? (addon.translations as null) : null,
    }))

    const unitPrice = calculateCartUnitPrice({
      variant,
      options: product.options,
      selectedOptionsMap,
      addons: product.addons,
      selectedAddonIds,
    })

    const selectedImage =
      variant.image ||
      product.images.find((img) => img.isPrimary)?.url ||
      product.images[0]?.url ||
      ''

    addItem({
      productId: product.id,
      productTitle: product.title,
      image: selectedImage,
      weight: variant.weight ?? 0,
      variant: {
        ...variant,
        digitalUrl: null,
        price: Number(variant.price),
        translations:
          'translations' in variant ? (variant.translations as null) : null,
      },
      selectedOptions: formattedOptions,
      selectedAddons: formattedAddons,
      quantity,
      unitPrice,
      originalPrice: Number(variant.price),
      rewardPoints: variant.pointsActive ? (variant.pointsAmount ?? 0) : 0,
      branchId: selectedBranchId,
      branchName: currentBranchStock?.branch.name ?? '',
      productType: product.productType,
      isReseller: product.isReseller,
      agreementId: product.resellerAgreementId,
      storeId: product.storeId,
      supplierStoreId: product.isReseller ? product.storeId : undefined,
    })
  }

  return { handleAddToCart }
}

