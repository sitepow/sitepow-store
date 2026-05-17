'use client'

import React, { useState } from 'react'

import {
  IconCalendar,
  IconEdit,
  IconHierarchy,
  IconInbox,
  IconInfoCircle,
  IconLoader2,
  IconPlus,
  IconTicket,
  IconTrash,
  IconUsers,
} from '@tabler/icons-react'

import { PageTabHeader } from '@/components/PageTabHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type DiscountType = 'FIXED_AMOUNT' | 'PERCENTAGE'

interface Coupon {
  id: string
  storeId: string
  code: string
  description: string | null
  discountType: DiscountType
  discountAmount: number
  minOrderAmount: number
  maxDiscount: number | null
  startDate: string
  endDate: string
  usageLimit: number | null
  usedCount: number
  branchId: string | null
}

const MOCK_BRANCHES: Record<string, Array<{ id: string; name: string }>> = {
  'store-1': [
    { id: 'br-1', name: 'สาขาสยามสแควร์' },
    { id: 'br-2', name: 'สาขาอารีย์' },
  ],
  'store-3': [{ id: 'br-3', name: 'สาขาเซ็นทรัลเวิลด์' }],
}

const MOCK_COUPONS: Coupon[] = [
  {
    id: 'cp-1',
    storeId: 'store-1',
    code: 'OPENING20',
    description: 'ส่วนลดฉลองเปิดร้านใหม่ ลด 20 บาท เมื่อไม่มีขั้นต่ำ',
    discountType: 'FIXED_AMOUNT' as DiscountType,
    discountAmount: 20,
    minOrderAmount: 0,
    maxDiscount: null,
    startDate: '2026-05-01',
    endDate: '2026-06-01',
    usageLimit: 100,
    usedCount: 45,
    branchId: null,
  },
  {
    id: 'cp-2',
    storeId: 'store-1',
    code: 'SIAMONLY10',
    description: 'ส่วนลดพิเศษ 10% เฉพาะหน้าร้านสาขาสยามเท่านั้น',
    discountType: 'PERCENTAGE' as DiscountType,
    discountAmount: 10,
    minOrderAmount: 300,
    maxDiscount: 100,
    startDate: '2026-05-10',
    endDate: '2026-05-31',
    usageLimit: 50,
    usedCount: 50,
    branchId: 'br-1',
  },
  {
    id: 'cp-3',
    storeId: 'store-3',
    code: 'ITGADGET50',
    description: 'ลดทันที 50 บาท สำหรับยอดซื้อ 1,000 บาทขึ้นไป',
    discountType: 'FIXED_AMOUNT' as DiscountType,
    discountAmount: 50,
    minOrderAmount: 1000,
    maxDiscount: null,
    startDate: '2026-05-01',
    endDate: '2026-12-31',
    usageLimit: null,
    usedCount: 12,
    branchId: null,
  },
]

