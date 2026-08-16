'use client'

import { useCallback, useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'

import {
  usePaymentSetting,
  useUpsertPaymentSetting,
} from '@/actions/hooks/payment'
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard'
import { ALL_STORES, useStoreFilter } from '@/stores/use-store-filter'
import { PaymentSettingFormValues, paymentSettingSchema } from '@/zod/payment'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  IconCheck,
  IconCopy,
  IconCreditCard,
  IconDeviceFloppy,
  IconEye,
  IconEyeOff,
  IconPlus,
} from '@tabler/icons-react'

import { ActionRequiredAlert } from '@/components/ActionRequiredAlert'
import { PageTabHeader } from '@/components/PageTabHeader'
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

  const [showSecretKey, setShowSecretKey] = useState(false)
  const [showWebhookSecret, setShowWebhookSecret] = useState(false)
  const { copied, copy } = useCopyToClipboard()

  const [selectedBankAccountId, setSelectedBankAccountId] = useState<
    string | undefined
  >()
  const [open, setOpen] = useState(false)

  const centralWebhookUrl =
    selectedStoreId && selectedStoreId !== ALL_STORES
      ? `${typeof window !== 'undefined' ? window.location.origin : ''}/api/webhook/stripe/store/${selectedStoreId}`
      : ''

  const handleEdit = (id: string) => {
    setSelectedBankAccountId(id)
    setOpen(true)
  }

  const handleAdd = () => {
    setSelectedBankAccountId(undefined)
    setOpen(true)
  }

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
        stripeWebhookSecret: paymentSetting.stripeWebhookSecret ?? '',
      })
    }
  }, [paymentSetting, reset])

  useEffect(() => {
    if (!selectedStoreId || selectedStoreId === ALL_STORES) {
      return
    }
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
            title="ช่องทางรับชำระเงิน"
            description="เปิด-ปิดช่องทางการรับเงินสำหรับลูกค้าหน้าร้านค้า พร้อมตั้งค่าบัญชีปลายทางในการรับรายได้"
          />
        </CardHeader>
        {selectedStoreId !== ALL_STORES && (
          <>
            <CardContent className="divide-border divide-y">
              <div className="space-y-4 pb-5">
                <div className="flex flex-wrap items-center justify-between gap-5">
                  <div>
                    <span className="block text-sm font-semibold">
                      โอนเงินผ่านบัญชีธนาคาร
                    </span>
                    <span className="text-muted-foreground mt-1 block text-xs leading-relaxed">
                      เปิดใช้งานการชำระเงินด้วยการโอนผ่านบัญชีธนาคาร
                      พร้อมระบบตรวจสอบสลิปอัตโนมัติหรือตรวจสอบด้วยตนเอง
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
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAdd}
                    >
                      <IconPlus size={14} className="mr-1" /> เพิ่มบัญชีธนาคาร
                    </Button>
                    <BankAccountDialog
                      bankAccountId={selectedBankAccountId}
                      open={open}
                      setOpen={setOpen}
                    />
                  </div>
                  <BankAccountTable
                    accounts={paymentSetting?.bankAccounts ?? []}
                    onEdit={handleEdit}
                  />
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-5 py-5">
                <div>
                  <span className="block text-sm font-semibold">
                    เชื่อมบัญชี Stripe
                  </span>
                  <span className="text-muted-foreground mt-1 block text-xs leading-relaxed">
                    เปิดช่องทางรับชำระเงินออนไลน์ผ่านบัตรเครดิต บัตรเดบิต และ QR
                    PromptPay ได้อย่างสะดวกรวดเร็ว
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
                <div className="mt-5 space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="flex gap-2">
                      <Controller
                        control={control}
                        name="stripeSecretKey"
                        render={({ field }) => (
                          <Input
                            type={showSecretKey ? 'text' : 'password'}
                            placeholder="sk_live_..."
                            {...field}
                          />
                        )}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setShowSecretKey(!showSecretKey)}
                        className="shrink-0"
                      >
                        {showSecretKey ? (
                          <IconEyeOff size={16} />
                        ) : (
                          <IconEye size={16} />
                        )}
                      </Button>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="stripeWebhookSecret">
                        Stripe Webhook Signing Secret
                      </Label>
                      <div className="flex gap-2">
                        <Controller
                          control={control}
                          name="stripeWebhookSecret"
                          render={({ field }) => (
                            <Input
                              type={showWebhookSecret ? 'text' : 'password'}
                              placeholder="whsec_..."
                              {...field}
                            />
                          )}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() =>
                            setShowWebhookSecret(!showWebhookSecret)
                          }
                          className="shrink-0"
                        >
                          {showWebhookSecret ? (
                            <IconEyeOff size={16} />
                          ) : (
                            <IconEye size={16} />
                          )}
                        </Button>
                      </div>
                      <span className="text-muted-foreground text-xs">
                        กรอกรหัส Webhook Secret ที่ได้จากการตั้งค่าใน Stripe
                        Dashboard ของคุณ
                      </span>
                    </div>
                  </div>
                  <div className="bg-muted/55 space-y-2 rounded-lg border p-4">
                    <span className="block text-xs font-semibold">
                      คำแนะนำการตั้งค่า Webhook ใน Stripe ของร้านค้า
                    </span>
                    <p className="text-muted-foreground text-xs leading-relaxed">
                      โปรดนำ URL ด้านล่างนี้ไปเพิ่มใน Stripe Dashboard ของคุณ
                      (ที่เมนู Developers &gt; Webhooks) และเลือกรับอีเวนต์{' '}
                      <code className="bg-background rounded px-1 py-0.5 text-xs">
                        checkout.session.completed
                      </code>
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <Input
                        readOnly
                        value={centralWebhookUrl}
                        className="h-8 text-xs"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8 shrink-0 text-xs"
                        onClick={() => copy(centralWebhookUrl)}
                      >
                        {copied ? (
                          <>
                            <IconCheck size={16} className="mr-1" /> คัดลอกแล้ว
                          </>
                        ) : (
                          <>
                            <IconCopy size={16} className="mr-1" /> คัดลอก
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-wrap justify-end gap-2.5 border-t">
              {isDirty && (
                <Button type="button" variant="outline" onClick={resetForm}>
                  ล้างค่าการตั้งค่า
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
