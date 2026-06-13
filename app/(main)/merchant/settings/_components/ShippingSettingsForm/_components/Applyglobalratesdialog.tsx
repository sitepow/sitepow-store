'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'

import {
  useApplyGlobalRates,
  useGlobalShippingMetadata,
  useGlobalShippingRateMatrixProvinces,
} from '@/actions/hooks/global-shipping-rate-matrix'
import { useBranchFilter } from '@/stores/use-branch-filter'
import { useStoreFilter } from '@/stores/use-store-filter'
import { formatDate } from '@/utils/date'
import { IconCloudDownload } from '@tabler/icons-react'

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
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'

export function ApplyGlobalRatesDialog() {
  const [open, setOpen] = useState(false)
  const [selectedProvince, setSelectedProvince] = useState<string>('')

  const { selectedStoreId } = useStoreFilter()
  const { selectedBranchId } = useBranchFilter()

  const { mutate: applyRates, isPending: isApplying } = useApplyGlobalRates()
  const { data: provinces } = useGlobalShippingRateMatrixProvinces()
  const { data: matrixMeta } = useGlobalShippingMetadata(selectedProvince)

  const handleApply = () => {
    if (!selectedProvince || !selectedStoreId) {
      return
    }

    applyRates(
      {
        storeId: selectedStoreId,
        branchId: selectedBranchId,
        fromProvince: selectedProvince,
      },
      {
        onSuccess: () => {
          setOpen(false)
        },
        onError: (err) => {
          toast.error(err.message)
        },
      },
    )
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) {
          setSelectedProvince('')
        }
        setOpen(v)
      }}
    >
      <DialogTrigger asChild>
        <Button type="button" variant="outline">
          <IconCloudDownload />
          นำเรทจัดส่งมาใช้กับร้านนี้
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>เลือกจังหวัดต้นทางของร้านค้า</DialogTitle>
          <DialogDescription>
            ระบบจะดึงเรทค่าจัดส่งจาก Master Data
            พร้อมทั้งปรับปรุงที่อยู่ต้นทางของร้านค้า (จังหวัด/อำเภอ/ไปรษณีย์)
            ให้ตรงกับข้อมูลเรทที่เลือกโดยอัตโนมัติ
          </DialogDescription>
        </DialogHeader>

        <Field>
          <FieldLabel>จังหวัดต้นทาง</FieldLabel>
          <Select value={selectedProvince} onValueChange={setSelectedProvince}>
            <SelectTrigger>
              <SelectValue placeholder="เลือกจังหวัด..." />
            </SelectTrigger>
            <SelectContent>
              {provinces?.map((matrix) => (
                <SelectItem
                  key={matrix?.fromProvince}
                  value={matrix?.fromProvince}
                >
                  {matrix?.fromProvince}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedProvince && (
            <FieldDescription>
              อัพเดตฐานข้อมูลวันที่:{' '}
              {matrixMeta?.updatedAt ? formatDate(matrixMeta?.updatedAt) : '-'}
            </FieldDescription>
          )}
        </Field>

        <DialogFooter>
          <Button
            type="button"
            disabled={!selectedProvince || isApplying}
            onClick={handleApply}
          >
            {isApplying ? (
              <>
                <Spinner />
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
