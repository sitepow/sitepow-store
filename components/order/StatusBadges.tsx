import { ORDER_STATUS_TH, PAYMENT_METHOD_TH } from '@/constants/translate'
import { OrderStatus, PaymentMethod } from '@/generated/prisma/enums'
import { formatDateTime } from '@/utils/date'

import { Badge } from '@/components/ui/badge'

interface OrderStatusBadgesProps {
  status: OrderStatus
  paymentMethod?: PaymentMethod | null
  paidAt?: Date | string | null
}

export function OrderStatusBadges({
  status,
  paymentMethod,
  paidAt,
}: OrderStatusBadgesProps) {
  const isPaidOrShipped = (
    [OrderStatus.PAID, OrderStatus.SHIPPED] as OrderStatus[]
  ).includes(status)

  return (
    <div className="mb-3 flex flex-wrap gap-2">
      <Badge variant={isPaidOrShipped ? 'default' : 'outline'}>
        ออเดอร์: {ORDER_STATUS_TH[status]}
      </Badge>
      {paymentMethod && (
        <Badge variant="outline">
          รูปแบบชำระเงิน: {PAYMENT_METHOD_TH[paymentMethod]}
        </Badge>
      )}
      {paidAt && (
        <Badge variant="secondary">
          ชำระเงินเมื่อ: {formatDateTime(paidAt)}
        </Badge>
      )}
    </div>
  )
}
