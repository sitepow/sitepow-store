'use client'

import { useCurrentStore } from '@/hooks/use-current-store'

import { useState } from 'react'
import { useFieldArray, useFormContext } from 'react-hook-form'

import { useTranslations } from 'next-intl'

import {
  DEFAULT_SHIPPING_FEE,
  DEFAULT_WEIGHT_STEP,
  INITIAL_MIN_WEIGHT,
  ZONE_LABELS,
} from '@/constants/shipping'
import { ShippingZoneType } from '@/generated/prisma/enums'
import { ShippingFormValues } from '@/zod/shipping'
import {
  IconPlus,
  IconSettings,
  IconTrash,
  IconTruckDelivery,
} from '@tabler/icons-react'

import { DialogHeaderIcon } from '@/components/DialogHeaderIcon'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface ServiceConfigDialogProps {
  isDisable: boolean
  serviceName: string
  serviceIndex: number
}

export function ServiceConfigDialog({
  isDisable,
  serviceName,
  serviceIndex,
}: ServiceConfigDialogProps) {
  const { currentStore, store } = useCurrentStore()
  const t = useTranslations('merchant.settings.shipping.serviceConfig')
  const tZones = useTranslations('merchant.settings.shipping.zones')
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
        <Button
          type="button"
          variant="outline"
          disabled={isDisable}
          size="sm"
          className="h-8 gap-1"
        >
          <IconSettings size={14} /> {t('trigger')}
        </Button>
      </DialogTrigger>
      <DialogContent
        style={{
        '--primary': currentStore?.primaryColor ?? store?.primaryColor,
      } as React.CSSProperties} className="lg:min-w-lg" showCloseButton={false}>
        <DialogHeader>
          <DialogHeaderIcon
            icon={IconTruckDelivery}
            title={t('title', { serviceName })}
            description={t('description')}
          />
        </DialogHeader>
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          orientation="vertical"
          className="flex flex-col gap-6"
        >
          <TabsList className="flex h-auto w-full shrink-0 items-stretch justify-start gap-1 rounded-xl border p-1">
            {Object.entries(ZONE_LABELS).map(([zoneKey]) => (
              <TabsTrigger key={zoneKey} value={zoneKey} className="text-xs">
                {tZones(`${zoneKey}.title` as any)}
              </TabsTrigger>
            ))}
          </TabsList>
          {Object.entries(ZONE_LABELS).map(([zoneKey]) => {
            const targetZone = zoneKey as ShippingZoneType

            return (
              <TabsContent
                key={targetZone}
                value={targetZone}
                className="space-y-4 pt-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-5">
                  <div>
                    <span className="block text-sm font-semibold">
                      {tZones(`${targetZone}.title` as any)}
                    </span>
                    <span className="text-muted-foreground text-xs">
                      {tZones(`${targetZone}.description` as any)}
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addWeightRowForZone(targetZone)}
                    className="h-7 gap-1 px-2 text-xs"
                  >
                    <IconPlus size={14} />{' '}
                    {t('addWeight', {
                      zone: tZones(`${targetZone}.title` as any),
                    })}
                  </Button>
                </div>
                <div className="w-0 min-w-full overflow-x-auto">
                  <div className="space-y-2">
                    {allWeightRates.map((field, globalIndex) => {
                      if (field.zoneType !== targetZone) {
                        return null
                      }
                      return (
                        <div key={field.id} className="flex items-center gap-2">
                          <div className="flex shrink-0 items-center gap-1.5">
                            <Input
                              type="number"
                              placeholder="0"
                              {...register(
                                `services.${serviceIndex}.weightRates.${globalIndex}.minWeight` as const,
                                { valueAsNumber: true },
                              )}
                              className="h-8 w-24 text-right text-sm"
                            />
                            <span className="text-muted-foreground text-xs select-none">
                              {t('to')}
                            </span>
                            <Input
                              type="number"
                              placeholder="1000"
                              {...register(
                                `services.${serviceIndex}.weightRates.${globalIndex}.maxWeight` as const,
                                { valueAsNumber: true },
                              )}
                              className="h-8 w-24 text-right text-sm"
                            />
                            <span className="text-muted-foreground w-12 shrink-0 text-xs select-none">
                              {t('gram')}
                            </span>
                          </div>
                          <div className="flex shrink-0 items-center">
                            <Input
                              type="number"
                              placeholder={t('price')}
                              {...register(
                                `services.${serviceIndex}.weightRates.${globalIndex}.fee` as const,
                                { valueAsNumber: true },
                              )}
                              className="h-8 w-24 rounded-r-none text-right text-sm font-medium"
                            />
                            <span className="border-input bg-muted text-muted-foreground flex h-8 items-center rounded-r-md border border-l-0 px-2 text-xs select-none">
                              {t('baht')}
                            </span>
                          </div>
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="size-8 shrink-0"
                            onClick={() => remove(globalIndex)}
                          >
                            <IconTrash size={14} />
                          </Button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </TabsContent>
            )
          })}
        </Tabs>
        <DialogFooter className="mt-2 border-t pt-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            size="sm"
          >
            {t('close')}
          </Button>
          <Button type="button" onClick={() => setOpen(false)} size="sm">
            {t('done')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
