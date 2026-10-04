'use client'

import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

import { useReturnResellerStock } from '@/actions/reseller/reseller/hooks'
import { ALL_BRANCHES, useBranchFilter } from '@/stores/use-branch-filter'
import { Loader2 } from 'lucide-react'

import { BranchSelectField } from '@/components/form/BranchSelectField'
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
  const { selectedBranchId } = useBranchFilter()
  const { mutate: returnStock, isPending } = useReturnResellerStock()

  const remainingQuantity = stock
    ? stock.allocatedQuantity - stock.soldQuantity
    : 0

  const isBranchSelected = selectedBranchId !== ALL_BRANCHES
  const isQuantityValid = quantity > 0 && quantity <= remainingQuantity
  const canSubmit =
    isBranchSelected && isQuantityValid && !isPending && Boolean(stock)

  useEffect(() => {
    if (open) {
      setQuantity(1)
    }
  }, [open])

  const handleReturn = () => {
    if (!stock) {
      return
    }

    if (selectedBranchId === ALL_BRANCHES) {
      toast.error('กรุณาเลือกสาขาปลายทางที่ต้องการนำสต็อกกลับเข้า')
      return
    }

    if (quantity <= 0) {
      toast.error('จำนวนที่ส่งคืนต้องมากกว่า 0 ชิ้น')
      return
    }

    if (quantity > remainingQuantity) {
      toast.error(`ไม่สามารถส่งคืนเกินจำนวนคงเหลือ (${remainingQuantity} ชิ้น)`)
      return
    }

    returnStock(
      {
        agreementId: stock.agreementId,
        variantId: stock.variantId,
        quantity: Number(quantity),
        targetBranchId: selectedBranchId,
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
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>ส่งคืนสินค้า / คืนสต็อกให้ร้านค้า</DialogTitle>
          <DialogDescription>
            ดึงสต็อกสินค้าฝากขายกลับเข้าสู่คลังสินค้าของสาขาที่เลือก
          </DialogDescription>
        </DialogHeader>
        {stock && (
          <div className="space-y-4 py-2">
            <div className="bg-muted/50 min-w-0 space-y-1.5 rounded-lg border p-3 text-sm">
              <p className="text-foreground leading-relaxed font-medium break-all whitespace-pre-line">
                {stock.variant?.product?.title || '-'}
              </p>
              <p className="text-muted-foreground text-xs leading-relaxed break-all whitespace-pre-line">
                ตัวเลือก: {stock.variant?.title || '-'}
              </p>
              <div className="text-muted-foreground flex justify-between border-t pt-2 text-xs">
                <span>จำนวนที่สามารถส่งคืนได้:</span>
                <span className="text-foreground font-bold">
                  {remainingQuantity} ชิ้น
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <Label>
                สาขาที่รับคืนเข้าคลัง{' '}
                <span className="text-destructive">*</span>
              </Label>
              <BranchSelectField />
              {!isBranchSelected && (
                <p className="text-destructive text-[0.8rem]">
                  * กรุณาเลือกสาขาปลายทางก่อนทำรายการ
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity">จำนวนที่ต้องการส่งคืน (ชิ้น)</Label>
              <Input
                id="quantity"
                type="number"
                min={1}
                max={remainingQuantity}
                value={quantity}
                disabled={!isBranchSelected || isPending}
                onChange={(e) => setQuantity(Number(e.target.value))}
                placeholder="ระบุจำนวน"
              />
              <p className="text-muted-foreground text-[0.8rem]">
                *
                สต็อกจะถูกตัดออกจากตัวแทนและนำกลับเข้าคลังสินค้าของสาขาที่เลือกทันที
              </p>
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
          <Button onClick={handleReturn} disabled={!canSubmit}>
            {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
            ยืนยันการคืนสต็อก
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
