'use client'

import { useEffect, useState } from 'react'
import { Controller, useForm, useFormContext } from 'react-hook-form'
import toast from 'react-hot-toast'

import { useCreateCustomer, useSearchCustomer } from '@/actions/sales/customer/hooks'
import {
  useStorefrontLoyalty,
  useValidateCoupon,
} from '@/actions/storefront/discount/hooks'
import { SummaryRow } from '@/app/sites/[domain]/_components/cart/_components/SummaryRow'
import { SummaryTotal } from '@/app/sites/[domain]/_components/cart/_components/SummaryTotal'
import { useStoreFilter } from '@/stores/use-store-filter'
import { calculateMaxUsablePoints } from '@/utils/cart/cart-calculation'
import { formatCurrency, formatNumber } from '@/utils/formatting/number'
import { formatPhoneInput, formatPromptPay } from '@/utils/formatting/promptpay-phone'
import { CreateCustomerInput, createCustomerSchema } from '@/zod/sales/customer'
import { POSCheckoutInput } from '@/zod/sales/pos-checkout'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  IconDiscount2,
  IconPlus,
  IconSearch,
  IconTicket,
  IconUserPlus,
  IconWallet,
  IconX,
} from '@tabler/icons-react'

import { CustomerCard } from '@/components/customer/CustomerCard'
import { HighlightText } from '@/components/shared/HighlightText'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Slider } from '@/components/ui/slider'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface PosDiscountDialogProps {
  subtotal: number
}

