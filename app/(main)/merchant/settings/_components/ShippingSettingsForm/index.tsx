'use client'

import { useState } from 'react'
import { FormProvider, useFieldArray, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

import { upsertGlobalShippingRateMatrix } from '@/actions/global-shipping-rate-matrix'
import { useGetShippingPrice } from '@/actions/hooks/shippop'
import {
  COURIERS_LIST,
  DEFAULT_PRESET_VALUES,
  PROVINCES_POOL,
  SHIPPING_WEIGHT_TIERS,
} from '@/constants/shipping'
import {
  AggregatedRate,
  aggregateRatesByMaxFee,
  getProvinceDetails,
  getRepresentativeDestinations,
} from '@/utils/shipping'
import { ShippingFormValues, shippingFormSchema } from '@/zod/shipping'
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
import { Spinner } from '@/components/ui/spinner'
import { Switch } from '@/components/ui/switch'

import { ServiceConfigDialog } from './_components/ServiceConfigDialog'

interface ShippopService {
  id: string
  currentFee: number | null | undefined
}

interface ShippopCourier {
  services: ShippopService[]
}

export function ShippingSettingsForm({
  initialData,
}: {
  initialData?: ShippingFormValues
}) {
  const [isSaving, setIsSaving] = useState(false)

  const { mutateAsync: fetchPriceMutation, isPending: isFetchingRates } =
    useGetShippingPrice()

  const methods = useForm<ShippingFormValues>({
    resolver: zodResolver(shippingFormSchema),
    defaultValues: initialData || DEFAULT_PRESET_VALUES,
  })

  const { control, handleSubmit, register, setValue, watch } = methods

  const { fields } = useFieldArray({
    control,
    name: 'services',
  })

  const watchedServices = watch('services')

  const fetchRatesForProvince = async (
    provinceName: string,
    districtName: string,
    stateName: string,
    postcode: string,
  ): Promise<{
    fromProvince: string
    ratesMatrix: Record<string, AggregatedRate[]>
  }> => {
    const rawAccumulator = new Map<string, AggregatedRate[]>()

    const representativeDestinations =
      getRepresentativeDestinations(provinceName)

    for (const tier of SHIPPING_WEIGHT_TIERS) {
      for (const dest of representativeDestinations) {
        try {
          const shippopData = await fetchPriceMutation({
            zoneType: dest.zoneType,
            minWeight: tier.minWeight,
            weight: tier.maxWeight,
            fromPostcode: postcode,
            fromDistrict: districtName,
            fromState: stateName,
            fromProvince: provinceName,
            toPostcode: dest.postcode,
            toDistrict: dest.district,
            toState: dest.state,
            toProvince: dest.province,
            width: tier.width,
            length: tier.length,
            height: tier.height,
          })

          if (shippopData && Array.isArray(shippopData)) {
            shippopData.forEach((courierData: ShippopCourier) => {
              courierData.services.forEach((activeService: ShippopService) => {
                if (
                  activeService.currentFee !== null &&
                  activeService.currentFee !== undefined
                ) {
                  if (!rawAccumulator.has(activeService.id)) {
                    rawAccumulator.set(activeService.id, [])
                  }
                  rawAccumulator.get(activeService.id)!.push({
                    zoneType: dest.zoneType,
                    minWeight: tier.minWeight,
                    maxWeight: tier.maxWeight,
                    fee: activeService.currentFee,
                  })
                }
              })
            })
          }

          await new Promise((resolve) => setTimeout(resolve, 50))
        } catch (apiErr) {
          console.warn(
            `⚠️ ข้ามคู่ขนส่ง ${provinceName} → ${dest.province} [${dest.zoneType}] (${tier.minWeight}-${tier.maxWeight}g):`,
            apiErr,
          )
        }
      }
    }

    const ratesMatrix: Record<string, AggregatedRate[]> = {}
    rawAccumulator.forEach((rawRates, serviceId) => {
      ratesMatrix[serviceId] = aggregateRatesByMaxFee(rawRates)
    })

    return { fromProvince: provinceName, ratesMatrix }
  }

  const handleFetchAutoRates = async () => {
    await Promise.all(
      PROVINCES_POOL.map(async (provinceName) => {
        try {
          const sourceDetails = getProvinceDetails(provinceName)

          const provinceData = await fetchRatesForProvince(
            provinceName,
            sourceDetails.district,
            sourceDetails.state,
            sourceDetails.postcode,
          )

          // watchedServices.forEach((serviceFormItem, index) => {
          //   const aggregatedRates =
          //     provinceData.ratesMatrix[serviceFormItem.courierServiceId]
          //   if (aggregatedRates) {
          //     setValue(`services.${index}.weightRates`, aggregatedRates, {
          //       shouldDirty: true,
          //       shouldValidate: true,
          //     })
          //   }
          // })

          await upsertGlobalShippingRateMatrix([provinceData])
          toast.success(
            `บันทึกเรทจัดส่งสำหรับจังหวัด ${provinceName} เรียบร้อยแล้ว`,
          )
        } catch (singleProvinceErr) {
          const errorMessage = `⚠️ ข้อผิดพลาดที่จังหวัด ${provinceName}`
          toast.error(errorMessage)
          console.error(errorMessage, singleProvinceErr)
        }
      }),
    )
  }

  const onFormSubmit = (data: ShippingFormValues) => {
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
                  disabled={isFetchingRates}
                  onClick={handleFetchAutoRates}
                >
                  {isFetchingRates && (
                    <>
                      <Spinner />
                      กำลังดึงเรทค่าจัดส่งอัตโนมัติ...
                    </>
                  )}

                  {!isFetchingRates && (
                    <>
                      <IconCloudDownload size={16} />
                      ดึงเรทค่าจัดส่งอัตโนมัติ
                    </>
                  )}
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
