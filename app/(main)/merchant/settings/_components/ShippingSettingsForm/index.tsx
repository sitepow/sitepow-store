'use client'

import { useCallback, useEffect } from 'react'
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
import { ALL_BRANCHES, useBranchFilter } from '@/stores/use-branch-filter'
import { ALL_STORES, useStoreFilter } from '@/stores/use-store-filter'
import { ShippingFormValues, shippingFormSchema } from '@/zod/shipping'
import { zodResolver } from '@hookform/resolvers/zod'
import { IconDeviceFloppy, IconTruck } from '@tabler/icons-react'

import { ActionRequiredAlert } from '@/components/ActionRequiredAlert'
import { PageTabHeader } from '@/components/PageTabHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Spinner } from '@/components/ui/spinner'
import { Switch } from '@/components/ui/switch'

import { ApplyGlobalRatesDialog } from './_components/Applyglobalratesdialog'
import { ServiceConfigDialog } from './_components/ServiceConfigDialog'
import { ShippingZoneTable } from './_components/ShippingZoneTable'

export function ShippingSettingsForm() {
  const { selectedStoreId } = useStoreFilter()
  const { selectedBranchId } = useBranchFilter()

  const { mutate: updateShipping, isPending: isUpdating } =
    useUpdateShippingSettings()

  const methods = useForm<ShippingFormValues>({
    resolver: zodResolver(shippingFormSchema),
  })

  const { control, handleSubmit, register, setValue, watch, reset, formState } =
    methods
  const { isDirty } = formState

  const { fields } = useFieldArray({
    control,
    name: 'services',
  })

  const watchedServices = watch('services')
  const watchedFreeShipEnabled = watch('isFreeShipEnabled')

  const { data: shippingSettings } = useStoreShippingSettings(
    selectedStoreId,
    selectedBranchId,
  )

  const resetForm = useCallback(() => {
    if (shippingSettings) {
      reset({
        ...shippingSettings,
        services: shippingSettings.services || [],
      })
    }
  }, [shippingSettings, reset])

  useEffect(() => {
    if (!selectedStoreId || selectedStoreId === ALL_STORES) {
      return
    }
    if (!selectedBranchId || selectedBranchId === ALL_BRANCHES) {
      return
    }

    resetForm()
  }, [selectedStoreId, selectedBranchId, resetForm])

  const onFormSubmit = (data: ShippingFormValues) => {
    if (!selectedStoreId) {
      toast.error('ไม่พบข้อมูลร้านค้า')
      return
    }

    updateShipping({
      storeId: selectedStoreId,
      branchId: selectedBranchId,
      data,
    })
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onFormSubmit)}>
        <Card>
          <CardHeader>
            <PageTabHeader
              variant="secondary"
              icon={IconTruck}
              title="ระบบขนส่งสินค้า"
              description="ตั้งค่าบริการบริษัทขนส่ง พร้อมกำหนดอัตราค่าส่งขั้นบันไดและเงื่อนไขพื้นที่ห่างไกลแยกรายบริการอย่างเป็นระบบ"
              endContent={
                selectedStoreId !== ALL_STORES &&
                selectedBranchId !== ALL_BRANCHES && <ApplyGlobalRatesDialog />
              }
            />
          </CardHeader>

          {selectedStoreId !== ALL_STORES &&
            selectedBranchId !== ALL_BRANCHES && (
              <>
                <CardContent>
                  <div className="mb-5 grid lg:grid-cols-2">
                    <div className="flex flex-col items-start gap-2.5">
                      <Field>
                        <div className="flex items-center gap-2.5">
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
                          <FieldLabel>ยอดซื้อรวมขั้นต่ำเพื่อส่งฟรี</FieldLabel>
                        </div>
                        <FieldDescription className="text-muted-foreground mt-1.5 text-xs">
                          กำหนดเงื่อนไขยอดซื้อขั้นต่ำ
                          หากลูกค้าซื้อสินค้าถึงจำนวนเงินนี้
                          จะได้รับสิทธิ์จัดส่งฟรีทันที
                        </FieldDescription>
                        <div className="mt-2 flex items-center">
                          <Input
                            type="number"
                            min={1}
                            disabled={!watchedFreeShipEnabled}
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
                  </div>
                  <ShippingZoneTable originProvince={watch('storeProvince')} />
                  <Separator className="mt-5" />
                  <div className="space-y-5 py-5">
                    <div>
                      <span className="block text-sm font-semibold">
                        ตัวเลือกผู้ให้บริการจัดส่งและบริการย่อย (Courier &
                        Services)
                      </span>
                      <span className="text-muted-foreground mt-0.5 block text-xs leading-relaxed">
                        เปิด-ปิด และระบุอัตราค่าบริการของแต่ละบริการย่อย
                      </span>
                    </div>
                    <div className="grid gap-4 space-y-6 pt-2 lg:grid-cols-2 2xl:grid-cols-3">
                      {COURIERS_LIST.map((courier) => (
                        <div
                          key={courier.id}
                          className="dark:bg-foreground/5 space-y-3 rounded-xl border p-4"
                        >
                          <div>
                            <h4 className="text-sm font-bold">
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
                                  className={`border-border flex flex-wrap items-center justify-between gap-5 rounded-lg border p-3 transition-colors ${
                                    isEnabled
                                      ? 'border-brand/20 bg-brand/5'
                                      : ''
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
                                  <div className="flex w-full flex-wrap items-center justify-between gap-3">
                                    <ServiceConfigDialog
                                      isDisable={!isEnabled}
                                      serviceName={`${courier.name} - ${service.name}`}
                                      serviceIndex={formFieldIndex}
                                    />
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm font-medium">
                                        {isEnabled ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                                      </span>
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
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-wrap justify-end gap-2 border-t">
                  {isDirty && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => resetForm()}
                    >
                      ล้างค่าการตั้งค่า
                    </Button>
                  )}
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
          {(selectedStoreId === ALL_STORES ||
            selectedBranchId === ALL_BRANCHES) && (
            <CardContent>
              <ActionRequiredAlert />
            </CardContent>
          )}
        </Card>
      </form>
    </FormProvider>
  )
}