export function MarketingCouponsContent() {
  const [selectedStoreId, setSelectedStoreId] = useState<string>('store-1')
  const [coupons, setCoupons] = useState(MOCK_COUPONS)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [code, setCode] = useState('')
  const [description, setDescription] = useState('')
  const [discountType, setDiscountType] = useState<DiscountType>('FIXED_AMOUNT')
  const [discountAmount, setDiscountAmount] = useState('')
  const [minOrderAmount, setMinOrderAmount] = useState('')
  const [maxDiscount, setMaxDiscount] = useState('')
  const [usageLimit, setUsageLimit] = useState('')
  const [targetBranchId, setTargetBranchId] = useState<string>('all')

  const filteredCoupons = coupons.filter(
    (coupon) => coupon.storeId === selectedStoreId,
  )
  const currentStoreBranches = MOCK_BRANCHES[selectedStoreId] || []

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault()
    if (!code || !discountAmount) return

    setIsSubmitting(true)

    setTimeout(() => {
      const generatedId = `cp_${Math.random().toString(36).substring(2, 11)}`

      const newCoupon = {
        id: generatedId,
        storeId: selectedStoreId,
        code: code.toUpperCase().replace(/\s+/g, ''),
        description: description || null,
        discountType,
        discountAmount: Number(discountAmount),
        minOrderAmount: minOrderAmount ? Number(minOrderAmount) : 0,
        maxDiscount:
          discountType === 'PERCENTAGE' && maxDiscount
            ? Number(maxDiscount)
            : null,
        startDate: new Date().toISOString().split('T')[0],
        endDate: '2026-12-31',
        usageLimit: usageLimit ? Number(usageLimit) : null,
        usedCount: 0,
        branchId: targetBranchId === 'all' ? null : targetBranchId,
      }

      setCoupons([...coupons, newCoupon])

      setCode('')
      setDescription('')
      setDiscountType('FIXED_AMOUNT')
      setDiscountAmount('')
      setMinOrderAmount('')
      setMaxDiscount('')
      setUsageLimit('')
      setTargetBranchId('all')
      setIsSubmitting(false)
      setIsDialogOpen(false)
    }, 1000)
  }

  return (
    <div className="space-y-6">
      <PageTabHeader
        icon={IconTicket}
        title="คูปองส่วนลดและการตลาด"
        description="จัดการรหัสโปรโมชัน เงื่อนไขส่วนลดท้ายบิล เพื่อนำไปจัดแคมเปญส่งเสริมการขายบนหน้า Sale Page และระบบฝั่งหน้าร้าน POS"
        endContent={
          <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-end lg:w-auto">
            <Select value={selectedStoreId} onValueChange={setSelectedStoreId}>
              <SelectTrigger className="w-full sm:w-60">
                <SelectValue placeholder="เลือกแบรนด์ร้านค้า" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="store-1">
                  เสื้อผ้าแฟชั่นสไตล์เกาหลี มินิมอล
                </SelectItem>
                <SelectItem value="store-2">
                  ร้านกาแฟหอมกรุ่น Cafe & Bakery
                </SelectItem>
                <SelectItem value="store-3">Gadget & IT Accessories</SelectItem>
              </SelectContent>
            </Select>

            <Dialog
              open={isDialogOpen}
              onOpenChange={(open) => !isSubmitting && setIsDialogOpen(open)}
            >
              <DialogTrigger asChild>
                <Button
                  variant="default"
                  className="w-full gap-1.5 px-4 text-xs font-medium sm:w-auto"
                >
                  <IconPlus size={16} />
                  สร้างคูปองใหม่
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[92vh] max-w-md overflow-y-auto p-6">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-base font-semibold">
                    <IconTicket size={20} className="text-primary" />
                    สร้างคูปองส่วนลดใหม่
                  </DialogTitle>
                  <DialogDescription className="text-xs">
                    กำหนดสิทธิประโยชน์ ข้อจำกัด และเงื่อนไขการใช้คูปองภายในระบบ
                  </DialogDescription>
                </DialogHeader>

                <form
                  onSubmit={handleCreateCoupon}
                  className="space-y-4 pt-3 text-xs"
                >
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="cp-code"
                      className="text-foreground font-medium"
                    >
                      รหัสคูปอง (Coupon Code){' '}
                      <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="cp-code"
                      placeholder="เช่น WELCOME10"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      disabled={isSubmitting}
                      required
                      className="font-mono uppercase"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label
                      htmlFor="cp-desc"
                      className="text-foreground font-medium"
                    >
                      รายละเอียด / เงื่อนไขเบื้องต้นสำหรับผู้ใช้งาน
                    </Label>
                    <Input
                      id="cp-desc"
                      placeholder="เช่น ส่วนลดลดทันทีเมื่อสั่งซื้อครบ 500 บาท"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-foreground font-medium">
                        ประเภทส่วนลด
                      </Label>
                      <Select
                        value={discountType}
                        onValueChange={(val) =>
                          setDiscountType(val as DiscountType)
                        }
                        disabled={isSubmitting}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="FIXED_AMOUNT">
                            ลดจำนวนเงิน (บาท)
                          </SelectItem>
                          <SelectItem value="PERCENTAGE">
                            ลดเป็นเปอร์เซ็นต์ (%)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-foreground font-medium">
                        มูลค่าที่ลด <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        type="number"
                        min={1}
                        placeholder={
                          discountType === 'FIXED_AMOUNT'
                            ? 'เช่น 50'
                            : 'เช่น 10'
                        }
                        value={discountAmount}
                        onChange={(e) => setDiscountAmount(e.target.value)}
                        disabled={isSubmitting}
                        required
                        className="font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-foreground font-medium">
                        ยอดสั่งซื้อขั้นต่ำ (บาท)
                      </Label>
                      <Input
                        type="number"
                        min={0}
                        placeholder="0 = ไม่มีขั้นต่ำ"
                        value={minOrderAmount}
                        onChange={(e) => setMinOrderAmount(e.target.value)}
                        disabled={isSubmitting}
                        className="font-mono"
                      />
                    </div>

                    <div className="space-y-1.5">
                      {discountType === 'PERCENTAGE' ? (
                        <>
                          <Label className="text-foreground font-medium">
                            ส่วนลดสูงสุด (บาท)
                          </Label>
                          <Input
                            type="number"
                            min={1}
                            placeholder="ว่างไว้ = ลดไม่จำกัด"
                            value={maxDiscount}
                            onChange={(e) => setMaxDiscount(e.target.value)}
                            disabled={isSubmitting}
                            className="font-mono"
                          />
                        </>
                      ) : (
                        <>
                          <Label className="text-muted-foreground font-medium">
                            ส่วนลดสูงสุด
                          </Label>
                          <div className="border-input bg-muted text-muted-foreground flex h-9 w-full items-center rounded-md border px-3 text-[11px] select-none">
                            ไม่จำเป็นสำหรับลดคงที่
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label className="text-foreground font-medium">
                        จำนวนสิทธิ์ทั้งหมด (ครั้ง)
                      </Label>
                      <Input
                        type="number"
                        min={1}
                        placeholder="ว่างไว้ = ไม่จำกัดจำนวน"
                        value={usageLimit}
                        onChange={(e) => setUsageLimit(e.target.value)}
                        disabled={isSubmitting}
                        className="font-mono"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-foreground font-medium">
                        สาขาที่เข้าร่วมแคมเปญ
                      </Label>
                      <Select
                        value={targetBranchId}
                        onValueChange={setTargetBranchId}
                        disabled={isSubmitting}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">
                            ใช้งานได้ทุกสาขาในร้านนี้
                          </SelectItem>
                          {currentStoreBranches.map((br) => (
                            <SelectItem key={br.id} value={br.id}>
                              {br.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <DialogFooter className="gap-2 pt-3 sm:gap-0">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsDialogOpen(false)}
                      disabled={isSubmitting}
                      className="text-xs"
                    >
                      ยกเลิก
                    </Button>
                    <Button
                      type="submit"
                      variant="default"
                      size="sm"
                      disabled={isSubmitting}
                      className="px-4 text-xs font-medium"
                    >
                      {isSubmitting ? (
                        <>
                          <IconLoader2
                            size={14}
                            className="mr-1 animate-spin"
                          />
                          กำลังบันทึก...
                        </>
                      ) : (
                        'อนุมัติและเปิดใช้โค้ด'
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      {filteredCoupons.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-14 text-center">
          <div className="text-muted-foreground flex h-10 w-10 items-center justify-center rounded-full border">
            <IconInbox size={20} />
          </div>
          <span className="mt-3 block text-xs font-medium">
            ยังไม่มีโปรโมชันคูปองในขณะนี้
          </span>
          <span className="text-muted-foreground mt-1 block max-w-xs px-4 text-[11px]">
            เริ่มต้นขับเคลื่อนยอดขายด้วยการคลิกปุ่มสร้างคูปองส่วนลด
          </span>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredCoupons.map((coupon) => {
            const isLimitless = coupon.usageLimit === null
            const isFull =
              !isLimitless && coupon.usedCount >= (coupon.usageLimit || 0)
            const targetBranchName = coupon.branchId
              ? currentStoreBranches.find((b) => b.id === coupon.branchId)
                  ?.name || 'เฉพาะสาขาที่เลือก'
              : 'ทุกสาขาภายในแบรนด์'

            return (
              <Card
                key={coupon.id}
                className="relative flex flex-col justify-between overflow-hidden border-solid"
              >
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-center justify-between gap-2">
                    <Badge
                      variant="default"
                      className="rounded px-2 py-0.5 font-mono text-xs font-semibold tracking-wider"
                    >
                      {coupon.code}
                    </Badge>

                    <Badge
                      variant="outline"
                      className="rounded px-2 py-0.5 text-[10px] font-medium"
                    >
                      {isFull ? 'สิทธิ์หมดแล้ว' : 'เปิดใช้งาน'}
                    </Badge>
                  </div>

                  <CardTitle className="mt-3 flex items-baseline gap-1 text-sm font-semibold">
                    {coupon.discountType === 'FIXED_AMOUNT' ? (
                      <>
                        <span className="text-primary font-mono text-xl font-bold">
                          ฿{coupon.discountAmount}
                        </span>
                        <span className="text-muted-foreground text-[11px] font-normal">
                          ส่วนลดเงินสด
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="text-primary font-mono text-xl font-bold">
                          {coupon.discountAmount}%
                        </span>
                        <span className="text-muted-foreground text-[11px] font-normal">
                          ส่วนลดเปอร์เซ็นต์{' '}
                          {coupon.maxDiscount
                            ? `(สูงสุด ฿${coupon.maxDiscount})`
                            : ''}
                        </span>
                      </>
                    )}
                  </CardTitle>

                  <CardDescription className="text-muted-foreground mt-1 line-clamp-2 min-h-8 text-[11px] leading-relaxed">
                    {coupon.description || 'ไม่มีรายละเอียดคำอธิบายคูปอง'}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-3 p-4 pt-0 text-[11px]">
                  <div className="bg-muted/40 text-muted-foreground flex items-center gap-2 rounded border p-2">
                    <IconHierarchy size={14} className="shrink-0" />
                    <span className="truncate text-[10px]">
                      สถานที่:{' '}
                      <span className="text-foreground font-medium">
                        {targetBranchName}
                      </span>
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <IconUsers size={12} /> การใช้งาน
                      </span>
                      <span className="text-foreground font-mono font-medium">
                        {coupon.usedCount}{' '}
                        <span className="text-muted-foreground font-normal">
                          {isLimitless
                            ? 'ครั้ง'
                            : `/ ${coupon.usageLimit} ครั้ง`}
                        </span>
                      </span>
                    </div>
                    {!isLimitless && (
                      <Progress
                        value={
                          (coupon.usedCount / (coupon.usageLimit || 1)) * 100
                        }
                        className="h-1"
                      />
                    )}
                  </div>

                  <div className="text-muted-foreground flex items-center gap-1.5 text-[10px]">
                    <IconCalendar size={13} />
                    <span>
                      หมดอายุ:{' '}
                      <span className="text-foreground font-mono">
                        {coupon.endDate}
                      </span>
                    </span>
                  </div>
                </CardContent>

                <CardFooter className="bg-muted/10 flex items-center justify-between border-t p-3 py-2">
                  <span className="text-muted-foreground flex items-center gap-0.5 text-[10px]">
                    <IconInfoCircle size={11} />
                    ขั้นต่ำ:{' '}
                    <span className="text-foreground font-mono font-medium">
                      ฿{coupon.minOrderAmount}
                    </span>
                  </span>

                  <div className="flex gap-0.5">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-foreground h-7 w-7 rounded"
                    >
                      <IconEdit size={14} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive h-7 w-7 rounded"
                    >
                      <IconTrash size={14} />
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
