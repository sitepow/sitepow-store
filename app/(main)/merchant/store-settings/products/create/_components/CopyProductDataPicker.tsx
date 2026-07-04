'use client'

import { useState } from 'react'
import { useFormContext } from 'react-hook-form'
import toast from 'react-hot-toast'

import { useProductOptions } from '@/actions/hooks/product'
import { getProductById } from '@/actions/product'
import { FIELD_LABELS } from '@/constants/system'
import { DiscountType } from '@/generated/prisma/enums'
import { ProductFormValues } from '@/zod/product'
import { IconCloudDownload } from '@tabler/icons-react'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type ProductPreview = Awaited<ReturnType<typeof getProductById>>

export function CopyProductDataPicker({ storeId }: { storeId: string }) {
  // ... (โค้ดส่วนที่เหลือของคุณเหมือนเดิม)
  const [open, setOpen] = useState(false)
  const { setValue } = useFormContext<ProductFormValues>()
  const [previewData, setPreviewData] = useState<ProductPreview>(null)
  const [sourceId, setSourceId] = useState<string>('')

  const [selectedFields, setSelectedFields] = useState<string[]>([])

  const { data: options = [] } = useProductOptions(storeId)

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen)
  }

  const handleCopy = async () => {
    if (!previewData) return

    if (selectedFields.includes('basic')) {
      setValue('title', previewData.title)
      setValue('slug', `${previewData.slug}-copy`)
      setValue('categoryId', previewData.categoryId)
    }

    if (selectedFields.includes('metadata')) {
      const m = Object.entries(previewData.details || {}).map(
        ([key, value]) => ({ key, value: String(value) }),
      )
      setValue('metadata', m)
    }

    if (selectedFields.includes('variants') && previewData?.variants) {
      setValue(
        'variants',
        previewData.variants.map((v) => ({
          title: v.title,
          price: Number(v.price),
          sku: v.sku || '',
          stocks: v.stocks.map((s) => ({
            branchId: s.branchId,
            quantity: s.quantity,
            minStock: s.minStock,
          })),
          discount: {
            active: v.discountActive,
            type: v.discountType as DiscountType,
            amount: Number(v.discountAmount || 0),
          },
          rewardPoints: {
            isActive: v.pointsActive,
            amount: v.pointsAmount,
          },
        })),
      )
    }

    if (selectedFields.includes('addons')) {
      setValue('addons', previewData.addons)
    }

    if (selectedFields.includes('tags')) {
      setValue('tags', previewData.tags.map((t) => t.name).join(', '))
    }

    toast.success('คัดลอกข้อมูลที่เลือกเรียบร้อย')
    setOpen(false)
  }

  const toggleField = (field: string) => {
    setSelectedFields((prev) =>
      prev.includes(field) ? prev.filter((f) => f !== field) : [...prev, field],
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm">
          <IconCloudDownload className="mr-2 size-4" /> คัดลอกข้อมูลสินค้า
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>คัดลอกข้อมูลสินค้า</DialogTitle>
        </DialogHeader>

        <Select
          value={sourceId}
          onValueChange={async (id) => {
            setSourceId(id)
            setPreviewData(await getProductById(id))
          }}
        >
          <SelectTrigger className="w-full text-start whitespace-normal">
            <SelectValue placeholder="เลือกสินค้าต้นแบบ" />
          </SelectTrigger>
          <SelectContent>
            {options.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {previewData && (
          <div className="grid gap-3 py-4">
            {['basic', 'metadata', 'variants', 'addons', 'tags'].map(
              (field) => (
                <label
                  key={field}
                  className="hover:bg-muted/50 flex cursor-pointer items-center gap-2 rounded-md p-2 transition-colors"
                >
                  <Checkbox
                    checked={selectedFields.includes(field)}
                    onCheckedChange={() => toggleField(field)}
                  />
                  <span className="text-sm font-medium">
                    {FIELD_LABELS[field] || field}
                  </span>
                </label>
              ),
            )}
          </div>
        )}

        <Button onClick={handleCopy} disabled={selectedFields.length === 0}>
          ยืนยันการคัดลอก
        </Button>
      </DialogContent>
    </Dialog>
  )
}
