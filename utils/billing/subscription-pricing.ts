import { GetSubscriptionItemSerialized } from '@/actions/billing/subscription/actions'
import { PRICING_OPTIONS } from '@/constants/billing/pricing'
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

export interface SubscriptionStatusInfo {
  status: SubStatus
  startDate: Date | string
  endDate: Date | string
}

export const getSubscriptionStatusInfo = (
  sub: SubscriptionStatusInfo | null | undefined,
) => {
  if (!sub) {
    return {
      isPastDue: false,
      isCanceled: false,
      daysRemaining: 0,
      progressValue: 0,
    }
  }

  const isPastDue = sub.status === SubStatus.PAST_DUE
  const isCanceled = sub.status === SubStatus.CANCELED

  const startDate = new Date(sub.startDate)
  const endDate = new Date(sub.endDate)

  const totalDays = differenceInDays(endDate, startDate)
  const daysRemaining = Math.max(0, differenceInDays(endDate, new Date()))
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

export const calculateProration = (
  currentSub: { startDate: Date; endDate: Date; amountPaid: number },
  newPlanPrice: number,
) => {
  const now = new Date()
  const totalDays = differenceInDays(currentSub.endDate, currentSub.startDate)
  const remainingDays = Math.max(0, differenceInDays(currentSub.endDate, now))

  const dailyRate = currentSub.amountPaid / (totalDays || 1)
  const remainingValue = dailyRate * remainingDays

  const amountToPay = Math.max(0, newPlanPrice - remainingValue)

  return {
    remainingValue: Number(remainingValue.toFixed(2)),
    amountToPay: Number(amountToPay.toFixed(2)),
  }
}
