'use client'

import { useEffect } from 'react'
import {
  Controller,
  FormProvider,
  useFieldArray,
  useForm,
} from 'react-hook-form'
import toast from 'react-hot-toast'

import {
  useStoreShippingSettings,
  useUpdateShippingSettings,
} from '@/actions/hooks/shipping'
import { COURIERS_LIST } from '@/constants/shipping'
import { ALL_STORES, useStoreFilter } from '@/stores/use-store-filter'
import { ShippingFormValues, shippingFormSchema } from '@/zod/shipping'
import { zodResolver } from '@hookform/resolvers/zod'
import { IconDeviceFloppy, IconTruck } from '@tabler/icons-react'

import { ActionRequiredAlert } from '@/components/ActionRequiredAlert'
import { PageTabHeader } from '@/components/PageTabHeader'
import { StoreSelectField } from '@/components/StoreSelectField'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { Switch } from '@/components/ui/switch'

import { ApplyGlobalRatesDialog } from './_components/Applyglobalratesdialog'
import { ServiceConfigDialog } from './_components/ServiceConfigDialog'
import { ShippingZoneTable } from './_components/ShippingZoneTable'

export function ShippingSettingsForm() {
  const { selectedStoreId } = useStoreFilter()

  const { mutate: updateShipping, isPending: isUpdating } =
    useUpdateShippingSettings()

  const methods = useForm<ShippingFormValues>({
    resolver: zodResolver(shippingFormSchema),
  })

  const { control, handleSubmit, register, setValue, watch, reset } = methods

  const { fields } = useFieldArray({
    control,
    name: 'services',
  })

  const watchedServices = watch('services')
  const watchedFreeShipEnabled = watch('isFreeShipEnabled')

  const { data: shippingSettings } = useStoreShippingSettings(selectedStoreId)

  useEffect(() => {
    if (!selectedStoreId || !shippingSettings) {
      return
    }

    reset({
      ...shippingSettings,
      services: shippingSettings.services || [],
    })
  }, [selectedStoreId, reset, shippingSettings])

  const onFormSubmit = (data: ShippingFormValues) => {
    if (!selectedStoreId) {
      toast.error('ไม่พบข้อมูลร้านค้า')
      return
    }

    updateShipping(
      { storeId: selectedStoreId, data },
      {
        onSuccess: () => {
          toast.success('บันทึกการตั้งค่าการจัดส่งเรียบร้อยแล้ว')
        },
      },
    )
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
                <div className="flex flex-wrap items-end gap-2">
                  {selectedStoreId !== ALL_STORES && <ApplyGlobalRatesDialog />}
                  <StoreSelectField />
                </div>
              }
            />
          </CardHeader>

          {selectedStoreId !== ALL_STORES && (
            <>
              <CardContent className="divide-border divide-y">
                <ShippingZoneTable originProvince={watch('storeProvince')} />

                <div className="space-y-5 py-5">
                  <div>
                    <span className="block text-sm font-semibold text-neutral-900">
                      ตัวเลือกผู้ให้บริการจัดส่งและบริการย่อย (Courier &
                      Services)
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
                                    ระยะเวลาโดยประมาณ {service.estimatedDays}
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
                  <div className="flex flex-wrap gap-2">
                    <Controller
                      control={control}
                      name="isFreeShipEnabled"
                      render={({ field }) => (
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      )}
                    />
                    <span className="block text-sm font-semibold text-neutral-900">
                      เงื่อนไขโปรโมชันส่งฟรีของร้าน
                    </span>
                  </div>
                  {watchedFreeShipEnabled && (
                    <div className="grid grid-cols-2">
                      <Field>
                        <FieldLabel>ยอดซื้อรวมขั้นต่ำเพื่อส่งฟรี</FieldLabel>
                        <div className="mt-1 flex items-center">
                          <Input
                            type="number"
                            placeholder="1000"
                            {...register('freeShipMin', {
                              valueAsNumber: true,
                            })}
                            className="rounded-r-none"
                          />
                          <span className="border-input bg-muted text-muted-foreground flex h-9 items-center rounded-r-md border border-l-0 px-3 text-sm select-none">
                            บาท
                          </span>
                        </div>
                      </Field>
                    </div>
                  )}
                </div>
              </CardContent>

              <CardFooter className="flex justify-end border-t">
                <Button type="submit" disabled={isUpdating}>
                  {isUpdating ? (
                    <>
                      <Spinner />
                      กำลังบันทึกเกณฑ์ขนส่งระบบ...
                    </>
                  ) : (
                    <>
                      <IconDeviceFloppy size={14} /> บันทึกเกณฑ์การส่งสินค้า
                    </>
                  )}
                </Button>
              </CardFooter>
            </>
          )}

          {selectedStoreId === ALL_STORES && (
            <CardContent>
              <ActionRequiredAlert />
            </CardContent>
          )}
        </Card>
      </form>
    </FormProvider>
  )
}
