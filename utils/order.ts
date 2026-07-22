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
