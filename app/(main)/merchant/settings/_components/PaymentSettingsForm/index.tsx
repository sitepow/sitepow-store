'use client'

import { useCallback, useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'

import {
  usePaymentSetting,
  useUpsertPaymentSetting,
} from '@/actions/hooks/payment'
import { ALL_STORES, useStoreFilter } from '@/stores/use-store-filter'
import { PaymentSettingFormValues, paymentSettingSchema } from '@/zod/payment'
import { zodResolver } from '@hookform/resolvers/zod'
import { IconCreditCard, IconDeviceFloppy } from '@tabler/icons-react'

import { ActionRequiredAlert } from '@/components/ActionRequiredAlert'
import { PageTabHeader } from '@/components/PageTabHeader'
import { StoreSelectField } from '@/components/StoreSelectField'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { Switch } from '@/components/ui/switch'

import { BankAccountDialog } from './_components/BankAccountDialog'
import { BankAccountTable } from './_components/BankAccountTable'

export function PaymentSettingsForm() {
  const { selectedStoreId } = useStoreFilter()

  const { data: paymentSetting } = usePaymentSetting(selectedStoreId)
  const { mutate: upsertSetting, isPending: isSaving } =
    useUpsertPaymentSetting()

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { isDirty },
  } = useForm<PaymentSettingFormValues>({
    resolver: zodResolver(paymentSettingSchema),
    defaultValues: {
      isBankTransferEnabled: true,
      isStripeEnabled: false,
    },
  })

  const isStripeEnabled = watch('isStripeEnabled')

  const resetForm = useCallback(() => {
    if (paymentSetting) {
      reset({
        ...paymentSetting,
        stripeSecretKey: paymentSetting.stripeSecretKey ?? '',
        stripePublicKey: paymentSetting.stripePublicKey ?? '',
      })
    }
  }, [paymentSetting, reset])

  useEffect(() => {
    if (!selectedStoreId || selectedStoreId === ALL_STORES) return
    resetForm()
  }, [selectedStoreId, resetForm])

  const onSubmit = (data: PaymentSettingFormValues) => {
    if (!selectedStoreId) {
      return
    }

    upsertSetting({ storeId: selectedStoreId, data })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <PageTabHeader
            variant="secondary"
            icon={IconCreditCard}
            title="เกตเวย์และช่องทางรับชำระเงิน"
            description="เปิด-ปิดช่องทางการรับเงินสำหรับลูกค้าหน้าร้านค้า พร้อมตั้งค่าบัญชีปลายทางในการรับรายได้"
            endContent={<StoreSelectField />}
          />
        </CardHeader>

        {selectedStoreId !== ALL_STORES && (
          <>
            <CardContent className="divide-border divide-y">
              <div className="space-y-4 pb-5">
                <div className="flex flex-wrap items-center justify-between gap-5">
                  <div>
                    <span className="block text-sm font-semibold">
                      โอนเงินผ่านบัญชีธนาคาร (Bank Transfer)
                    </span>
                    <span className="text-muted-foreground mt-1 block text-xs leading-relaxed">
                      ลูกค้าโอนเงินแล้วแนบสลิปหลักฐานในระบบ
                      พ่อค้าตรวจสอบและอนุมัติเองด้วยตนเอง
                    </span>
                  </div>
                  <Controller
                    control={control}
                    name="isBankTransferEnabled"
                    render={({ field }) => (
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-5">
                    <span className="text-sm font-medium">
                      บัญชีธนาคารที่รับเงิน
                    </span>
                    <BankAccountDialog />
                  </div>
                  <BankAccountTable
                    accounts={paymentSetting?.bankAccounts ?? []}
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-5 py-5">
                <div>
                  <span className="block text-sm font-semibold">
                    Stripe Payment Gateway
                  </span>
                  <span className="text-muted-foreground mt-1 block text-xs leading-relaxed">
                    รับชำระเงินผ่าน QR PromptPay แบบ Dynamic
                    ยืนยันการชำระเงินอัตโนมัติผ่าน Webhook
                  </span>
                </div>
                <Controller
                  control={control}
                  name="isStripeEnabled"
                  render={({ field }) => (
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
              </div>

              {isStripeEnabled && (
                <div className="grid gap-4 pt-5 lg:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="stripePublicKey">กุญแจสาธารณะ</Label>
                    <Controller
                      control={control}
                      name="stripePublicKey"
                      render={({ field }) => (
                        <Input {...field} placeholder="pk_live_..." />
                      )}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="stripeSecretKey">กุญแจลับ</Label>
                    <Controller
                      control={control}
                      name="stripeSecretKey"
                      render={({ field }) => (
                        <Input {...field} placeholder="sk_live_..." />
                      )}
                    />
                  </div>
                </div>
              )}
            </CardContent>

            <CardFooter className="flex flex-wrap justify-end gap-2.5 border-t">
              {isDirty && (
                <Button type="button" variant="outline" onClick={resetForm}>
                  ล้างค่า
                </Button>
              )}
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Spinner /> กำลังบันทึก...
                  </>
                ) : (
                  <>
                    <IconDeviceFloppy size={14} /> บันทึกการตั้งค่า
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
  )
}
