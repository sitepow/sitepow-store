'use client'

import { useState } from 'react'

import { WeightRate, ZoneRate } from '@/types/shipping'
import { IconPlus, IconSettings, IconTrash } from '@tabler/icons-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'

interface ServiceConfigDialogProps {
  serviceName: string
  onSave: (config: { weightRates: WeightRate[]; zoneRates: ZoneRate[] }) => void
}

export function ServiceConfigDialog({
  serviceName,
  onSave,
}: ServiceConfigDialogProps) {
  const [open, setOpen] = useState(false)

  const [weightRates, setWeightRates] = useState<WeightRate[]>([
    { minWeight: 0, maxWeight: 1, fee: 40 },
  ])

  const [zoneRates, setZoneRates] = useState<ZoneRate[]>([
    { zoneType: 'REMOTE_AREA', additionalFee: 50 },
    { zoneType: 'BORDER_PROVINCES', additionalFee: 40 },
  ])

  const addWeightRow = () => {
    const lastRate = weightRates[weightRates.length - 1]
    const nextMin = lastRate ? lastRate.maxWeight + 0.001 : 0
    setWeightRates([
      ...weightRates,
      { minWeight: nextMin, maxWeight: nextMin + 1, fee: 50 },
    ])
  }

  const removeWeightRow = (index: number) => {
    setWeightRates(weightRates.filter((_, i) => i !== index))
  }

  const handleWeightChange = (
    index: number,
    field: keyof WeightRate,
    value: number,
  ) => {
    const updated = [...weightRates]
    updated[index] = { ...updated[index], [field]: value }
    setWeightRates(updated)
  }

  const handleZoneChange = (
    zoneType: 'REMOTE_AREA' | 'BORDER_PROVINCES',
    value: number,
  ) => {
    setZoneRates(
      zoneRates.map((z) =>
        z.zoneType === zoneType ? { ...z, additionalFee: value } : z,
      ),
    )
  }

  const handleSaveConfig = () => {
    onSave({ weightRates, zoneRates })
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-1">
          <IconSettings size={14} /> ตั้งค่าเรทราคา
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>ตั้งค่าอัตราค่าบริการ: {serviceName}</DialogTitle>
          <DialogDescription>
            กำหนดขั้นบันไดราคาตามน้ำหนักและค่าบริการเพิ่มเติมสำหรับพื้นที่พิเศษย่อยในไทย
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[60vh] space-y-6 overflow-y-auto py-4 pr-2">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">
                อัตราค่าบริการตามน้ำหนักพัสดุ
              </span>
              <Button
                type="button"
                variant="outline"
                size="xs"
                onClick={addWeightRow}
                className="h-7 gap-1"
              >
                <IconPlus size={14} /> เพิ่มช่วงน้ำหนัก
              </Button>
            </div>

            <div className="space-y-2">
              {weightRates.map((rate, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="flex flex-1 items-center gap-1.5">
                    <Input
                      type="number"
                      step="0.001"
                      placeholder="0.00"
                      value={rate.minWeight}
                      onChange={(e) =>
                        handleWeightChange(
                          index,
                          'minWeight',
                          parseFloat(e.target.value) || 0,
                        )
                      }
                      className="h-8 text-right"
                    />
                    <span className="text-muted-foreground text-xs select-none">
                      ถึง
                    </span>
                    <Input
                      type="number"
                      step="0.001"
                      placeholder="1.00"
                      value={rate.maxWeight}
                      onChange={(e) =>
                        handleWeightChange(
                          index,
                          'maxWeight',
                          parseFloat(e.target.value) || 0,
                        )
                      }
                      className="h-8 text-right"
                    />
                    <span className="text-muted-foreground text-xs select-none">
                      กก.
                    </span>
                  </div>

                  <div className="flex w-1/3 items-center">
                    <Input
                      type="number"
                      placeholder="ราคา"
                      value={rate.fee}
                      onChange={(e) =>
                        handleWeightChange(
                          index,
                          'fee',
                          parseFloat(e.target.value) || 0,
                        )
                      }
                      className="h-8 rounded-r-none text-right font-medium"
                    />
                    <span className="border-input bg-muted text-muted-foreground flex h-8 items-center rounded-r-md border border-l-0 px-2 text-xs select-none">
                      บาท
                    </span>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeWeightRow(index)}
                    disabled={weightRates.length <= 1}
                    className="text-destructive h-8 w-8"
                  >
                    <IconTrash size={14} />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3 border-t pt-4">
            <span className="block text-sm font-semibold">
              ค่าบริการเพิ่มเติมสำหรับพื้นที่พิเศษ
            </span>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="bg-muted/20 flex flex-col gap-2 rounded-lg border p-3">
                <div>
                  <span className="block text-xs font-medium">
                    พื้นที่ห่างไกล
                  </span>
                  <span className="text-muted-foreground block text-[10px]">
                    ดอย, เกาะต่างๆ เช่น แม่ฮ่องสอน, เกาะสมุย
                  </span>
                </div>
                <div className="mt-1 flex items-center">
                  <span className="text-muted-foreground mr-1.5 shrink-0 text-xs select-none">
                    + เพิ่ม
                  </span>
                  <Input
                    type="number"
                    value={
                      zoneRates.find((z) => z.zoneType === 'REMOTE_AREA')
                        ?.additionalFee || 0
                    }
                    onChange={(e) =>
                      handleZoneChange(
                        'REMOTE_AREA',
                        parseFloat(e.target.value) || 0,
                      )
                    }
                    className="h-8 rounded-r-none text-right"
                  />
                  <span className="border-input bg-muted text-muted-foreground flex h-8 items-center rounded-r-md border border-l-0 px-2.5 text-xs select-none">
                    บาท
                  </span>
                </div>
              </div>

              <div className="bg-muted/20 flex flex-col gap-2 rounded-lg border p-3">
                <div>
                  <span className="block text-xs font-medium">
                    3 จังหวัดชายแดนภาคใต้
                  </span>
                  <span className="text-muted-foreground block text-[10px]">
                    จังหวัดยะลา, ปัตตานี, นราธิวาส
                  </span>
                </div>
                <div className="mt-1 flex items-center">
                  <span className="text-muted-foreground mr-1.5 shrink-0 text-xs select-none">
                    + เพิ่ม
                  </span>
                  <Input
                    type="number"
                    value={
                      zoneRates.find((z) => z.zoneType === 'BORDER_PROVINCES')
                        ?.additionalFee || 0
                    }
                    onChange={(e) =>
                      handleZoneChange(
                        'BORDER_PROVINCES',
                        parseFloat(e.target.value) || 0,
                      )
                    }
                    className="h-8 rounded-r-none text-right"
                  />
                  <span className="border-input bg-muted text-muted-foreground flex h-8 items-center rounded-r-md border border-l-0 px-2.5 text-xs select-none">
                    บาท
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" onClick={handleSaveConfig} size="sm">
            ยืนยันการตั้งค่าบริการ
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
