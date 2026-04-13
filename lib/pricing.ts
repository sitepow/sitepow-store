import { PRICING_OPTIONS } from '@/constants/pricing'

export const calculatePlanPrice = (
  basePriceStr: string,
  selectedValue: string,
) => {
  const currentOption = PRICING_OPTIONS.find(
    (opt) => opt.value === selectedValue,
  )

  const months = parseInt(selectedValue) || 1
  const discountPercent = currentOption?.discount
    ? parseInt(currentOption.discount)
    : 0
  const basePrice = parseFloat(basePriceStr.replace(/,/g, ''))

  const totalPriceBeforeDiscount = basePrice * months
  const finalPrice = totalPriceBeforeDiscount * (1 - discountPercent / 100)
  const averagePerMonth = finalPrice / months

  return {
    basePrice,
    months,
    discountPercent,
    totalPriceBeforeDiscount,
    finalPrice,
    averagePerMonth,
  }
}

export const formatCurrency = (num: number) => {
  return num.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}
