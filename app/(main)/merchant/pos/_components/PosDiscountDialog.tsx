'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

import { POSCustomerData } from '@/actions/customer'
import { useCreateCustomer, useSearchCustomer } from '@/actions/hooks/customer'
import { useValidateCoupon } from '@/actions/hooks/storefront/discount'
import { SummaryRow } from '@/app/sites/[domain]/_components/cart/_components/SummaryRow'
import { SummaryTotal } from '@/app/sites/[domain]/_components/cart/_components/SummaryTotal'
import { useStoreFilter } from '@/stores/use-store-filter'
import { formatCurrency, formatNumber } from '@/utils/pricing'
import { formatPromptPay } from '@/utils/slip'
import { CreateCustomerInput, createCustomerSchema } from '@/zod/customer'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  IconDiscount2,
  IconPlus,
  IconSearch,
  IconTicket,
  IconUserCheck,
  IconUserPlus,
  IconWallet,
  IconX,
} from '@tabler/icons-react'

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

export interface AppliedCoupon {
  code: string
  discountAmount: number
}

interface PosDiscountDialogProps {
  subtotal: number
  customer: POSCustomerData | null
  usedPoints: number
  couponDiscount: number
  pointRedeemRate: number
  appliedCoupon?: AppliedCoupon | null
  onSelectCustomer: (customer: POSCustomerData | null) => void
  onChangeUsedPoints: (points: number) => void
  onChangeCouponDiscount: (amount: number) => void
  onApplyCoupon?: (coupon: AppliedCoupon | null) => void
}

