import { CartItem, SelectedOption } from '@/types/sites/cart'
import { Product, ProductAddon, ProductVariant } from '@/types/sites/product'

import { calculateNetPrice } from './product'

export const isSameCartItem = (
  item1: Partial<CartItem>,
  item2: Partial<CartItem>,
) => {
  const optionKey1 = JSON.stringify(item1.selectedOptions)
  const optionKey2 = JSON.stringify(item2.selectedOptions)

  const addonKey1 = JSON.stringify(
    item1.selectedAddons?.map((addon) => addon.addonId).sort(),
  )
  const addonKey2 = JSON.stringify(
    item2.selectedAddons?.map((addon) => addon.addonId).sort(),
  )

  return (
    item1.productId === item2.productId &&
    item1.variant?.variantId === item2.variant?.variantId &&
    optionKey1 === optionKey2 &&
    addonKey1 === addonKey2
  )
}

export const getRemainingStock = (
  items: CartItem[],
  params: {
    variantId: string
    stock: number
    excludeCartItemId?: string
  },
) => {
  const { variantId, stock, excludeCartItemId } = params

  const usedInCart = items
    .filter(
      (i) =>
        i.variant.variantId === variantId && i.cartItemId !== excludeCartItemId,
    )
    .reduce((sum, i) => sum + i.quantity, 0)

  return Math.max(0, stock - usedInCart)
}

export const calculateUnitPrice = (
  variant: ProductVariant,
  selectedOptions: SelectedOption[],
  selectedAddons: ProductAddon[],
): number => {
  let price = calculateNetPrice({
    price: variant.price,
    discount: variant.discount,
  })

  selectedOptions.forEach((option) => {
    price += option.extraPrice
  })

  selectedAddons.forEach((addon) => {
    if (addon.isAvailable) {
      price += addon.price
    }
  })

  return price
}

export const mapSelectedOptions = (
  product: Product,
  selectedOptions: Record<string, string[]>,
): SelectedOption[] => {
  const mapped: SelectedOption[] = []

  Object.entries(selectedOptions).forEach(([title, choices]) => {
    const optionGroup = product.options.find((option) => option.title === title)

    if (optionGroup) {
      choices.forEach((choiceName) => {
        const choice = optionGroup.choices.find(
          (choice) => choice.name === choiceName,
        )

        if (choice) {
          mapped.push({
            optionTitle: title,
            choiceName: choiceName,
            extraPrice: choice.extraPrice,
          })
        }
      })
    }
  })

  return mapped
}
