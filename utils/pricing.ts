import { GetSubscriptionItemSerialized } from '@/actions/subscription'
import { PRICING_OPTIONS } from '@/constants/pricing'
import { SubStatus } from '@/generated/prisma/enums'
import { differenceInDays, differenceInMonths } from 'date-fns'

export const calculatePlanPrice = (
  basePriceStr: string,
  selectedValue: string,
) => {
  const currentOption = PRICING_OPTIONS.find(
    (opt) => opt.value === selectedValue,
  )
  const months = parseInt(selectedValue) || 1

  const discountPercent = currentOption?.discountPercent || 0
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
  return num.toLocaleString('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    style: 'currency',
    currency: 'THB',
  })
}

export const formatNumber = (num: number) => {
  return num.toLocaleString()
}

export const getSubscriptionStatusInfo = (
  sub: GetSubscriptionItemSerialized,
) => {
  const isPastDue = sub.status === SubStatus.PAST_DUE
  const isCanceled = sub.status === SubStatus.CANCELED

  const totalDays = differenceInDays(
    new Date(sub.endDate),
    new Date(sub.startDate),
  )
  const daysRemaining = Math.max(
    0,
    differenceInDays(new Date(sub.endDate), new Date()),
  )
  const progressValue = totalDays > 0 ? (daysRemaining / totalDays) * 100 : 0

  return { isPastDue, isCanceled, daysRemaining, progressValue }
}

export const calculateMonthlyAverage = (
  sub: GetSubscriptionItemSerialized,
  planPrice: number,
) => {
  const latestInvoice = sub.store.subscriptionInvoices?.[0]
  const monthsInCycle = Math.max(
    1,
    Math.round(
      differenceInMonths(new Date(sub.endDate), new Date(sub.startDate)),
    ),
  )

  const totalPaidAmount = latestInvoice
    ? Number(latestInvoice.amount)
    : Number(planPrice) * monthsInCycle

  return totalPaidAmount / monthsInCycle
}
