import { StorefrontProductDetail } from '@/actions/storefront/product'
import { DiscountType, ProductType } from '@/generated/prisma/enums'
import { ProductWithRelations } from '@/types/product'
import { ProductFormValues } from '@/zod/product'

export interface CalculatedProduct {
  original: PriceStats
  net: PriceStats
  hasDiscount: boolean
  maxDiscountPercent: number
}

export interface ProductForCalculation {
  variants: {
    price: number
    discountActive: boolean
    discountType: 'PERCENTAGE' | 'FIXED' | null
    discountAmount: number | null
  }[]
}
export interface VariantForCalculation {
  price: number
  discountActive: boolean
  discountType: 'PERCENTAGE' | 'FIXED' | null
  discountAmount: number | null
}

export interface PriceStats {
  min: number
  max: number
  avg: number
}

const calculateNetPriceFromVariant = (
  variant: VariantForCalculation,
): number => {
  if (
    !variant.discountActive ||
    !variant.discountType ||
    !variant.discountAmount
  ) {
    return variant.price
  }

  switch (variant.discountType) {
    case 'PERCENTAGE':
      return variant.price - (variant.price * variant.discountAmount) / 100
    case 'FIXED':
      return Math.max(0, variant.price - variant.discountAmount)
    default:
      return variant.price
  }
}

const getStats = (prices: number[]): PriceStats => {
  const min = Math.min(...prices)
  const max = Math.max(...prices)
  const avg = prices.reduce((a, b) => a + b, 0) / prices.length
  return { min, max, avg }
}

export const calculateProduct = (
  product: ProductForCalculation,
): CalculatedProduct => {
  const variants = product.variants ?? []

  if (variants.length === 0) {
    return {
      original: { min: 0, max: 0, avg: 0 },
      net: { min: 0, max: 0, avg: 0 },
      hasDiscount: false,
      maxDiscountPercent: 0,
    }
  }

  const originalPrices = variants.map((v) => v.price)
  const netPrices = variants.map((v) => calculateNetPriceFromVariant(v))

  const hasDiscount = netPrices.some((net, i) => net < originalPrices[i])

  const discountPercentages = variants.map((v, i) => {
    if (originalPrices[i] === 0) {
      return 0
    }
    return ((originalPrices[i] - netPrices[i]) / originalPrices[i]) * 100
  })

  return {
    original: getStats(originalPrices),
    net: getStats(netPrices),
    hasDiscount,
    maxDiscountPercent: hasDiscount
      ? Math.round(Math.max(...discountPercentages))
      : 0,
  }
}

export const calculateNetPrice = ({
  price,
  discount,
}: {
  price: number
  discount?: { active: boolean; type: string; amount: number }
}): number => {
  if (!discount?.active) {
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

export const calculateRewardPoints = (
  variant: { rewardPoints?: { isActive: boolean; amount: number } } | null,
  quantity: number,
): number => {
  if (variant?.rewardPoints?.isActive) {
    return variant.rewardPoints.amount * quantity
  }
  return 0
}

export const getVariantNetPrice = (variant: {
  price: number
  discount?: { active: boolean; type: string; amount: number }
}): number => {
  return calculateNetPrice({ price: variant.price, discount: variant.discount })
}

export const transformProductToFormValues = (
  product: ProductWithRelations,
): ProductFormValues => {
  return {
    ...product,
    isPublished: product.isPublished ?? true,
    tags: product.tags.map((t) => t.name).join(', '),
    images:
      product.images?.map((img) => ({
        url: img.url,
        isPrimary: img.isPrimary ?? false,
      })) || [],
    variants: product.variants.map((v) => ({
      id: v.id,
      title: v.title,
      price: Number(v.price),
      costPrice: Number(v.costPrice ?? 0),
      sku: v.sku || '',
      image: v.image || null,
      weight: v.weight ?? 0,
      width: v.width ?? 0,
      height: v.height ?? 0,
      length: v.length ?? 0,
      digitalUrl: v.digitalUrl ?? '',
      stocks: v.stocks.map((s) => ({
        branchId: s.branchId,
        quantity: s.quantity,
        minStock: s.minStock,
      })),
      discount: {
        active: v.discountActive,
        type: v.discountType ?? DiscountType.PERCENTAGE,
        amount: Number(v.discountAmount ?? 0),
      },
      digitalItems:
        v.digitalItems?.map((item) => ({
          content: item.content,
          isUsed: item.isUsed,
        })) ?? [],
      rewardPoints: {
        isActive: v.pointsActive,
        amount: v.pointsAmount,
      },
      isAvailable: v.isAvailable ?? false,
    })),
    addons: product.addons.map((a) => ({
      title: a.title,
      price: Number(a.price),
      isAvailable: a.isAvailable,
    })),
    metadata: Object.entries(
      (product.details as Record<string, string>) || {},
    ).map(([key, value]) => ({
      key,
      value,
    })),
  }
}

type StorefrontVariant = StorefrontProductDetail['variants'][number]

export const getStockQuantity = (
  variant: StorefrontVariant,
  productType: ProductType,
  branchId?: string | null,
): number => {
  if (!variant) {
    return 0
  }

  if (productType === ProductType.PHYSICAL) {
    if (branchId) {
      return variant.stocks?.find((s) => s.branchId === branchId)?.quantity ?? 0
    }
    return variant.stocks?.reduce((sum: number, s) => sum + s.quantity, 0) ?? 0
  }

  if (productType === ProductType.DIGITAL_ITEM) {
    return variant.digitalItems?.filter((item) => !item.isUsed).length ?? 0
  }

  if (
    productType === ProductType.DIGITAL_LINK ||
    productType === ProductType.DIGITAL_SERVICE
  ) {
    return 1
  }

  return 0
}
