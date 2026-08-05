import { OrderStatus } from '@/generated/prisma/enums'
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard'
import { IconAlertCircle, IconCheck, IconCopy } from '@tabler/icons-react'

import { Button } from '@/components/ui/button'

interface OrderTrackingCardProps {
  status: OrderStatus
  trackingNumber?: string | null
  emptyMessage?: string
}

export function OrderTrackingCard({
  status,
  trackingNumber,
  emptyMessage,
}: OrderTrackingCardProps) {
  const { copied, copy } = useCopyToClipboard()

  if (trackingNumber) {
    return (
      <div className="from-primary/10 via-primary/2 to-background border-primary/25 flex items-center justify-between rounded-lg border bg-linear-to-br p-3">
        <div>
          <div className="text-muted-foreground mb-1 text-xs">
            เลขพัสดุ (Tracking Number)
          </div>
          <div className="font-bold">{trackingNumber}</div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => copy(trackingNumber)}
        >
          {copied ? (
            <>
              <IconCheck size={16} className="mr-1" /> คัดลอกแล้ว
            </>
          ) : (
            <>
              <IconCopy size={16} className="mr-1" /> คัดลอก
            </>
          )}
        </Button>
      </div>
    )
  }

  const defaultEmptyText =
    status === OrderStatus.PENDING
      ? 'ระบบกำลังเตรียมการจัดส่ง เมื่อร้านค้ากรอกเลขพัสดุแล้วจะแสดงผลที่นี่'
      : 'ยังไม่ได้ระบุเลขติดตามพัสดุในระบบ'

  return (
    <div className="text-muted-foreground flex flex-wrap items-center gap-2 rounded-lg border border-dashed p-4 text-sm">
      <IconAlertCircle className="shrink-0" />
      {emptyMessage || defaultEmptyText}
    </div>
  )
}
