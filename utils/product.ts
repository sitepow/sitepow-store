import {
  CalculatedProduct,
  Discount,
  DiscountType,
  Product,
  ProductVariant,
} from '@/types/sites/product'

export const calculateNetPrice = ({
  price,
  discount,
}: {
  price: number
  discount?: Discount
}): number => {
  if (!discount || !discount.active) {
    return price
  }

  switch (discount.type) {
    case DiscountType.PERCENTAGE:
      return price - (price * discount.amount) / 100
    case DiscountType.FIXED:
      return Math.max(0, price - discount.amount)
    default:
      return price
  }
}

export const calculateProduct = (product: Product): CalculatedProduct => {
  const variants = product?.variants || []

  if (variants.length === 0) {
    return {
      original: { min: 0, max: 0, avg: 0 },
      net: { min: 0, max: 0, avg: 0 },
      hasDiscount: false,
      maxDiscountPercent: 0,
    }
  }

  const originalPrices = variants.map((variant) => variant.price)
  const netPrices = variants.map((variant) =>
    calculateNetPrice({ price: variant.price, discount: variant.discount }),
  )

  const getStats = (prices: number[]) => {
    const min = Math.min(...prices)
    const max = Math.max(...prices)
    const avg = prices.reduce((a, b) => a + b, 0) / prices.length
    return { min, max, avg }
  }

  const originalStats = getStats(originalPrices)
  const netStats = getStats(netPrices)

  const hasDiscount = netPrices.some(
    (netPrice, index) => netPrice < originalPrices[index],
  )

  const discountPercentages = variants.map((variant) => {
    if (variant.price === 0) {
      return 0
    }

    const net = calculateNetPrice({
      price: variant.price,
      discount: variant.discount,
    })

    return ((variant.price - net) / variant.price) * 100
  })

  return {
    original: originalStats,
    net: netStats,
    hasDiscount,
    maxDiscountPercent: hasDiscount
      ? Math.round(Math.max(...discountPercentages))
      : 0,
  }
}

export const getVariantNetPrice = (variant: ProductVariant): number => {
  return calculateNetPrice({ price: variant.price, discount: variant.discount })
}

export const calculateRewardPoints = (
  variant: ProductVariant | null,
  quantity: number,
): number => {
  if (variant?.rewardPoints?.isActive) {
    return variant.rewardPoints.amount * quantity
  }
  return 0
}

export const validateProductRequirements = (
  product: Product,
  selectedOptions: Record<string, string[]>,
) => {
  const missingOptions: string[] = []

  product.options.forEach((option) => {
    if (option.require) {
      const selections = selectedOptions[option.title] || []

      if (selections.length === 0) {
        missingOptions.push(option.title)
      }
    }
  })

  return {
    isValid: missingOptions.length === 0,
    missingOptions,
  }
}
