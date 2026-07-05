'use client'

import { useState } from 'react'
import { useFormContext } from 'react-hook-form'
import toast from 'react-hot-toast'

import { useProductOptions } from '@/actions/hooks/product'
import { getProductById } from '@/actions/product'
import { PRODUCT_METADATA_MASTER } from '@/constants/sites/metadata'
import { FIELD_LABELS } from '@/constants/system'
import { DiscountType } from '@/generated/prisma/enums'
import { ProductFormValues } from '@/zod/product'
import { IconArrowDown } from '@tabler/icons-react'
import { Check, ChevronsUpDown } from 'lucide-react'

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

import { cn } from '@/lib/utils'

type ProductPreview = Awaited<ReturnType<typeof getProductById>>

export function CopyProductDataPicker({ storeId }: { storeId: string }) {
  const [open, setOpen] = useState(false)
  const [popoverOpen, setPopoverOpen] = useState(false)
  const { setValue, getValues } = useFormContext<ProductFormValues>()
  const [previewData, setPreviewData] = useState<ProductPreview>(null)
  const [sourceId, setSourceId] = useState<string>('')

  const [selectedFields, setSelectedFields] = useState<string[]>([])
  const [selectedMetadataKeys, setSelectedMetadataKeys] = useState<string[]>([])

  const { data: options = [] } = useProductOptions(storeId)

  const groupedOptions = options.reduce(
    (acc, item) => {
      const category = item.category?.title || 'ไม่มีหมวดหมู่'
      if (!acc[category]) {
        acc[category] = []
      }
      acc[category].push(item)
      return acc
    },
    {} as Record<string, typeof options>,
  )

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

    if (selectedFields.includes('metadata') && previewData.details) {
      const currentMetadata = getValues('metadata') || []

      const newItems = Object.entries(previewData.details)
        .filter(([key]) => selectedMetadataKeys.includes(key))
        .map(([key, value]) => ({ key, value: String(value) }))

      const metaMap = new Map(
        currentMetadata.map((item) => [item.key, item.value]),
      )

      newItems.forEach((item) => metaMap.set(item.key, item.value))

      const mergedMeta = Array.from(metaMap, ([key, value]) => ({ key, value }))

      setValue('metadata', mergedMeta, { shouldDirty: true })
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
        <Button size="sm" variant="outline">
          <IconArrowDown className="mr-2 size-4" /> คัดลอกข้อมูลสินค้า
        </Button>
      </DialogTrigger>
      <DialogContent className="flex min-h-96 flex-col">
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
                {Object.entries(groupedOptions).map(([category, items]) => (
                  <CommandGroup key={category} heading={category}>
                    {items.map((p) => (
                      <CommandItem
                        key={p.id}
                        value={p.title}
                        onSelect={async () => {
                          setSourceId(p.id)
                          setPreviewData(await getProductById(p.id))
                          setPopoverOpen(false)
                        }}
                      >
                        <Check
                          className={cn(
                            'mr-2 size-4',
                            sourceId === p.id ? 'opacity-100' : 'opacity-0',
                          )}
                        />
                        {p.title}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                ))}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {previewData && (
          <div className="grid gap-3 py-4">
            {['basic', 'metadata', 'variants', 'addons', 'tags'].map(
              (field) => (
                <div key={field}>
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

                  {field === 'metadata' &&
                    selectedFields.includes('metadata') &&
                    previewData.details && (
                      <div className="mt-2 ml-8 grid gap-1 border-l pl-3">
                        {Object.keys(previewData.details).map((key) => {
                          const label =
                            PRODUCT_METADATA_MASTER.flatMap(
                              (g) => g.fields,
                            ).find((f) => f.key === key)?.label || key

                          return (
                            <label
                              key={key}
                              className="flex cursor-pointer items-center gap-2 text-xs"
                            >
                              <Checkbox
                                checked={selectedMetadataKeys.includes(key)}
                                onCheckedChange={(checked) => {
                                  setSelectedMetadataKeys((prev) =>
                                    checked
                                      ? [...prev, key]
                                      : prev.filter((k) => k !== key),
                                  )
                                }}
                              />
                              {label}
                            </label>
                          )
                        })}
                      </div>
                    )}
                </div>
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
