'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'

import { applyGlobalRatesToStore } from '@/actions/global-shipping-rate-matrix'
import { PROVINCES_POOL } from '@/constants/shipping'
import { useStoreFilter } from '@/stores/use-store-filter'
import { IconCloudDownload, IconLoader2 } from '@tabler/icons-react'

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
import { Field, FieldLabel } from '@/components/ui/field'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function ApplyGlobalRatesDialog() {
  const [open, setOpen] = useState(false)
  const [selectedProvince, setSelectedProvince] = useState<string>('')
  const [isApplying, setIsApplying] = useState(false)

  const { selectedStoreId } = useStoreFilter()

  const handleApply = async () => {
    if (!selectedProvince || !selectedStoreId) {
      return
    }

    setIsApplying(true)
    try {
      await applyGlobalRatesToStore(selectedStoreId, selectedProvince)
      toast.success(
        `อัพเดตเรทจัดส่งจากจังหวัด ${selectedProvince} เรียบร้อยแล้ว`,
      )
      setOpen(false)
      setSelectedProvince('')
    } catch (err) {
      toast.error('เกิดข้อผิดพลาดในการอัพเดตเรทจัดส่ง')
      console.error(err)
    } finally {
      setIsApplying(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) setSelectedProvince('')
        setOpen(v)
      }}
    >
      <DialogTrigger asChild>
        <Button type="button" variant="outline">
          <IconCloudDownload size={16} />
          นำเรทจัดส่งมาใช้กับร้านนี้
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>เลือกจังหวัดต้นทางของร้านค้า</DialogTitle>
          <DialogDescription>
            ระบบจะดึงเรทค่าจัดส่งจาก Master Data
            และนำมาตั้งค่าให้กับร้านค้านี้โดยอัตโนมัติ
          </DialogDescription>
        </DialogHeader>

        <Field>
          <FieldLabel>จังหวัดต้นทาง</FieldLabel>
          <Select value={selectedProvince} onValueChange={setSelectedProvince}>
            <SelectTrigger>
              <SelectValue placeholder="เลือกจังหวัด..." />
            </SelectTrigger>
            <SelectContent>
              {PROVINCES_POOL.map((province) => (
                <SelectItem key={province} value={province}>
                  {province}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <DialogFooter>
          <Button
            type="button"
            disabled={!selectedProvince || isApplying}
            onClick={handleApply}
          >
            {isApplying ? (
              <>
                <IconLoader2 size={14} className="animate-spin" />
                กำลังอัพเดต...
              </>
            ) : (
              <>
                <IconCloudDownload size={14} />
                นำเรทนี้ไปใช้กับร้านค้า
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
