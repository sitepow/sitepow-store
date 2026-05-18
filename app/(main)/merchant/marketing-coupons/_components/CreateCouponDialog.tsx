'use client'

import React, { useState } from 'react'

import { IconLoader2, IconPlus, IconTicket } from '@tabler/icons-react'

import { Button } from '@/components/ui/button'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { Coupon, DiscountType } from '../page'

interface CreateCouponDialogProps {
  selectedStoreId: string
  currentStoreBranches: Array<{ id: string; name: string }>
  onCouponCreated: (coupon: Coupon) => void
}

export function CreateCouponDialog({
  selectedStoreId,
  currentStoreBranches,
  onCouponCreated,
}: CreateCouponDialogProps) {
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

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault()
    if (!code || !discountAmount) {
      return
    }

    setIsSubmitting(true)

    setTimeout(() => {
      const generatedId = `cp_${Math.random().toString(36).substring(2, 11)}`

      const newCoupon: Coupon = {
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

      onCouponCreated(newCoupon)

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
    <Dialog
      open={isDialogOpen}
      onOpenChange={(open) => !isSubmitting && setIsDialogOpen(open)}
    >
      <DialogTrigger asChild>
        <Button className="w-fit">
          <IconPlus />
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
        <form onSubmit={handleCreateCoupon} className="space-y-4 pt-3 text-xs">
          <div className="space-y-1.5">
            <Label htmlFor="cp-code" className="text-foreground font-medium">
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
            <Label htmlFor="cp-desc" className="text-foreground font-medium">
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
                onValueChange={(val) => setDiscountType(val as DiscountType)}
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
                  discountType === 'FIXED_AMOUNT' ? 'เช่น 50' : 'เช่น 10'
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
                  <SelectItem value="all">ใช้งานได้ทุกสาขาในร้านนี้</SelectItem>
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
                  <IconLoader2 size={14} className="mr-1 animate-spin" />
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
  )
}
