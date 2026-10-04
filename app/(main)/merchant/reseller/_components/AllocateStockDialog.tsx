/* eslint-disable @next/next/no-img-element */
'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Controller,
  FormProvider,
  SubmitHandler,
  useForm,
} from 'react-hook-form'
import toast from 'react-hot-toast'

import { usePOSProducts } from '@/actions/sales/pos-product/hooks'
import { useAllocateResellerStock } from '@/actions/reseller/reseller/hooks'
import { useBranchFilter } from '@/stores/use-branch-filter'
import { useResellerFilter } from '@/stores/use-reseller-filter'
import { useStoreFilter } from '@/stores/use-store-filter'
import { formatCurrency, formatNumber } from '@/utils/formatting/number'
import { IconCheck, IconPackage, IconSearch, IconX } from '@tabler/icons-react'

import { BranchSelectField } from '@/components/form/BranchSelectField'
import { ProductImage } from '@/components/brand/ProductImage'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Spinner } from '@/components/ui/spinner'

import { cn } from '@/lib/utils'

interface AllocateStockFormValues {
  variantId: string
  quantity: number
}

interface AllocateStockDialogProps {
  open: boolean
  setOpen: (v: boolean) => void
}

export function AllocateStockDialog({
  open,
  setOpen,
}: AllocateStockDialogProps) {
  const { selectedStoreId } = useStoreFilter()
  const { selectedBranchId } = useBranchFilter()
  const { selectedAgreementId: agreementId } = useResellerFilter()

  const [search, setSearch] = useState('')

  const { data: products = [], isLoading: isProductsLoading } = usePOSProducts({
    storeId: selectedStoreId || '',
    branchId: selectedBranchId || '',
    search,
  })

  const allocateStockMutation = useAllocateResellerStock()

  const methods = useForm<AllocateStockFormValues>({
    defaultValues: {
      variantId: '',
      quantity: 1,
    },
  })

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = methods

  const selectedVariantId = watch('variantId')
  const inputQuantity = watch('quantity') || 0

  const getStockQuantity = useCallback(
    (variant: (typeof products)[number]['variants'][number]) => {
      if (!variant.stocks || variant.stocks.length === 0) return 0
      const targetStock = variant.stocks.find(
        (s) => s.branchId === selectedBranchId,
      )
      return targetStock ? targetStock.quantity : 0
    },
    [selectedBranchId],
  )

  const selectedVariant = useMemo(() => {
    if (!selectedVariantId) {
      return null
    }

    for (const p of products) {
      const found = p.variants?.find((v) => v.id === selectedVariantId)
      if (found) {
        return {
          ...found,
          productTitle: p.title,
          productImage: p.images?.[0]?.url,
        }
      }
    }
    return null
  }, [products, selectedVariantId])

  const maxStock = useMemo(
    () => (selectedVariant ? getStockQuantity(selectedVariant) : 0),
    [selectedVariant, getStockQuantity],
  )

  useEffect(() => {
    if (open) {
      reset({ variantId: '', quantity: 1 })
      setSearch('')
    }
  }, [open, reset])

  const handleClose = () => {
    reset()
    setOpen(false)
  }

  const onSubmit: SubmitHandler<AllocateStockFormValues> = async (values) => {
    if (!agreementId) {
      return toast.error('ไม่พบสัญญาฝากขายที่ต้องการเติมสต็อก')
    }

    if (!values.variantId) {
      return toast.error('กรุณาเลือกรายการสินค้า')
    }

    if (values.quantity > maxStock) {
      return toast.error(`จำนวนคงเหลือไม่พอ (มีคงเหลือ ${maxStock} ชิ้น)`)
    }

    allocateStockMutation.mutate(
      {
        agreementId,
        variantId: values.variantId,
        quantity: Number(values.quantity),
      },
      {
        onSuccess: (res) => {
          if (res.success) {
            handleClose()
          }
        },
      },
    )
  }

  const isPending = allocateStockMutation.isPending

  return (
    <Dialog open={open} onOpenChange={(v) => (!v ? handleClose() : setOpen(v))}>
      <DialogContent className="max-h-[85vh] gap-4 overflow-y-auto sm:max-w-lg">
        <FormProvider {...methods}>
          <DialogHeader>
            <DialogTitle>เติม / เพิ่มสต็อกสินค้าให้ตัวแทน</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="bg-muted/40 space-y-3 rounded-lg border p-3">
              <div className="relative">
                <IconSearch className="text-muted-foreground absolute top-2.5 left-3 size-4" />
                <Input
                  placeholder="พิมพ์ค้นหาน้องสินค้า หรือ SKU..."
                  className="bg-background pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  disabled={isPending}
                />
              </div>
              <BranchSelectField />
            </div>
            <Field>
              <FieldLabel className="text-muted-foreground text-xs font-semibold">
                เลือกรายการสินค้า / ตัวเลือก
              </FieldLabel>
              <Controller
                control={control}
                name="variantId"
                rules={{ required: 'กรุณาเลือกรายการสินค้า' }}
                render={({ field }) => (
                  <ScrollArea className="h-64 pr-2">
                    {isProductsLoading ? (
                      <div className="flex h-48 items-center justify-center p-4">
                        <Spinner />
                      </div>
                    ) : products.length === 0 ? (
                      <div className="text-muted-foreground flex h-48 flex-col items-center justify-center gap-2 text-center">
                        <IconPackage className="size-8 opacity-40" />
                        <p className="text-sm">ไม่พบรายการสินค้า</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {products.map((product) =>
                          product.variants?.map((variant) => {
                            const isSelected = field.value === variant.id
                            const stockQty = getStockQuantity(variant)
                            const isOutOfStock = stockQty <= 0
                            const imageUrl =
                              variant.image ||
                              product.images?.find((img) => img.isPrimary)
                                ?.url ||
                              product.images?.[0]?.url

                            return (
                              <button
                                key={variant.id}
                                type="button"
                                disabled={isOutOfStock}
                                onClick={() => {
                                  field.onChange(variant.id)
                                  setValue('quantity', 1)
                                }}
                                className={cn(
                                  'relative flex w-full items-start gap-3 rounded-lg border p-2.5 text-left text-sm transition-colors',
                                  isSelected
                                    ? 'border-primary bg-primary/5'
                                    : isOutOfStock
                                      ? 'bg-muted/10 cursor-not-allowed opacity-40'
                                      : 'border-border hover:bg-accent/50',
                                )}
                              >
                                <ProductImage src={imageUrl} />
                                <div className="min-w-0 flex-1 space-y-1">
                                  <p className="text-foreground leading-snug font-medium break-all whitespace-pre-line">
                                    {variant.title}
                                  </p>
                                  {variant.sku && (
                                    <p className="text-muted-foreground text-xs break-all">
                                      SKU: {variant.sku}
                                    </p>
                                  )}
                                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                                    <Badge
                                      variant={
                                        isOutOfStock ? 'outline' : 'default'
                                      }
                                    >
                                      {isOutOfStock
                                        ? 'หมดสต็อก'
                                        : `คงเหลือ: ${formatNumber(stockQty)} ชิ้น`}
                                    </Badge>
                                    <span className="text-primary text-sm font-semibold whitespace-nowrap">
                                      {formatCurrency(
                                        Number(variant.price || 0),
                                      )}
                                    </span>
                                  </div>
                                </div>
                              </button>
                            )
                          }),
                        )}
                      </div>
                    )}
                  </ScrollArea>
                )}
              />
              <FieldError>{errors.variantId?.message}</FieldError>
            </Field>
            <Field>
              <div className="flex items-center justify-between">
                <FieldLabel>จำนวนที่ต้องการเติม (ชิ้น)</FieldLabel>
                {selectedVariant && (
                  <span className="text-muted-foreground text-xs">
                    คงเหลือในระบบ: {formatNumber(maxStock)} ชิ้น
                  </span>
                )}
              </div>
              <Input
                type="number"
                min={1}
                max={maxStock > 0 ? maxStock : undefined}
                placeholder="กรอกจำนวน..."
                {...register('quantity', {
                  valueAsNumber: true,
                  required: 'กรุณากรอกจำนวน',
                  min: { value: 1, message: 'จำนวนต้องอย่างน้อย 1 ชิ้น' },
                  max: {
                    value: maxStock,
                    message: selectedVariant
                      ? `จำนวนต้องไม่เกินสต็อกคงเหลือ (${maxStock} ชิ้น)`
                      : 'จำนวนเกินสต็อกคงเหลือ',
                  },
                })}
                disabled={isPending || !selectedVariantId || maxStock <= 0}
              />
              <FieldError>{errors.quantity?.message}</FieldError>
            </Field>
            {selectedVariant && (
              <div className="bg-muted/30 space-y-1.5 rounded-lg border p-3 text-xs">
                <div className="text-muted-foreground flex flex-col gap-0.5 sm:flex-row sm:items-start sm:justify-between">
                  <span className="shrink-0">สินค้าที่เลือก:</span>
                  <span className="text-foreground font-medium break-all whitespace-pre-line sm:text-right">
                    {selectedVariant.productTitle} ({selectedVariant.title})
                  </span>
                </div>
                <div className="text-muted-foreground flex justify-between">
                  <span>สต็อกคงเหลือปัจจุบัน:</span>
                  <span>{formatNumber(maxStock)} ชิ้น</span>
                </div>
                <div className="text-foreground flex justify-between border-t pt-1.5 text-sm font-bold">
                  <span>คงเหลือหลังจัดสรร:</span>
                  <span className="text-primary">
                    {formatNumber(Math.max(0, maxStock - inputQuantity))} ชิ้น
                  </span>
                </div>
              </div>
            )}
            <DialogFooter className="gap-2 border-t pt-3">
              {isDirty ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => reset()}
                  disabled={isPending}
                >
                  <IconX className="size-4" />
                  ล้างข้อมูล
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isPending}
                >
                  ยกเลิก
                </Button>
              )}
              <Button
                type="submit"
                disabled={isPending || !selectedVariantId || maxStock <= 0}
              >
                {isPending ? (
                  <>
                    <Spinner /> กำลังบันทึก...
                  </>
                ) : (
                  'บันทึกเติมสต็อก'
                )}
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  )
}
