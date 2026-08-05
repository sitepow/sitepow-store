import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'

interface OrderTrackingFormProps {
  trackingNumber: string
  isPending: boolean
  onTrackingNumberChange: (value: string) => void
  onSubmit: () => void
}

export function OrderTrackingForm({
  trackingNumber,
  isPending,
  onTrackingNumberChange,
  onSubmit,
}: OrderTrackingFormProps) {
  return (
    <div className="space-y-3 rounded-lg border p-4">
      <div className="space-y-1">
        <Label className="text-sm font-medium">
          กรุณากรอกเลขพัสดุสำหรับการจัดส่ง
        </Label>
        <p className="text-muted-foreground text-xs">
          จำเป็นต้องระบุเลข Tracking Number ก่อนเปลี่ยนสถานะเป็นกำลังจัดส่ง
        </p>
      </div>
      <div className="flex gap-2">
        <Input
          placeholder="ระบุเลข Tracking Number เช่น TH123456789..."
          value={trackingNumber}
          onChange={(e) => onTrackingNumberChange(e.target.value)}
        />
        <Button
          onClick={onSubmit}
          disabled={isPending || !trackingNumber.trim()}
          className="shrink-0"
        >
          {isPending ? <Spinner /> : 'บันทึก'}
        </Button>
      </div>
    </div>
  )
}
