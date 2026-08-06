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
  const isInputEmpty = !trackingNumber.trim()

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        if (!isInputEmpty && !isPending) onSubmit()
      }}
      className="space-y-3 rounded-lg border p-4"
    >
      <div className="space-y-1">
        <Label htmlFor="trackingNumber" className="text-sm font-medium">
          กรุณากรอกเลขพัสดุสำหรับการจัดส่ง
        </Label>
        <p className="text-muted-foreground text-xs">
          จำเป็นต้องระบุเลข Tracking Number ก่อนเปลี่ยนสถานะเป็นกำลังจัดส่ง
        </p>
      </div>
      <div className="flex gap-2">
        <Input
          id="trackingNumber"
          placeholder="ระบุเลข Tracking Number เช่น TH123456789..."
          value={trackingNumber}
          onChange={(e) => onTrackingNumberChange(e.target.value)}
          disabled={isPending}
        />
        <Button
          type="submit"
          disabled={isPending || isInputEmpty}
          className="shrink-0"
        >
          {isPending ? <Spinner /> : 'บันทึก'}
        </Button>
      </div>
    </form>
  )
}
