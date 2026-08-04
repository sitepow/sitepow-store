'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'

import { useCreateCustomer, useSearchCustomer } from '@/actions/hooks/customer'
import { useValidateCoupon } from '@/actions/hooks/storefront/discount'
import { SummaryRow } from '@/app/sites/[domain]/_components/cart/_components/SummaryRow'
import { SummaryTotal } from '@/app/sites/[domain]/_components/cart/_components/SummaryTotal'
import { useStoreFilter } from '@/stores/use-store-filter'
import { formatCurrency, formatNumber } from '@/utils/pricing'
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

export interface CustomerMember {
  id: string
  name: string
  phone: string
  points: number
}

export interface AppliedCoupon {
  code: string
  discountAmount: number
}

interface PosDiscountDialogProps {
  subtotal: number
  customer: CustomerMember | null
  usedPoints: number
  couponDiscount: number
  pointRedeemRate: number
  appliedCoupon?: AppliedCoupon | null
  onSelectCustomer: (customer: CustomerMember | null) => void
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

  const [newFirstName, setNewFirstName] = useState('')
  const [newLastName, setNewLastName] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [newEmail, setNewEmail] = useState('')

  const [couponCode, setCouponCode] = useState('')

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
          onSelectCustomer({
            id: data.id,
            name: data.name,
            phone: data.phone,
            points: data.points,
          })
        },
      },
    )
  }

  const handleCreateMember = () => {
    if (!newFirstName.trim() || !newPhone.trim()) {
      toast.error('กรุณากรอกชื่อ และ เบอร์โทรศัพท์')
      return
    }

    if (!selectedStoreId) {
      toast.error('ไม่พบรหัสร้านค้า')
      return
    }

    createCustomerMutation.mutate(
      {
        storeId: selectedStoreId,
        firstName: newFirstName.trim(),
        lastName: newLastName.trim(),
        phone: newPhone.trim(),
        email: newEmail.trim() || undefined,
      },
      {
        onSuccess: (data) => {
          onSelectCustomer({
            id: data.id,
            name: data.name,
            phone: data.phone,
            points: data.points,
          })
          setNewFirstName('')
          setNewLastName('')
          setNewPhone('')
          setNewEmail('')
          setMode('search')
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
    if (!couponCode.trim()) return

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
              <div className="flex items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-600">
                    <IconUserCheck className="size-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">{customer.name}</p>
                    <p className="text-muted-foreground text-xs">
                      เบอร์: {customer.phone} | แต้มคงเหลือ:{' '}
                      <span className="font-semibold text-emerald-600">
                        {formatNumber(customer.points)}
                      </span>{' '}
                      แต้ม
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleRemoveCustomer}
                  className="text-muted-foreground hover:text-destructive size-8"
                >
                  <IconX className="size-4" />
                </Button>
              </div>
            ) : mode === 'search' ? (
              <div className="flex gap-2">
                <Input
                  placeholder="เบอร์โทร / อีเมล / ID สมาชิก..."
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
              <div className="bg-muted/30 space-y-3 rounded-xl border p-3.5">
                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label className="text-xs">
                      ชื่อ <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      placeholder="สมชาย"
                      value={newFirstName}
                      onChange={(e) => setNewFirstName(e.target.value)}
                      className="h-9 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">นามสกุล</Label>
                    <Input
                      placeholder="ใจดี"
                      value={newLastName}
                      onChange={(e) => setNewLastName(e.target.value)}
                      className="h-9 text-xs"
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
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      className="h-9 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">อีเมล (ถ้ามี)</Label>
                    <Input
                      type="email"
                      placeholder="customer@example.com"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className="h-9 text-xs"
                    />
                  </div>
                </div>
                <Button
                  type="button"
                  onClick={handleCreateMember}
                  disabled={createCustomerMutation.isPending}
                  className="w-full gap-1.5 font-semibold"
                  size="sm"
                >
                  <IconPlus className="size-4" />
                  {createCustomerMutation.isPending
                    ? 'กำลังบันทึก...'
                    : 'ลงทะเบียนสมาชิกใหม่'}
                </Button>
              </div>
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
