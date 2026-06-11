import { useState } from 'react'

import { MAX_POINTS, POINT_RATE } from '@/constants/sites/point'
import { formatCurrency, formatNumber } from '@/utils/pricing'
import { IconTicket } from '@tabler/icons-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Slider } from '@/components/ui/slider'

import { SummaryRow } from '../../_components/cart/_components/SummaryRow'
import { SummaryTotal } from '../../_components/cart/_components/SummaryTotal'

export function DiscountForm() {
  const [points, setPoints] = useState([MAX_POINTS])
  const maxDiscountTHB = MAX_POINTS * POINT_RATE
  const useDiscountTHB = points[0] * POINT_RATE

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary" className="gap-2">
          <IconTicket className="size-4" />
          <span>เพิ่มส่วนลด</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-xl">
        <DialogHeader className="gap-4">
          <DialogTitle className="flex items-center gap-2.5 text-lg sm:text-xl">
            <IconTicket className="text-primary" />
            <span>ส่วนลด</span>
          </DialogTitle>

          <div className="flex flex-col gap-4 rounded-xl border border-gray-100 bg-gray-50/50 p-4 sm:gap-5 sm:p-5">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div className="flex flex-col gap-0.5 text-left">
                <p className="text-sm font-semibold sm:text-base">
                  1. แต้มสะสมของคุณ
                </p>
                <p className="text-xs opacity-60">
                  ({formatNumber(1000)} แต้ม = {formatCurrency(120)})
                </p>
              </div>

              <div className="flex flex-col gap-0.5 text-left sm:text-right">
                <p className="text-primary text-lg font-bold sm:text-xl">
                  {formatNumber(MAX_POINTS)} แต้ม
                </p>
                <p className="text-[10px] opacity-60 sm:text-xs">
                  (ลดได้สูงสุด {formatCurrency(maxDiscountTHB)})
                </p>
              </div>
            </div>

            <div className="py-2">
              <Slider
                max={MAX_POINTS}
                step={1}
                className="w-full"
                onValueChange={setPoints}
                value={points}
              />
            </div>

            <InputGroup className="ring-offset-background focus-within:ring-ring bg-white focus-within:ring-2 focus-within:ring-offset-2">
              <InputGroupAddon className="bg-muted/50 text-xs sm:text-sm">
                ใช้แต้ม
              </InputGroupAddon>
              <InputGroupInput
                className="text-end font-medium"
                value={points[0]}
                onChange={(e) => {
                  const val = Math.min(Number(e.target.value), MAX_POINTS)
                  setPoints([val])
                }}
                type="number"
                min={0}
                max={MAX_POINTS}
              />
            </InputGroup>
          </div>

          <div className="flex flex-col gap-3 rounded-xl border border-gray-100 bg-gray-50/50 p-4 sm:p-5">
            <div className="flex flex-col gap-2.5 text-left">
              <Label
                htmlFor="discountCode"
                className="text-sm font-semibold sm:text-base"
              >
                2. รหัสส่วนลด
              </Label>
              <div className="flex gap-2">
                <Input
                  id="discountCode"
                  className="flex-1 bg-white"
                  placeholder="ระบุรหัสส่วนลด"
                />
                <Button className="shrink-0 px-4 sm:w-32" variant="outline">
                  ใช้รหัส
                </Button>
              </div>
            </div>
          </div>

          <div className="flex flex-col space-y-2 rounded-xl border border-gray-100 bg-white p-4 sm:p-5">
            <SummaryRow
              label="ส่วนลดจากแต้มสะสม"
              value={
                <span className="text-destructive font-medium">
                  - {formatCurrency(Math.floor(useDiscountTHB))}
                </span>
              }
            />
            <SummaryRow
              label="ส่วนลดจากรหัสส่วนลด"
              value={
                <span className="text-destructive font-medium">
                  - {formatCurrency(0)}
                </span>
              }
            />
            <div className="py-1">
              <Separator />
            </div>
            <SummaryTotal
              label={'รวมส่วนลดทั้งหมด'}
              value={formatCurrency(Math.floor(useDiscountTHB))}
            />
          </div>

          <Button size="lg" className="mt-2 w-full text-base font-bold">
            ยืนยันการใช้ส่วนลด
          </Button>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}
