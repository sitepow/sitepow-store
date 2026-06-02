'use client'

import { useState } from 'react'
import { useFieldArray, useFormContext } from 'react-hook-form'

import { ShippingSettingsFormValues } from '@/zod/shipping-settings'
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
  serviceIndex: number
}

export function ServiceConfigDialog({
  serviceName,
  serviceIndex,
}: ServiceConfigDialogProps) {
  const [open, setOpen] = useState(false)

  const { control, register, watch } =
    useFormContext<ShippingSettingsFormValues>()

  const { fields: weightFields, append: appendWeight } = useFieldArray({
    control,
    name: `services.${serviceIndex}.weightRates`,
  })

  const zoneRates = watch(`services.${serviceIndex}.zoneRates`)

  const addWeightRow = () => {
    const currentRates = watch(`services.${serviceIndex}.weightRates`) || []
    const lastRate = currentRates[currentRates.length - 1]
    const nextMin = lastRate ? lastRate.maxWeight + 1 : 0

    appendWeight({ minWeight: nextMin, maxWeight: nextMin + 1000, fee: 45 })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm" className="h-8 gap-1">
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
                size="sm"
                onClick={addWeightRow}
                className="h-7 gap-1 px-2 text-xs"
              >
                <IconPlus size={14} /> เพิ่มช่วงน้ำหนัก
              </Button>
            </div>

            <div className="space-y-2">
              {weightFields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-2">
                  <div className="flex flex-1 items-center gap-1.5">
                    <Input
                      type="number"
                      placeholder="0"
                      {...register(
                        `services.${serviceIndex}.weightRates.${index}.minWeight` as const,
                        { valueAsNumber: true },
                      )}
                      className="h-8 text-right"
                    />
                    <span className="text-muted-foreground text-xs select-none">
                      ถึง
                    </span>
                    <Input
                      type="number"
                      placeholder="1000"
                      {...register(
                        `services.${serviceIndex}.weightRates.${index}.maxWeight` as const,
                        { valueAsNumber: true },
                      )}
                      className="h-8 text-right"
                    />
                    <span className="text-muted-foreground text-xs select-none">
                      กรัม (g)
                    </span>
                  </div>

                  <div className="flex w-1/3 items-center">
                    <Input
                      type="number"
                      placeholder="ราคา"
                      {...register(
                        `services.${serviceIndex}.weightRates.${index}.fee` as const,
                        { valueAsNumber: true },
                      )}
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
                    disabled={weightFields.length <= 1}
                    className="text-destructive hover:bg-destructive/10 h-8 w-8"
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
              {zoneRates?.map((zone, zIndex) => (
                <div
                  key={zone.zoneType}
                  className="bg-muted/20 flex flex-col gap-2 rounded-lg border p-3"
                >
                  <div>
                    <span className="block text-xs font-medium">
                      {zone.zoneType === 'REMOTE_AREA'
                        ? 'พื้นที่ห่างไกล'
                        : '3 จังหวัดชายแดนภาคใต้'}
                    </span>
                    <span className="text-muted-foreground block text-[10px]">
                      {zone.zoneType === 'REMOTE_AREA'
                        ? 'ดอย, เกาะต่างๆ เช่น แม่ฮ่องสอน, เกาะสมุย'
                        : 'จังหวัดยะลา, ปัตตานี, นราธิวาส'}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center">
                    <span className="text-muted-foreground mr-1.5 shrink-0 text-xs select-none">
                      + เพิ่ม
                    </span>
                    <Input
                      type="number"
                      {...register(
                        `services.${serviceIndex}.zoneRates.${zIndex}.additionalFee` as const,
                        { valueAsNumber: true },
                      )}
                      className="h-8 rounded-r-none text-right"
                    />
                    <span className="border-input bg-muted text-muted-foreground flex h-8 items-center rounded-r-md border border-l-0 px-2.5 text-xs select-none">
                      บาท
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" onClick={() => setOpen(false)} size="sm">
            เสร็จสิ้น
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
