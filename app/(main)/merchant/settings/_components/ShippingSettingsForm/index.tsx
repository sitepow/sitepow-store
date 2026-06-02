'use client'

import { useState } from 'react'
import { FormProvider, useFieldArray, useForm } from 'react-hook-form'

import { checkPrice } from '@/actions/check-price'
import { COURIERS_LIST, SHIPPING_WEIGHT_TIERS } from '@/constants/shipping'
import {
  ShippingSettingsFormValues,
  shippingSettingsFormSchema,
} from '@/zod/shipping-settings'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  IconCloudDownload,
  IconDeviceFloppy,
  IconLoader2,
  IconTruck,
} from '@tabler/icons-react'

import { PageTabHeader } from '@/components/PageTabHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'

import { ServiceConfigDialog } from './_components/ServiceConfigDialog'

const defaultPresetValues: ShippingSettingsFormValues = {
  freeShipMin: 999,
  services: COURIERS_LIST.flatMap((c) =>
    c.services.map((s) => ({
      courierServiceId: s.id,
      isEnabled: true,
      weightRates: [],
      zoneRates: [],
    })),
  ),
}

export function ShippingSettingsForm({
  initialData,
}: {
  initialData?: ShippingSettingsFormValues
}) {
  const [isSaving, setIsSaving] = useState(false)

  const methods = useForm<ShippingSettingsFormValues>({
    resolver: zodResolver(shippingSettingsFormSchema),
    defaultValues: initialData || defaultPresetValues,
  })

  const { control, handleSubmit, register, setValue, watch } = methods

  const { fields } = useFieldArray({
    control,
    name: 'services',
  })

  const watchedServices = watch('services')

  const handleFetchAutoRates = async () => {
    try {
      const priceCheckPromises = SHIPPING_WEIGHT_TIERS.map((tier) =>
        checkPrice({
          weight: tier.maxWeight,
          fromPostcode: 10540,
          toPostcode: 50000,
          fromDistrict: 'บางพลี',
          fromProvince: 'สมุทรปราการ',
          toDistrict: 'เมืองเชียงใหม่',
          toProvince: 'เชียงใหม่',
          width: tier.width,
          length: tier.length,
          height: tier.height,
        }),
      )

      const allTierResults = await Promise.all(priceCheckPromises)

      const serviceRatesAccumulator = new Map<
        string,
        Array<{ minWeight: number; maxWeight: number; fee: number }>
      >()

      allTierResults.forEach((shippopData, tierIndex) => {
        const tierConfig = SHIPPING_WEIGHT_TIERS[tierIndex]

        shippopData.forEach((courierData) => {
          courierData.services.forEach((activeService) => {
            if (
              activeService.currentFee !== null &&
              activeService.currentFee !== undefined
            ) {
              if (!serviceRatesAccumulator.has(activeService.id)) {
                serviceRatesAccumulator.set(activeService.id, [])
              }

              serviceRatesAccumulator.get(activeService.id)?.push({
                minWeight: tierConfig.minWeight,
                maxWeight: tierConfig.maxWeight,
                fee: activeService.currentFee,
              })
            }
          })
        })
      })

      watchedServices.forEach((serviceFormItem, index) => {
        const accumulatedRates = serviceRatesAccumulator.get(
          serviceFormItem.courierServiceId,
        )

        if (accumulatedRates && accumulatedRates.length > 0) {
          setValue(`services.${index}.weightRates`, accumulatedRates, {
            shouldDirty: true,
            shouldValidate: true,
          })
        } else {
          setValue(`services.${index}.weightRates`, [], {
            shouldDirty: true,
            shouldValidate: true,
          })
        }
      })
    } catch (err) {
      console.error(
        'เกิดข้อผิดพลาดในการดึงและจัดกลุ่มบันไดราคาจัดส่งสินค้า:',
        err,
      )
    }
  }

  const onFormSubmit = (data: ShippingSettingsFormValues) => {
    setIsSaving(true)
    console.log('Sending structured payload to Prisma backend:', data)

    setTimeout(() => {
      setIsSaving(false)
    }, 1200)
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onFormSubmit)}>
        <Card>
          <CardHeader>
            <PageTabHeader
              variant="secondary"
              icon={IconTruck}
              title="ช่องทางและตัวเลือกการจัดส่งพัสดุ"
              description="ตั้งค่าบริการบริษัทขนส่ง พร้อมกำหนดอัตราค่าส่งขั้นบันไดและเงื่อนไขพื้นที่ห่างไกลแยกรายบริการอย่างเป็นระบบ"
              endContent={
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleFetchAutoRates}
                >
                  <IconCloudDownload size={16} />
                  ดึงเรทค่าจัดส่งอัตโนมัติ
                </Button>
              }
            />
          </CardHeader>

          <CardContent className="divide-border divide-y">
            <div className="space-y-5 py-5">
              <div>
                <span className="block text-sm font-semibold text-neutral-900">
                  ตัวเลือกผู้ให้บริการจัดส่งและบริการย่อย (Courier & Services)
                </span>
                <span className="text-muted-foreground mt-0.5 block text-xs leading-relaxed">
                  เปิด-ปิด และระบุอัตราค่าบริการของแต่ละบริการย่อย
                </span>
              </div>

              <div className="space-y-6 pt-2">
                {COURIERS_LIST.map((courier) => (
                  <div
                    key={courier.id}
                    className="space-y-3 rounded-xl border bg-neutral-50/40 p-4"
                  >
                    <div>
                      <h4 className="text-sm font-bold text-neutral-900">
                        {courier.name}
                      </h4>
                      <p className="text-muted-foreground text-xs">
                        {courier.description}
                      </p>
                    </div>

                    <div className="border-muted flex flex-col gap-2.5">
                      {courier.services.map((service) => {
                        const formFieldIndex = fields.findIndex(
                          (f) => f.courierServiceId === service.id,
                        )

                        if (formFieldIndex === -1) {
                          return null
                        }

                        const isEnabled =
                          watchedServices[formFieldIndex]?.isEnabled

                        return (
                          <div
                            key={service.id}
                            className={`flex items-center justify-between rounded-lg border bg-white p-3 transition-colors ${
                              isEnabled ? 'border-brand/20 bg-brand/5' : ''
                            }`}
                          >
                            <div>
                              <span className="block text-sm font-medium">
                                {service.name}
                              </span>
                              <span className="text-muted-foreground block text-xs">
                                ระยะเวลาโดยประมาณ: {service.estimatedDays}
                              </span>
                            </div>

                            <div className="flex items-center gap-3">
                              {isEnabled && (
                                <ServiceConfigDialog
                                  serviceName={`${courier.name} - ${service.name}`}
                                  serviceIndex={formFieldIndex}
                                />
                              )}
                              <Switch
                                checked={!!isEnabled}
                                onCheckedChange={(checked) =>
                                  setValue(
                                    `services.${formFieldIndex}.isEnabled`,
                                    checked,
                                    { shouldDirty: true },
                                  )
                                }
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4 py-5">
              <span className="block text-sm font-semibold text-neutral-900">
                เงื่อนไขโปรโมชันส่งฟรีของร้าน
              </span>
              <Field>
                <FieldLabel>ยอดซื้อรวมขั้นต่ำเพื่อส่งฟรี</FieldLabel>
                <div className="mt-1 flex items-center">
                  <Input
                    type="number"
                    placeholder="1000"
                    {...register('freeShipMin', { valueAsNumber: true })}
                    className="rounded-r-none"
                  />
                  <span className="border-input bg-muted text-muted-foreground flex h-9 items-center rounded-r-md border border-l-0 px-3 text-sm select-none">
                    บาท
                  </span>
                </div>
              </Field>
            </div>
          </CardContent>

          <CardFooter className="flex justify-end border-t">
            <Button type="submit" size="sm" disabled={isSaving}>
              {isSaving ? (
                <>
                  <IconLoader2 size={14} className="animate-spin" />{' '}
                  กำลังบันทึกเกณฑ์ขนส่งระบบ...
                </>
              ) : (
                <>
                  <IconDeviceFloppy size={14} /> บันทึกเกณฑ์การส่งสินค้า
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </FormProvider>
  )
}
