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

import { SummaryRow } from '../../_components/cart/SummaryRow'
import { SummaryTotal } from '../../_components/cart/SummaryTotal'

export function DiscountForm() {
  const [points, setPoints] = useState([MAX_POINTS])
  const maxDiscountTHB = MAX_POINTS * POINT_RATE
  const useDiscountTHB = points[0] * POINT_RATE

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary">
          <IconTicket />
          <span>เพิ่มส่วนลด</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-xl">
        <DialogHeader className="gap-4">
          <DialogTitle className="flex items-center gap-2.5">
            <IconTicket />
            <span>ส่วนลด</span>
          </DialogTitle>

          <div className="flex flex-col gap-5 rounded-xl border border-gray-100 p-5">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1 text-left">
                <p className="font-medium">1. แต้มสะสมของคุณ</p>
                <p className="opacity-50">
                  ({formatNumber(1000)} แต้ม = {formatCurrency(120)})
                </p>
              </div>

              <div className="flex flex-col gap-1 text-left">
                <p className="text-primary text-xl font-bold">
                  {formatNumber(MAX_POINTS)} แต้ม
                </p>
                <p className="opacity-50">
                  (ลดได้สูงสุด = {formatCurrency(maxDiscountTHB)})
                </p>
              </div>
            </div>

            <Slider
              max={MAX_POINTS}
              step={1}
              className="w-full"
              onValueChange={setPoints}
              value={points}
            />

            <InputGroup className="bg-white">
              <InputGroupAddon>ใช้แต้ม</InputGroupAddon>
              <InputGroupInput
                className="text-end"
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

          <div className="flex flex-col gap-5 rounded-xl border border-gray-100 p-5">
            <div className="flex flex-col gap-2 text-left">
              <Label htmlFor="discountCode">2. รหัสส่วนลด</Label>
              <div className="flex gap-2">
                <Input
                  id="input-button-group"
                  className="bg-white"
                  placeholder="ระบุรหัสส่วนลด"
                />
                <Button className="w-32" variant="outline">
                  ใช้รหัส
                </Button>
              </div>
            </div>
          </div>

          <div className="shadow-airy flex flex-col space-y-1.5 rounded-xl p-5">
            <SummaryRow
              label="ส่วนลดจากแต้มสะสม"
              value={
                <span>- {formatCurrency(Math.floor(useDiscountTHB))}</span>
              }
            />
            <SummaryRow
              label="ส่วนลดจากรหัสส่วนลด"
              value={
                <span>- {formatCurrency(Math.floor(useDiscountTHB))}</span>
              }
            />
            <Separator />
            <SummaryTotal
              label={'รวมส่วนลดทั้งหมด'}
              value={formatCurrency(Math.floor(useDiscountTHB))}
            />
          </div>

          <Button>ใช้ส่วนลด</Button>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}
