'use client'

import { useEffect, useState } from 'react'
import { Controller, useForm, useFormContext } from 'react-hook-form'
import toast from 'react-hot-toast'

import { useTranslations } from 'next-intl'

import { useCreateCustomer, useSearchCustomer } from '@/actions/hooks/customer'
import {
  useStorefrontLoyalty,
  useValidateCoupon,
} from '@/actions/hooks/storefront/discount'
import { SummaryRow } from '@/app/sites/[domain]/_components/cart/_components/SummaryRow'
import { SummaryTotal } from '@/app/sites/[domain]/_components/cart/_components/SummaryTotal'
import { useCurrentStore } from '@/hooks/use-current-store'
import { useMerchantCurrency } from '@/hooks/use-merchant-currency'
import { useStoreFilter } from '@/stores/use-store-filter'
import { calculateMaxUsablePoints } from '@/utils/cart'
import { formatNumber } from '@/utils/pricing'
import { formatPhoneInput, formatPromptPay } from '@/utils/slip'
import { CreateCustomerInput, createCustomerSchema } from '@/zod/customer'
import { POSCheckoutInput } from '@/zod/order'
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

import { CustomerCard } from '@/components/CustomerCard'
import { DialogHeaderIcon } from '@/components/DialogHeaderIcon'
import { HighlightText } from '@/components/HighlightText'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
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
  const { currentStore, store } = useCurrentStore()
  const { formatCurrency } = useMerchantCurrency()
  const t = useTranslations('merchant.pos.discountDialog')
  const tPos = useTranslations('merchant.pos')
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
      toast.error(t('searchError'))
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
            ? t('editDiscountMember')
            : t('addCustomerDiscount')}
        </Button>
      </DialogTrigger>
      <DialogContent
        style={
          {
            '--primary': currentStore?.primaryColor ?? store?.primaryColor,
          } as React.CSSProperties
        }
        className="sm:max-w-md"
      >
        <DialogHeader>
          <DialogHeaderIcon icon={IconTicket} title={t('title')} />
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="space-y-3">
            {customerId ? (
              <>
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-1.5 text-sm font-semibold">
                    <IconUserPlus className="text-primary size-4" />
                    {t('memberLabel')}
                  </Label>
                </div>
                <CustomerCard
                  title={tPos('customerInfo')}
                  content={
                    <>
                      {tPos('customerId', { id: customerId })} <br />
                      {tPos('customerPhone', {
                        phone: formatPromptPay(customerPhone),
                      })}{' '}
                      <br />
                      {tPos('customerPoints', {
                        points: formatNumber(customerPoints),
                      })}
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
                    {t('memberLabel')}
                  </Label>
                  <TabsList className="h-8 p-0.5">
                    <TabsTrigger value="search" className="text-xs">
                      {t('searchTab')}
                    </TabsTrigger>
                    <TabsTrigger value="create" className="text-xs">
                      {t('newMemberTab')}
                    </TabsTrigger>
                  </TabsList>
                </div>
                <TabsContent value="search" className="mt-0">
                  <div className="flex gap-2">
                    <Input
                      placeholder={t('searchPlaceholder')}
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
                      {searchCustomerMutation.isPending
                        ? t('searching')
                        : t('search')}
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
                          {t('firstName')}{' '}
                          <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          placeholder="John"
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
                        <Label className="text-xs">{t('lastName')}</Label>
                        <Input
                          placeholder="Doe"
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
                          {t('phone')}{' '}
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
                        <Label className="text-xs">{t('email')}</Label>
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
                        ? t('registering')
                        : t('registerMember')}
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
                    {t('usePoints')}
                  </Label>
                  <span className="text-primary text-sm font-semibold">
                    {formatNumber(usedPoints)} / {formatNumber(maxUsablePoints)}{' '}
                    {t('pointsUnit')}
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
                    {t('redeemForDiscount')}{' '}
                    <strong className="text-primary">
                      {formatCurrency(pointsDiscount)}
                    </strong>
                  </span>
                </div>
                {pointRedeemRate > 0 && (
                  <p className="text-muted-foreground text-xs">
                    {t('pointsRate', {
                      rate: formatCurrency(pointRedeemRate),
                    })}
                  </p>
                )}
              </div>
            </>
          )}
          <Separator />
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <IconDiscount2 className="text-muted-foreground size-4" />
              {t('couponTitle')}
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
                  placeholder={t('couponPlaceholder')}
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
                    ? t('validatingCoupon')
                    : t('applyCoupon')}
                </Button>
              </div>
            )}
          </div>
          <div className="bg-muted/20 space-y-3 rounded-xl border p-4">
            <SummaryRow
              label={t('pointsDiscount')}
              value={
                <HighlightText>
                  - {formatCurrency(pointsDiscount)}
                </HighlightText>
              }
            />
            <SummaryRow
              label={t('couponDiscount')}
              value={
                <HighlightText>
                  - {formatCurrency(couponDiscount)}
                </HighlightText>
              }
            />
            <Separator />
            <SummaryTotal
              label={t('totalDiscount')}
              value={formatCurrency(totalDiscount)}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
