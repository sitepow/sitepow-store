'use client'

import { useState } from 'react'
import { useFieldArray, useFormContext } from 'react-hook-form'

import {
  DEFAULT_SHIPPING_FEE,
  DEFAULT_WEIGHT_STEP,
  INITIAL_MIN_WEIGHT,
  ZONE_LABELS,
} from '@/constants/shipping'
import { ShippingZoneType } from '@/generated/prisma/enums'
import { ShippingFormValues } from '@/zod/shipping'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface ServiceConfigDialogProps {
  serviceName: string
  serviceIndex: number
}

export function ServiceConfigDialog({
  serviceName,
  serviceIndex,
}: ServiceConfigDialogProps) {
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<string>(
    ShippingZoneType.SAME_PROVINCE,
  )

  const { control, register, watch } = useFormContext<ShippingFormValues>()

  const {
    fields: allWeightRates,
    append,
    remove,
  } = useFieldArray({
    control,
    name: `services.${serviceIndex}.weightRates`,
  })

  const addWeightRowForZone = (zone: ShippingZoneType) => {
    const currentRates = watch(`services.${serviceIndex}.weightRates`) || []
    const filteredRates = currentRates.filter((r) => r.zoneType === zone)

    const lastRate = filteredRates[filteredRates.length - 1]
    const nextMin = lastRate ? lastRate.maxWeight + 1 : INITIAL_MIN_WEIGHT

    append({
      zoneType: zone,
      minWeight: nextMin,
      maxWeight: nextMin + DEFAULT_WEIGHT_STEP,
      fee: DEFAULT_SHIPPING_FEE,
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm" className="h-8 gap-1">
          <IconSettings size={14} /> ตั้งค่าเรทราคา Matrix
        </Button>
      </DialogTrigger>
      <DialogContent className="min-w-lg" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>ตั้งค่าอัตราค่าบริการ: {serviceName}</DialogTitle>
          <DialogDescription>
            ตรวจสอบและปรับแต่งขั้นบันไดราคาแยกตามโซนความสัมพันธ์ระยะทาง
            (กวาดข้อมูลจากระบบอัตโนมัติแล้ว)
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full pt-2"
        >
          <TabsList className="grid w-full grid-cols-4">
            {Object.entries(ZONE_LABELS).map(([zoneKey, zoneMeta]) => (
              <TabsTrigger key={zoneKey} value={zoneKey} className="text-xs">
                {zoneMeta.title}
              </TabsTrigger>
            ))}
          </TabsList>

          {Object.entries(ZONE_LABELS).map(([zoneKey, zoneMeta]) => {
            const targetZone = zoneKey as ShippingZoneType

            return (
              <TabsContent
                key={targetZone}
                value={targetZone}
                className="space-y-4 pt-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="block text-sm font-semibold">
                      {zoneMeta.title}
                    </span>
                    <span className="text-muted-foreground text-xs">
                      {zoneMeta.description}
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addWeightRowForZone(targetZone)}
                    className="h-7 gap-1 px-2 text-xs"
                  >
                    <IconPlus size={14} /> เพิ่มช่วงน้ำหนัก ({zoneMeta.title})
                  </Button>
                </div>

                <div className="max-h-[40vh] space-y-2 overflow-y-auto pr-1">
                  {allWeightRates.map((field, globalIndex) => {
                    if (field.zoneType !== targetZone) return null

                    return (
                      <div key={field.id} className="flex items-center gap-2">
                        <div className="flex flex-1 items-center gap-1.5">
                          <Input
                            type="number"
                            placeholder="0"
                            {...register(
                              `services.${serviceIndex}.weightRates.${globalIndex}.minWeight` as const,
                              { valueAsNumber: true },
                            )}
                            className="h-8 text-right text-sm"
                          />
                          <span className="text-muted-foreground text-xs select-none">
                            ถึง
                          </span>
                          <Input
                            type="number"
                            placeholder="1000"
                            {...register(
                              `services.${serviceIndex}.weightRates.${globalIndex}.maxWeight` as const,
                              { valueAsNumber: true },
                            )}
                            className="h-8 text-right text-sm"
                          />
                          <span className="text-muted-foreground w-12 shrink-0 text-xs select-none">
                            กรัม (g)
                          </span>
                        </div>

                        <div className="flex w-1/4 items-center">
                          <Input
                            type="number"
                            placeholder="ราคา"
                            {...register(
                              `services.${serviceIndex}.weightRates.${globalIndex}.fee` as const,
                              { valueAsNumber: true },
                            )}
                            className="h-8 rounded-r-none text-right text-sm font-medium"
                          />
                          <span className="border-input bg-muted text-muted-foreground flex h-8 items-center rounded-r-md border border-l-0 px-2 text-xs select-none">
                            บาท
                          </span>
                        </div>

                        <input
                          type="hidden"
                          {...register(
                            `services.${serviceIndex}.weightRates.${globalIndex}.zoneType` as const,
                          )}
                        />

                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          onClick={() => remove(globalIndex)}
                        >
                          <IconTrash size={14} />
                        </Button>
                      </div>
                    )
                  })}

                  {allWeightRates.filter((f) => f.zoneType === targetZone)
                    .length === 0 && (
                    <div className="text-muted-foreground rounded-lg border border-dashed py-6 text-center text-xs">
                      ยังไม่มีข้อมูลเกณฑ์ราคาสำหรับพื้นที่นี้
                      กดปุ่มดึงเรทอัตโนมัติหรือเพิ่มแถวพิกัดใหม่ด้านบน
                    </div>
                  )}
                </div>
              </TabsContent>
            )
          })}
        </Tabs>

        <DialogFooter className="mt-2 border-t pt-3">
          <Button type="button" onClick={() => setOpen(false)} size="sm">
            เสร็จสิ้นการตั้งค่าโซน
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
