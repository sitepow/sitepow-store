'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'

import { useReturnResellerStock } from '@/actions/hooks/reseller'
import { Loader2 } from 'lucide-react'

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

interface ReturnStockDialogProps {
  stock: any | null
  open: boolean
  setOpen: (open: boolean) => void
}

export function ReturnStockDialog({
  stock,
  open,
  setOpen,
}: ReturnStockDialogProps) {
  const [quantity, setQuantity] = useState<number>(1)
  const { mutate: returnStock, isPending } = useReturnResellerStock()

  const remainingQuantity = stock
    ? stock.allocatedQuantity - stock.soldQuantity
    : 0

  const handleReturn = () => {
    if (!stock) return

    if (quantity <= 0) {
      toast.error('จำนวนที่คืนต้องมากกว่า 0')
      return
    }

    if (quantity > remainingQuantity) {
      toast.error(`ไม่สามารถคืนเกินจำนวนคงเหลือ (${remainingQuantity} ชิ้น)`)
      return
    }

    returnStock(
      {
        agreementId: stock.agreementId,
        variantId: stock.variantId,
        quantity: Number(quantity),
      },
      {
        onSuccess: (res) => {
          if (res.success) {
            setOpen(false)
            setQuantity(1)
          }
        },
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-width-[425px]">
        <DialogHeader>
          <DialogTitle>คืนสต็อกเข้าคลังหลัก</DialogTitle>
          <DialogDescription>
            ดึงสต็อกฝากขายของตัวแทนกลับเข้าสู่ระบบคลังสินค้าหลักของร้านค้า
          </DialogDescription>
        </DialogHeader>
        {stock && (
          <div className="space-y-4 py-2">
            <div className="bg-muted/50 space-y-1 rounded-lg border p-3 text-sm">
              <p className="text-foreground font-medium">
                {stock.variant?.product?.title || '-'}
              </p>
              <p className="text-muted-foreground">
                ตัวเลือก: {stock.variant?.title || '-'}
              </p>
              <div className="text-muted-foreground flex justify-between border-t pt-2 text-xs">
                <span>คงเหลือที่ตัวแทน:</span>
                <span className="text-foreground font-bold">
                  {remainingQuantity} ชิ้น
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity">จำนวนที่ต้องการรับคืน</Label>
              <Input
                id="quantity"
                type="number"
                min={1}
                max={remainingQuantity}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                placeholder="ระบุจำนวน"
              />
            </div>
          </div>
        )}
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isPending}
          >
            ยกเลิก
          </Button>
          <Button onClick={handleReturn} disabled={isPending || !stock}>
            {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
            ยืนยันการรับคืน
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
