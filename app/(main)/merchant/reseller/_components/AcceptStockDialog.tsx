'use client'

import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export interface AcceptStockPayload {
  agreementId: string
  variantId: string
  quantity: number
}

interface AcceptStockDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  stock: {
    agreementId: string
    variantId: string
    allocatedQuantity: number
    acceptedQuantity: number
    variant?: {
      title?: string
      product?: { title?: string }
    }
  } | null
  onConfirm: (data: {
    agreementId: string
    variantId: string
    quantity: number
  }) => Promise<void> | void
  isLoading?: boolean
}

export function AcceptStockDialog({
  open,
  onOpenChange,
  stock,
  onConfirm,
  isLoading = false,
}: AcceptStockDialogProps) {
  const pendingQuantity = stock
    ? stock.allocatedQuantity - stock.acceptedQuantity
    : 0

  const [quantity, setQuantity] = useState<number>(pendingQuantity)

  useEffect(() => {
    if (stock) {
      setQuantity(stock.allocatedQuantity - stock.acceptedQuantity)
    }
  }, [stock])

  if (!stock) {
    return null
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (quantity <= 0 || quantity > pendingQuantity) {
      return
    }

    onConfirm({
      agreementId: stock.agreementId,
      variantId: stock.variantId,
      quantity,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-106.25">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>ยืนยันการรับสินค้าเข้าสต็อก</DialogTitle>
            <DialogDescription>
              ตรวจสอบจำนวนสินค้าจริง แล้วระบุจำนวนที่ต้องการรับเข้าสต็อก
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-1">
              <p className="text-sm font-medium">
                {stock.variant?.product?.title || '-'}
              </p>
              <p className="text-muted-foreground text-xs">
                ตัวเลือก: {stock.variant?.title || '-'}
              </p>
            </div>
            <div className="bg-muted/50 space-y-1 rounded-lg border p-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">จำนวนที่ส่งมา:</span>
                <span className="font-medium">
                  {stock.allocatedQuantity} ชิ้น
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">รับเข้าแล้ว:</span>
                <span className="font-medium">
                  {stock.acceptedQuantity} ชิ้น
                </span>
              </div>
              <div className="mt-1 flex justify-between border-t pt-1">
                <span className="font-medium">คงเหลือรอยืนยันรับ:</span>
                <span className="font-medium text-blue-600 dark:text-blue-400">
                  {pendingQuantity} ชิ้น
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity">จำนวนที่ตรวจรับถูกต้อง (ชิ้น)</Label>
              <Input
                id="quantity"
                type="number"
                min={1}
                max={pendingQuantity}
                value={quantity || ''}
                onChange={(e) => setQuantity(Number(e.target.value))}
                placeholder="ระบุจำนวน"
                required
              />
              <p className="text-muted-foreground text-[0.8rem]">
                * ระบบจะบันทึกวันที่รับสินค้าทันทีเมื่อยืนยันรายการ
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              ยกเลิก
            </Button>
            <Button
              type="submit"
              disabled={
                isLoading || quantity <= 0 || quantity > pendingQuantity
              }
            >
              {isLoading ? 'กำลังบันทึก...' : 'ยืนยันรับสินค้า'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
