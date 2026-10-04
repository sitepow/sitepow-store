import { StorefrontProductDetail } from '@/actions/storefront/product/actions'
import { DiscountType } from '@/generated/prisma/enums'
import { CartItem, CartSummary, SelectedOption } from '@/types/cart'
import { calculateNetPrice } from '@/utils/product/product-calculation'

type CartOption = NonNullable<StorefrontProductDetail['options']>[number]

interface OptionInput {
  title: string
  choices: { name: string; extraPrice: number }[]
}

interface AddonInput {
  id: string
  price: number
  isAvailable?: boolean
}

interface VariantInput {
  id: string
  price: number | string
  discountActive?: boolean
  discountType?: string | null
  discountAmount?: number | null
  pointsActive?: boolean
  pointsAmount?: number | null
}

interface CalculateUnitPriceParams {
  variant: VariantInput
  options?: OptionInput[]
  selectedOptionsMap: Record<string, string[]>
  addons?: AddonInput[]
  selectedAddonIds: string[]
}

interface CalculateRewardPointsParams {
  variant?: VariantInput | null
  quantity: number
}

interface ValidateOptionsParams {
  options?: { title: string; require?: boolean }[]
  selectedOptionsMap: Record<string, string[]>
}

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

export const getStockByBranch = (
  variant: CartItem['variant'],
  branchId: string,
) => {
  const stock = variant?.stocks?.find((s) => s.branchId === branchId)
  return stock ? stock.quantity : 0
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

export const calculateCartUnitPrice = ({
  variant,
  options,
  selectedOptionsMap,
  addons,
  selectedAddonIds,
}: CalculateUnitPriceParams): number => {
  let unitPrice = calculateNetPrice({
    price: Number(variant.price),
    discount: variant.discountActive
      ? {
          active: true,
          type: variant.discountType ?? '',
          amount: Number(variant.discountAmount ?? 0),
        }
      : undefined,
  })

  Object.entries(selectedOptionsMap).forEach(([title, choices]) => {
    const optionGroup = options?.find((o) => o.title === title)
    if (optionGroup) {
      choices.forEach((choiceName) => {
        const choice = optionGroup.choices.find((c) => c.name === choiceName)
        if (choice) {
          unitPrice += choice.extraPrice
        }
      })
    }
  })

  addons?.forEach((addon) => {
    if (selectedAddonIds.includes(addon.id) && (addon.isAvailable ?? true)) {
      unitPrice += addon.price
    }
  })

  return unitPrice
}

export const calculateRewardPoints = ({
  variant,
  quantity,
}: CalculateRewardPointsParams): number => {
  if (!variant || !variant.pointsActive) {
    return 0
  }
  return (variant.pointsAmount ?? 0) * quantity
}

export function calculateEarnedPoints(
  total: number,
  pointEarnRate: number,
): number {
  if (!pointEarnRate || pointEarnRate <= 0) {
    return 0
  }
  return Math.floor(Math.max(0, total) / pointEarnRate)
}

export const validateRequiredOptions = ({
  options,
  selectedOptionsMap,
}: ValidateOptionsParams): string[] => {
  const missingOptions: string[] = []
  options?.forEach((option) => {
    const selected = selectedOptionsMap[option.title] ?? []
    if (option.require && selected.length === 0) {
      missingOptions.push(option.title)
    }
  })
  return missingOptions
}

interface CalculateTotalParams {
  subtotal: number
  couponDiscount: number
  pointsDiscount: number
}

export const calculateGrandTotal = ({
  subtotal,
  couponDiscount,
  pointsDiscount,
}: CalculateTotalParams) => {
  return Math.max(0, subtotal - couponDiscount - pointsDiscount)
}

export const calculateMaxUsablePoints = (
  subtotal: number,
  couponDiscount: number,
  pointRedeemRate: number,
  customerPoints: number,
) => {
  const remainingPrice = Math.max(0, subtotal - couponDiscount)
  const maxPointsPossible = Math.floor(remainingPrice / (pointRedeemRate || 1))
  return Math.min(customerPoints, maxPointsPossible)
}

export function calculateDiscounts({
  subtotal,
  coupon,
  usedPoints,
  pointRedeemRate,
}: {
  subtotal: number
  coupon?: {
    discountType: string
    discountAmount: number
    maxDiscount?: number | null
  }
  usedPoints: number
  pointRedeemRate: number
}) {
  let couponDiscount = 0
  if (coupon) {
    couponDiscount =
      coupon.discountType === DiscountType.PERCENTAGE
        ? (subtotal * Number(coupon.discountAmount)) / 100
        : Number(coupon.discountAmount)

    if (coupon.maxDiscount)
      couponDiscount = Math.min(couponDiscount, Number(coupon.maxDiscount))
    couponDiscount = Math.min(couponDiscount, subtotal)
  }

  const remainingAfterCoupon = subtotal - couponDiscount
  const calculatedPointsDiscount = usedPoints * Number(pointRedeemRate ?? 0)
  const pointsDiscount = Math.min(
    calculatedPointsDiscount,
    remainingAfterCoupon,
  )

  return { couponDiscount, pointsDiscount }
}

export const calculateCartSummary = (items: CartItem[]): CartSummary => {
  return items.reduce(
    (acc, item) => {
      const qty = item.quantity
      const unitPrice = item.unitPrice ?? 0

      const baseNetPrice = calculateNetPrice({
        price: Number(item.variant?.price ?? 0),
        discount: item.variant?.discountActive
          ? {
              active: true,
              type: item.variant.discountType ?? '',
              amount: Number(item.variant.discountAmount ?? 0),
            }
          : undefined,
      })

      const extraPrice = Math.max(0, unitPrice - baseNetPrice)

      const rawVariantPrice = Number(item.variant?.price ?? 0)
      const originalUnitPrice = Math.max(
        unitPrice,
        rawVariantPrice + extraPrice,
      )

      const itemSubtotal = originalUnitPrice * qty
      const itemFinalPrice = item.totalPrice ?? unitPrice * qty
      const itemDiscount = Math.max(0, itemSubtotal - itemFinalPrice)

      return {
        subtotal: acc.subtotal + itemSubtotal,
        totalDiscount: acc.totalDiscount + itemDiscount,
        totalPoints: acc.totalPoints + (item.rewardPoints ?? 0),
        totalQuantity: acc.totalQuantity + qty,
        finalPrice: acc.finalPrice + itemFinalPrice,
        totalWeight: acc.totalWeight + (item.weight || 0) * qty,
      }
    },
    {
      subtotal: 0,
      totalDiscount: 0,
      totalPoints: 0,
      totalQuantity: 0,
      finalPrice: 0,
      totalWeight: 0,
    },
  )
}
