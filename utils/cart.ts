import { StorefrontProductDetail } from '@/actions/storefront/product'
import { CartItem, SelectedOption } from '@/types/sites/cart'

type CartOption = NonNullable<StorefrontProductDetail['options']>[number]

export const isSameCartItem = (
  item1: Partial<CartItem>,
  item2: Partial<CartItem>,
) => {
  const optionKey1 = JSON.stringify(item1.selectedOptions)
  const optionKey2 = JSON.stringify(item2.selectedOptions)

  const addonKey1 = JSON.stringify(
    item1.selectedAddons?.map((addon) => addon.id).sort(),
  )
  const addonKey2 = JSON.stringify(
    item2.selectedAddons?.map((addon) => addon.id).sort(),
  )

  return (
    item1.productId === item2.productId &&
    item1.variant?.id === item2.variant?.id &&
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
      (i) => i.variant.id === variantId && i.cartItemId !== excludeCartItemId,
    )
    .reduce((sum, i) => sum + i.quantity, 0)

  return Math.max(0, stock - usedInCart)
}

export const mapSelectedOptions = (
  options: CartOption[],
  selectedOptions: Record<string, string[]>,
): SelectedOption[] => {
  const mapped: SelectedOption[] = []

  Object.entries(selectedOptions).forEach(([title, choices]) => {
    const optionGroup = options.find((o) => o.title === title)

    if (optionGroup) {
      choices.forEach((choiceName) => {
        const choice = optionGroup.choices.find((c) => c.name === choiceName)
        if (choice) {
          mapped.push({
            optionTitle: title,
            choiceName,
            extraPrice: choice.extraPrice,
          })
        }
      })
    }
  })

  return mapped
}
