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
import { ChevronsUpDown } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

type ProductPreview = Awaited<ReturnType<typeof getProductById>>

export function CopyProductDataPicker({ storeId }: { storeId: string }) {
  const [open, setOpen] = useState(false)
  const [popoverOpen, setPopoverOpen] = useState(false)
  const { setValue } = useFormContext<ProductFormValues>()
  const [previewData, setPreviewData] = useState<ProductPreview>(null)
  const [sourceId, setSourceId] = useState<string>('')

  const [selectedFields, setSelectedFields] = useState<string[]>([])

  const { data: options = [] } = useProductOptions(storeId)

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen)
  }

  const handleCopy = async () => {
    if (!previewData) {
      return
    }

    if (selectedFields.includes('basic')) {
      setValue('title', previewData.title, {
        shouldDirty: true,
      })
      setValue('slug', `${previewData.slug}-copy`, {
        shouldDirty: true,
      })
      setValue('categoryId', previewData.categoryId, {
        shouldDirty: true,
      })
    }

    if (selectedFields.includes('metadata')) {
      const m = Object.entries(previewData.details || {}).map(
        ([key, value]) => ({ key, value: String(value) }),
      )
      setValue('metadata', m, { shouldDirty: true })
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
        { shouldDirty: true },
      )
    }

    if (selectedFields.includes('addons')) {
      setValue('addons', previewData.addons, {
        shouldDirty: true,
      })
    }

    if (selectedFields.includes('tags')) {
      setValue('tags', previewData.tags.map((t) => t.name).join(', '), {
        shouldDirty: true,
      })
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
          <DialogTitle>คัดลอกข้อมูลสินค้าจาก</DialogTitle>
        </DialogHeader>

        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="lg"
              className="w-full justify-between wrap-break-word whitespace-pre-line"
            >
              {sourceId
                ? options.find((p) => p.id === sourceId)?.title
                : 'ค้นหาสินค้าต้นแบบ...'}
              <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="max-w-100 p-0">
            <Command>
              <CommandInput placeholder="พิมพ์ชื่อสินค้าเพื่อค้นหา..." />
              <CommandList>
                <CommandEmpty>ไม่พบสินค้า</CommandEmpty>
                <CommandGroup>
                  {options.map((p) => (
                    <CommandItem
                      key={p.id}
                      value={p.title}
                      onSelect={async () => {
                        setSourceId(p.id)
                        setPreviewData(await getProductById(p.id))
                        setPopoverOpen(false)
                      }}
                    >
                      {p.title}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

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
                    [คัดลอก] {FIELD_LABELS[field] || field}
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