export function PosDiscountDialog({
  subtotal,
  customer,
  usedPoints,
  couponDiscount,
  pointRedeemRate = 1,
  appliedCoupon = null,
  onSelectCustomer,
  onChangeUsedPoints,
  onChangeCouponDiscount,
  onApplyCoupon,
}: PosDiscountDialogProps) {
  const { selectedStoreId, selectedStoreSlug } = useStoreFilter()
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<'search' | 'create'>('search')
  const [searchInput, setSearchInput] = useState('')
  const [couponCode, setCouponCode] = useState('')

  const {
    register,
    handleSubmit,
    reset: resetCreateForm,
    formState: { errors },
  } = useForm<CreateCustomerInput>({
    resolver: zodResolver(createCustomerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
    },
  })

  const searchCustomerMutation = useSearchCustomer()
  const createCustomerMutation = useCreateCustomer()
  const validateCouponMutation = useValidateCoupon()

  const customerPoints = customer?.points ?? 0
  const maxUsablePoints = customer
    ? Math.min(
        customerPoints,
        Math.floor(subtotal / (pointRedeemRate > 0 ? pointRedeemRate : 1)),
      )
    : 0

  const pointsDiscount = usedPoints * pointRedeemRate
  const activeCouponDiscount = appliedCoupon?.discountAmount ?? couponDiscount
  const totalDiscount = pointsDiscount + activeCouponDiscount

  const handleSearchMember = () => {
    if (!searchInput.trim()) {
      toast.error('กรุณากรอกเบอร์โทรศัพท์ อีเมล หรือ รหัสสมาชิก')
      return
    }

    if (!selectedStoreId) {
      toast.error('ไม่พบรหัสร้านค้า')
      return
    }

    searchCustomerMutation.mutate(
      { storeId: selectedStoreId, query: searchInput },
      {
        onSuccess: (data) => {
          if (data.success && data.data) {
            onSelectCustomer({
              ...data.data,
            })
          }
        },
      },
    )
  }

  const handleCreateMember = (data: CreateCustomerInput) => {
    if (!selectedStoreId) {
      toast.error('ไม่พบรหัสร้านค้า')
      return
    }

    createCustomerMutation.mutate(
      {
        storeId: selectedStoreId,
        firstName: data.firstName.trim(),
        lastName: data.lastName?.trim() || undefined,
        phone: data.phone.trim(),
        email: data.email?.trim() || undefined,
      },
      {
        onSuccess: (res) => {
          if (res.success && res.data) {
            onSelectCustomer({
              ...res.data,
            })
            resetCreateForm()
            setMode('search')
          }
        },
      },
    )
  }

  const handleRemoveCustomer = () => {
    onSelectCustomer(null)
    onChangeUsedPoints(0)
    setSearchInput('')
  }

  const handlePointsChange = (value: number[]) => {
    const val = Math.max(0, Math.min(value[0], maxUsablePoints))
    onChangeUsedPoints(val)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.max(0, Math.min(Number(e.target.value), maxUsablePoints))
    onChangeUsedPoints(val)
  }

  const handleApplyCouponCode = () => {
    if (!couponCode.trim()) {
      return
    }

    validateCouponMutation.mutate(
      {
        storeSlug: selectedStoreSlug,
        code: couponCode.trim(),
        subtotal,
      },
      {
        onSuccess: (res) => {
          if (res.success && res.data) {
            if (onApplyCoupon) {
              onApplyCoupon({
                code: res.data.code,
                discountAmount: res.data.discountAmount,
              })
            } else {
              onChangeCouponDiscount(res.data.discountAmount)
            }
            setCouponCode('')
          }
        },
      },
    )
  }

  const handleRemoveCoupon = () => {
    if (onApplyCoupon) {
      onApplyCoupon(null)
    }
    onChangeCouponDiscount(0)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" className="dark w-full gap-2">
          <IconTicket />
          เพิ่มลูกค้า/เพิ่มส่วนลด
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
            <div className="flex flex-wrap items-center justify-between">
              <Label className="flex items-center gap-1.5 text-sm font-semibold">
                <IconUserPlus className="text-primary size-4" />
                สมาชิกสะสมแต้ม
              </Label>
              {!customer && (
                <div className="bg-muted flex rounded-lg p-0.5 text-xs">
                  <button
                    type="button"
                    onClick={() => setMode('search')}
                    className={`rounded-md px-2.5 py-1 font-medium transition-all ${
                      mode === 'search'
                        ? 'bg-background text-foreground shadow-xs'
                        : 'text-muted-foreground'
                    }`}
                  >
                    ค้นหา
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('create')}
                    className={`rounded-md px-2.5 py-1 font-medium transition-all ${
                      mode === 'create'
                        ? 'bg-background text-foreground shadow-xs'
                        : 'text-muted-foreground'
                    }`}
                  >
                    + สมัครใหม่
                  </button>
                </div>
              )}
            </div>
            {customer ? (
              <div className="from-primary/10 via-primary/2 to-background border-primary/20 flex items-center justify-between gap-3 rounded-xl border bg-linear-to-br p-3.5 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/15 text-primary flex size-9 shrink-0 items-center justify-center rounded-full">
                    <IconUserCheck className="size-5" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-foreground text-sm leading-none font-bold">
                      {customer.name}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      รหัสลูกค้า: {customer.id} <br />
                      อีเมล: {customer.email} <br />
                      เบอร์โทรศัพท์: {formatPromptPay(customer.phone)} <br />
                      แต้มคงเหลือ: {formatNumber(customer?.points ?? 0)} แต้ม
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleRemoveCustomer}
                  className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 size-8 shrink-0"
                >
                  <IconX className="size-4" />
                </Button>
              </div>
            ) : mode === 'search' ? (
              <div className="flex gap-2">
                <Input
                  placeholder="ค้นหาด้วย เบอร์โทร / อีเมล / รหัสสมาชิก..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchMember()}
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
            ) : (
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
                      <p className="text-destructive text-[10px]">
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
                  </div>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label className="text-xs">
                      เบอร์โทรศัพท์ <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      placeholder="0812345678"
                      className="h-9 text-xs"
                      {...register('phone')}
                    />
                    {errors.phone && (
                      <p className="text-destructive text-[10px]">
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
            )}
          </div>
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
              onValueChange={handlePointsChange}
              disabled={!customer || maxUsablePoints === 0}
              className="cursor-pointer"
            />
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={usedPoints}
                onChange={handleInputChange}
                disabled={!customer || maxUsablePoints === 0}
                className="w-24 text-center font-bold"
              />
              <span className="text-muted-foreground text-sm">
                แลกเป็นส่วนลดได้{' '}
                <strong className="text-foreground">
                  {formatCurrency(pointsDiscount)}
                </strong>
              </span>
            </div>
            {customer && (
              <p className="text-muted-foreground text-xs">
                คุณมีแต้มสะสม {formatNumber(customerPoints)} แต้ม (1 แต้ม ={' '}
                {formatCurrency(pointRedeemRate)})
              </p>
            )}
          </div>
          <Separator />
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <IconDiscount2 className="text-muted-foreground size-4" />
              รหัสส่วนลด
            </Label>
            {appliedCoupon ? (
              <div className="border-primary/20 bg-primary/5 flex items-center justify-between rounded-md border px-3 py-2">
                <span className="text-sm font-medium">
                  {appliedCoupon.code}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-primary text-sm font-semibold">
                    -{formatCurrency(appliedCoupon.discountAmount)}
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
                  value={couponCode}
                  className="uppercase"
                  onChange={(e) => setCouponCode(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === 'Enter' && handleApplyCouponCode()
                  }
                />
                <Button
                  variant="outline"
                  onClick={handleApplyCouponCode}
                  disabled={
                    !couponCode.trim() || validateCouponMutation.isPending
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
              value={`-${formatCurrency(pointsDiscount)}`}
            />
            <SummaryRow
              label="ส่วนลดจากรหัส"
              value={`-${formatCurrency(activeCouponDiscount)}`}
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