export function PosDiscountDialog({ subtotal }: PosDiscountDialogProps) {
  const { selectedStoreId, selectedStoreSlug } = useStoreFilter()
  const { data: loyalty } = useStorefrontLoyalty(selectedStoreSlug)
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<'search' | 'create'>('search')
  const [searchInput, setSearchInput] = useState('')
  const [inputCouponCode, setInputCouponCode] = useState('')
  const { watch, setValue } = useFormContext<POSCheckoutInput>()
  const customerId = watch('customerId')
  const customerPhone = watch('customerPhone')
  const customerPoints = watch('customerPoints') || 0
  const usedPoints = watch('usedPoints') || 0
  const couponCode = watch('couponCode')
  const couponDiscount = watch('couponDiscount') || 0

  const {
    register,
    handleSubmit,
    control,
    reset: resetCreateForm,
    formState: { errors },
  } = useForm<CreateCustomerInput>({
    resolver: zodResolver(createCustomerSchema),
  })

  const searchCustomerMutation = useSearchCustomer()
  const createCustomerMutation = useCreateCustomer()
  const validateCouponMutation = useValidateCoupon()
  const pointRedeemRate = loyalty?.pointRedeemRate ?? 0
  const isPointsEnabled = loyalty?.isPointsEnabled ?? false

  const maxUsablePoints = customerId
    ? calculateMaxUsablePoints(
        subtotal,
        couponDiscount,
        pointRedeemRate,
        customerPoints,
      )
    : 0

  const pointsDiscount = usedPoints * pointRedeemRate
  const totalDiscount = pointsDiscount + couponDiscount

  useEffect(() => {
    if (usedPoints > maxUsablePoints) {
      setValue('usedPoints', maxUsablePoints)
    }
  }, [maxUsablePoints, usedPoints, setValue])

  const handleSearchMember = () => {
    if (!searchInput.trim()) {
      toast.error('กรุณากรอกเบอร์โทรศัพท์ อีเมล หรือ รหัสสมาชิก')
      return
    }

    if (!selectedStoreId) {
      return
    }

    const cleanQuery =
      searchInput.trim().replace(/\D/g, '') || searchInput.trim()

    searchCustomerMutation.mutate(
      { storeId: selectedStoreId, query: cleanQuery },
      {
        onSuccess: (data) => {
          if (data.success && data.data) {
            setValue('customerId', data.data.id)
            setValue('customerName', data.data.name)
            setValue('customerPhone', data.data.phone)
            setValue('customerPoints', data.data.points)
          }
        },
      },
    )
  }

  const handleCreateMember = (data: CreateCustomerInput) => {
    if (!selectedStoreId) {
      return
    }

    createCustomerMutation.mutate(
      {
        storeId: selectedStoreId,
        firstName: data.firstName.trim(),
        lastName: data.lastName?.trim() || undefined,
        phone: data.phone,
        email: data.email?.trim() || undefined,
      },
      {
        onSuccess: (res) => {
          if (res.success && res.data) {
            setValue('customerId', res.data.id)
            setValue('customerName', res.data.name)
            setValue('customerPhone', res.data.phone)
            setValue('customerPoints', res.data.points)
            resetCreateForm()
            setMode('search')
          }
        },
      },
    )
  }

  const handleRemoveCustomer = () => {
    setValue('customerId', undefined)
    setValue('customerName', undefined)
    setValue('customerPhone', undefined)
    setValue('customerPoints', 0)
    setValue('usedPoints', 0)
    setSearchInput('')
  }

  const handleApplyCouponCode = () => {
    if (!inputCouponCode.trim()) {
      return
    }

    validateCouponMutation.mutate(
      {
        storeSlug: selectedStoreSlug,
        code: inputCouponCode.trim(),
        subtotal,
      },
      {
        onSuccess: (res) => {
          if (res.success && res.data) {
            setValue('couponCode', res.data.code)
            setValue('couponDiscount', res.data.discountAmount)
            setInputCouponCode('')
          }
        },
      },
    )
  }

  const handleRemoveCoupon = () => {
    setValue('couponCode', undefined)
    setValue('couponDiscount', 0)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full gap-2">
          <IconTicket />
          {couponCode || usedPoints > 0
            ? 'แก้ไขส่วนลด/สมาชิก'
            : 'เพิ่มลูกค้า/เพิ่มส่วนลด'}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <IconTicket className="text-primary" />
            ใช้ส่วนลด
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="space-y-3">
            {customerId ? (
              <>
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-1.5 text-sm font-semibold">
                    <IconUserPlus className="text-primary size-4" />
                    สมาชิกสะสมแต้ม
                  </Label>
                </div>
                <CustomerCard
                  title="ข้อมูลลูกค้า"
                  content={
                    <>
                      รหัสลูกค้า: {customerId} <br />
                      เบอร์โทรศัพท์: {formatPromptPay(customerPhone)} <br />
                      แต้มคงเหลือ: {formatNumber(customerPoints)} แต้ม
                    </>
                  }
                  action={
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleRemoveCustomer}
                    >
                      <IconX />
                    </Button>
                  }
                />
              </>
            ) : (
              <Tabs
                value={mode}
                onValueChange={(val) => setMode(val as 'search' | 'create')}
                className="w-full space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between">
                  <Label className="flex items-center gap-1.5 text-sm font-semibold">
                    <IconUserPlus className="text-primary size-4" />
                    สมาชิกสะสมแต้ม
                  </Label>
                  <TabsList className="h-8 p-0.5">
                    <TabsTrigger value="search" className="text-xs">
                      ค้นหา
                    </TabsTrigger>
                    <TabsTrigger value="create" className="text-xs">
                      + สมัครใหม่
                    </TabsTrigger>
                  </TabsList>
                </div>
                <TabsContent value="search" className="mt-0">
                  <div className="flex gap-2">
                    <Input
                      placeholder="ค้นหาด้วย เบอร์โทร / อีเมล / รหัสสมาชิก..."
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === 'Enter' && handleSearchMember()
                      }
                      className="h-10 text-sm"
                    />
                    <Button
                      type="button"
                      onClick={handleSearchMember}
                      disabled={searchCustomerMutation.isPending}
                      className="h-10 gap-1.5 px-4 font-medium"
                    >
                      <IconSearch className="size-4" />
                      {searchCustomerMutation.isPending ? 'ค้นหา...' : 'ค้นหา'}
                    </Button>
                  </div>
                </TabsContent>
                <TabsContent value="create" className="mt-0">
                  <form
                    onSubmit={handleSubmit(handleCreateMember)}
                    className="bg-muted/30 space-y-3 rounded-xl border p-3.5"
                  >
                    <div className="grid gap-2 sm:grid-cols-2">
                      <div className="space-y-1">
                        <Label className="text-xs">
                          ชื่อ <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          placeholder="สมชาย"
                          className="h-9 text-xs"
                          {...register('firstName')}
                        />
                        {errors.firstName && (
                          <p className="text-destructive text-[11px]">
                            {errors.firstName.message}
                          </p>
                        )}
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">นามสกุล</Label>
                        <Input
                          placeholder="ใจดี"
                          className="h-9 text-xs"
                          {...register('lastName')}
                        />
                        {errors.lastName && (
                          <p className="text-destructive text-[11px]">
                            {errors.lastName.message}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <div className="space-y-1">
                        <Label className="text-xs">
                          เบอร์โทรศัพท์{' '}
                          <span className="text-destructive">*</span>
                        </Label>
                        <Controller
                          name="phone"
                          control={control}
                          render={({
                            field: { onChange, value, ...field },
                          }) => (
                            <Input
                              {...field}
                              placeholder="08X-XXX-XXXX"
                              className="h-9 text-xs"
                              value={value ?? ''}
                              onChange={(e) => {
                                const formatted = formatPhoneInput(
                                  e.target.value,
                                )
                                onChange(formatted)
                              }}
                            />
                          )}
                        />
                        {errors.phone && (
                          <p className="text-destructive text-[11px]">
                            {errors.phone.message}
                          </p>
                        )}
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">อีเมล</Label>
                        <Input
                          type="email"
                          placeholder="customer@example.com"
                          className="h-9 text-xs"
                          {...register('email')}
                        />
                        {errors.email && (
                          <p className="text-destructive text-[11px]">
                            {errors.email.message}
                          </p>
                        )}
                      </div>
                    </div>
                    <Button
                      type="submit"
                      disabled={createCustomerMutation.isPending}
                      className="w-full gap-1.5 font-semibold"
                      size="sm"
                    >
                      <IconPlus className="size-4" />
                      {createCustomerMutation.isPending
                        ? 'กำลังบันทึก...'
                        : 'ลงทะเบียนสมาชิกใหม่'}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            )}
          </div>
          {isPointsEnabled && (
            <>
              <Separator />
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <IconWallet className="text-muted-foreground size-4" />
                    ใช้แต้มสะสม
                  </Label>
                  <span className="text-primary text-sm font-semibold">
                    {formatNumber(usedPoints)} / {formatNumber(maxUsablePoints)}{' '}
                    แต้ม
                  </span>
                </div>
                <Slider
                  max={maxUsablePoints || 1}
                  step={1}
                  value={[usedPoints]}
                  onValueChange={(val) => setValue('usedPoints', val[0])}
                  disabled={!customerId || maxUsablePoints === 0}
                  className="cursor-pointer"
                />
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={usedPoints}
                    onChange={(e) =>
                      setValue(
                        'usedPoints',
                        Math.max(
                          0,
                          Math.min(Number(e.target.value), maxUsablePoints),
                        ),
                      )
                    }
                    disabled={!customerId || maxUsablePoints === 0}
                    className="w-24 text-center font-bold"
                  />
                  <span className="text-muted-foreground text-sm">
                    แลกเป็นส่วนลดได้{' '}
                    <strong className="text-primary">
                      {formatCurrency(pointsDiscount)}
                    </strong>
                  </span>
                </div>
                {pointRedeemRate > 0 && (
                  <p className="text-muted-foreground text-xs">
                    (1 แต้ม = {formatCurrency(pointRedeemRate)})
                  </p>
                )}
              </div>
            </>
          )}
          <Separator />
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <IconDiscount2 className="text-muted-foreground size-4" />
              รหัสส่วนลด
            </Label>
            {couponCode ? (
              <div className="border-primary/20 bg-primary/5 flex items-center justify-between rounded-md border px-3 py-2">
                <span className="text-sm font-medium">{couponCode}</span>
                <div className="flex items-center gap-2">
                  <span className="text-primary text-sm font-semibold">
                    -{formatCurrency(couponDiscount)}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleRemoveCoupon}
                  >
                    <IconX />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <Input
                  placeholder="กรอกรหัสส่วนลด"
                  value={inputCouponCode}
                  className="uppercase"
                  onChange={(e) => setInputCouponCode(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === 'Enter' && handleApplyCouponCode()
                  }
                />
                <Button
                  variant="outline"
                  onClick={handleApplyCouponCode}
                  disabled={
                    !inputCouponCode.trim() || validateCouponMutation.isPending
                  }
                >
                  {validateCouponMutation.isPending
                    ? 'กำลังตรวจสอบ...'
                    : 'ใช้งาน'}
                </Button>
              </div>
            )}
          </div>
          <div className="bg-muted/20 space-y-3 rounded-xl border p-4">
            <SummaryRow
              label="ส่วนลดจากแต้มสะสม"
              value={
                <HighlightText>
                  - {formatCurrency(pointsDiscount)}
                </HighlightText>
              }
            />
            <SummaryRow
              label="ส่วนลดจากรหัส"
              value={
                <HighlightText>
                  - {formatCurrency(couponDiscount)}
                </HighlightText>
              }
            />
            <Separator />
            <SummaryTotal
              label="รวมส่วนลดทั้งหมด"
              value={formatCurrency(totalDiscount)}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
