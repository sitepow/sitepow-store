import { ProductType } from '@/generated/prisma/enums'
import crypto from 'crypto'

import { CreateOrderItemInput } from '@/lib/order/types'

interface CalculateGroupShareParams {
  groupSubtotal: number
  totalGrandSubtotal: number
  totalShippingFee: number
  branchCount: number
  couponDiscount: number
  pointsDiscount: number
  manualDiscount?: number
  usedPoints: number
  earnedPoints: number
}

export interface OrderCoupon {
  code: string
  description?: string | null
}

export interface OrderCalculationsInput {
  items: Array<{ price: number | string; quantity: number }>
  shippingFee?: number | null
  pointsDiscount?: number | null
  codFee?: number | null
  totalAmount: number | string
  coupon?: OrderCoupon | null
  customer?: {
    id: string
    email: string
    firstName: string | null
    lastName: string | null
  } | null
}

export function calculateOrderSummary(order: OrderCalculationsInput) {
  const itemsSubtotal = order.items.reduce(
    (acc, item) => acc + Number(item.price) * item.quantity,
    0,
  )

  const shippingFee = Number(order.shippingFee || 0)
  const pointsDiscount = Number(order.pointsDiscount || 0)
  const codFee = Number(order.codFee || 0)
  const totalAmount = Number(order.totalAmount || 0)

  const couponDiscount = order.coupon
    ? Math.max(
        0,
        itemsSubtotal + shippingFee + codFee - totalAmount - pointsDiscount,
      )
    : 0

  const customerName = order.customer
    ? [order.customer.firstName, order.customer.lastName]
        .filter(Boolean)
        .join(' ')
    : '-'

  return {
    itemsSubtotal,
    shippingFee,
    pointsDiscount,
    codFee,
    couponDiscount,
    totalAmount,
    customerName,
  }
}

export function generateOrderNumber() {
  const date = new Date()
  const datePart = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`
  const randomPart = crypto.randomInt(1000, 9999)
  return `SP${datePart}${randomPart}`
}

export const calculateGroupShare = ({
  groupSubtotal,
  totalGrandSubtotal,
  totalShippingFee,
  branchCount,
  couponDiscount,
  pointsDiscount,
  manualDiscount = 0,
  usedPoints,
  earnedPoints,
}: CalculateGroupShareParams) => {
  const ratio = totalGrandSubtotal > 0 ? groupSubtotal / totalGrandSubtotal : 0
  return {
    ratio,
    shippingFee:
      branchCount === 1 ? totalShippingFee : totalShippingFee * ratio,
    couponDiscount: couponDiscount * ratio,
    pointsDiscount: pointsDiscount * ratio,
    manualDiscount: manualDiscount * ratio,
    usedPoints: Math.round(usedPoints * ratio),
    earnedPoints: Math.round(earnedPoints * ratio),
  }
}

export function classifyOrderItems(items: CreateOrderItemInput[]) {
  const physicalGroups: Record<string, CreateOrderItemInput[]> = {}
  const digitalItems: CreateOrderItemInput[] = []
  const digitalServices: CreateOrderItemInput[] = []

  for (const item of items) {
    if (item.productType === ProductType.PHYSICAL) {
      const branchId = item.branchId || 'main'
      if (!physicalGroups[branchId]) {
        physicalGroups[branchId] = []
      }
      physicalGroups[branchId].push(item)
    } else if (
      item.productType === ProductType.DIGITAL_SERVICE ||
      item.productType === ProductType.DIGITAL_LINK
    ) {
      digitalServices.push(item)
    } else if (item.productType === ProductType.DIGITAL_ITEM) {
      digitalItems.push(item)
    } else {
      digitalItems.push(item)
    }
  }

  return { physicalGroups, digitalItems, digitalServices }
}

export function checkIsSplitOrder(classified: {
  physicalGroups: Record<string, unknown[]>
  digitalItems: unknown[]
  digitalServices: unknown[]
}) {
  const branchCount = Object.keys(classified.physicalGroups).length
  const hasDigitalItems = classified.digitalItems.length > 0 ? 1 : 0
  const digitalServicesCount = classified.digitalServices.length

  const totalSubOrders = branchCount + hasDigitalItems + digitalServicesCount
  return totalSubOrders > 1
}
