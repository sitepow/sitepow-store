import { useState } from 'react'

import { MAX_POINTS, POINT_RATE } from '@/constants/sites/point'
import { formatCurrency, formatNumber } from '@/utils/pricing'
import { IconDiscount2, IconTicket, IconWallet } from '@tabler/icons-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Slider } from '@/components/ui/slider'

import { SummaryRow } from '../../_components/cart/_components/SummaryRow'
import { SummaryTotal } from '../../_components/cart/_components/SummaryTotal'

export function DiscountForm() {
  const [points, setPoints] = useState([0])
  const useDiscountTHB = points[0] * POINT_RATE

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.max(0, Math.min(Number(e.target.value), MAX_POINTS))
    setPoints([val])
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary" className="gap-2">
          <IconTicket className="size-4" />
          <span>เพิ่มส่วนลด</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <IconTicket className="text-primary" />
            ใช้ส่วนลด
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <IconWallet className="text-muted-foreground size-4" />
                ใช้แต้มสะสม
              </Label>
              <span className="text-primary text-sm font-semibold">
                {formatNumber(points[0])} / {formatNumber(MAX_POINTS)} แต้ม
              </span>
            </div>

            <Slider
              max={MAX_POINTS}
              step={10}
              value={points}
              onValueChange={setPoints}
              className="cursor-pointer"
            />

            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={points[0]}
                onChange={handleInputChange}
                className="w-24 text-center font-bold"
              />
              <span className="text-muted-foreground text-sm">
                แลกเป็นส่วนลดได้{' '}
                <strong className="text-foreground">
                  {formatCurrency(useDiscountTHB)}
                </strong>
              </span>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <IconDiscount2 className="text-muted-foreground size-4" />
              รหัสส่วนลด
            </Label>
            <div className="flex gap-2">
              <Input placeholder="กรอกรหัสส่วนลด" />
              <Button variant="outline">ใช้งาน</Button>
            </div>
          </div>

          <div className="bg-muted/20 space-y-3 rounded-xl border p-4">
            <SummaryRow
              label="ส่วนลดจากแต้มสะสม"
              value={`-${formatCurrency(useDiscountTHB)}`}
            />
            <SummaryRow label="ส่วนลดจากรหัส" value={`-${formatCurrency(0)}`} />
            <Separator />
            <SummaryTotal
              label="รวมส่วนลดทั้งหมด"
              value={formatCurrency(useDiscountTHB)}
            />
          </div>
        </div>

        <Button size="lg" className="w-full font-bold">
          ยืนยันการใช้ส่วนลด
        </Button>
      </DialogContent>
    </Dialog>
  )
}
