import { ORDER_STATUS_TH, PAYMENT_METHOD_TH } from '@/constants/translate'
import { OrderStatus, PaymentMethod } from '@/generated/prisma/enums'
import { formatDateTime } from '@/utils/formatting/date'

import { Badge } from '@/components/ui/badge'

interface OrderStatusBadgesProps {
  status: OrderStatus
  paymentMethod?: PaymentMethod | null
  paidAt?: Date | string | null
  isTaxInvoiceRequested?: boolean | null
}

export function OrderStatusBadges({
  status,
  paymentMethod,
  paidAt,
  isTaxInvoiceRequested,
}: OrderStatusBadgesProps) {
  const isPaidOrShipped =
    status === OrderStatus.PAID || status === OrderStatus.SHIPPED

  return (
    <div className="mb-3 flex flex-wrap gap-2">
      {isTaxInvoiceRequested && <Badge>ขอใบกำกับภาษี</Badge>}
      <Badge variant={isPaidOrShipped ? 'default' : 'outline'}>
        สถานะออเดอร์: {ORDER_STATUS_TH[status]}
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
