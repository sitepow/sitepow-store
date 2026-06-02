'use client'

import { useState } from 'react'
import { useFieldArray, useFormContext } from 'react-hook-form'

import { ShippingZoneType } from '@/generated/prisma/client'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface ServiceConfigDialogProps {
  serviceName: string
  serviceIndex: number
}

const ZONE_LABELS: Record<ShippingZoneType, { title: string; desc: string }> = {
  SAME_PROVINCE: { title: 'จังหวัดเดียวกัน', desc: 'ส่งภายในจังหวัดต้นทาง' },
  SAME_REGION: {
    title: 'ภูมิภาคเดียวกัน',
    desc: 'ส่งไปจังหวัดอื่นภายในภาคเดียวกัน',
  },
  CROSS_REGION: {
    title: 'ข้ามภูมิภาค',
    desc: 'ส่งต่างภาค หรือพื้นที่ระยะไกลปกติ',
  },
  REMOTE_AREA: {
    title: 'พื้นที่ห่างไกลพิเศษ',
    desc: 'เกาะ ดอย สูง หรือ 3 จังหวัดชายแดนใต้',
  },
}

export function ServiceConfigDialog({
  serviceName,
  serviceIndex,
}: ServiceConfigDialogProps) {
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<string>('SAME_PROVINCE')

  const { control, register, watch } =
    useFormContext<ShippingSettingsFormValues>()

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
    const nextMin = lastRate ? lastRate.maxWeight + 1 : 0

    append({
      zoneType: zone,
      minWeight: nextMin,
      maxWeight: nextMin + 1000,
      fee: 45,
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm" className="h-8 gap-1">
          <IconSettings size={14} /> ตั้งค่าเรทราคา Matrix
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
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
                      {zoneMeta.desc}
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
                          variant="ghost"
                          size="icon"
                          onClick={() => remove(globalIndex)}
                          className="text-destructive hover:bg-destructive/10 h-8 w-8 shrink-0"
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
