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

import { useTranslations } from 'next-intl'

import { usePOSProducts } from '@/actions/hooks/pos/product'
import { useAllocateResellerStock } from '@/actions/hooks/reseller'
import { useBranchFilter } from '@/stores/use-branch-filter'
import { useResellerFilter } from '@/stores/use-reseller-filter'
import { useStoreFilter } from '@/stores/use-store-filter'
import { formatCurrency, formatNumber } from '@/utils/pricing'
import { IconCheck, IconPackage, IconSearch, IconX } from '@tabler/icons-react'

import { BranchSelectField } from '@/components/BranchSelectField'
import { DialogHeaderIcon } from '@/components/DialogHeaderIcon'
import { ProductImage } from '@/components/ProductImage'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
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
  const t = useTranslations('merchant.reseller.allocate')
  const tReseller = useTranslations('merchant.reseller')
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
      return toast.error(t('toastNoAgreement'))
    }

    if (!values.variantId) {
      return toast.error(t('toastNoProduct'))
    }

    if (values.quantity > maxStock) {
      return toast.error(t('toastStockNotEnough', { count: maxStock }))
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
            <DialogHeaderIcon icon={IconPackage} title={t('title')} />
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="bg-muted/40 space-y-3 rounded-lg border p-3">
              <div className="relative">
                <IconSearch className="text-muted-foreground absolute top-2.5 left-3 size-4" />
                <Input
                  placeholder={t('searchPlaceholder')}
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
                {t('selectProductLabel')}
              </FieldLabel>
              <Controller
                control={control}
                name="variantId"
                rules={{ required: t('toastNoProduct') }}
                render={({ field }) => (
                  <ScrollArea className="h-64 pr-2">
                    {isProductsLoading ? (
                      <div className="flex h-48 items-center justify-center p-4">
                        <Spinner />
                      </div>
                    ) : products.length === 0 ? (
                      <div className="text-muted-foreground flex h-48 flex-col items-center justify-center gap-2 text-center">
                        <IconPackage className="size-8 opacity-40" />
                        <p className="text-sm">{t('noProducts')}</p>
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
                                        ? t('outOfStock')
                                        : t('remaining', {
                                            count: formatNumber(stockQty),
                                          })}
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
                <FieldLabel>{t('quantityLabel')}</FieldLabel>
                {selectedVariant && (
                  <span className="text-muted-foreground text-xs">
                    {t('systemStock', { count: formatNumber(maxStock) })}
                  </span>
                )}
              </div>
              <Input
                type="number"
                min={1}
                max={maxStock > 0 ? maxStock : undefined}
                placeholder={t('quantityPlaceholder')}
                {...register('quantity', {
                  valueAsNumber: true,
                  required: t('quantityRequired'),
                  min: { value: 1, message: t('quantityMin') },
                  max: {
                    value: maxStock,
                    message: selectedVariant
                      ? t('quantityMax', { count: maxStock })
                      : t('quantityOver'),
                  },
                })}
                disabled={isPending || !selectedVariantId || maxStock <= 0}
              />
              <FieldError>{errors.quantity?.message}</FieldError>
            </Field>
            {selectedVariant && (
              <div className="bg-muted/30 space-y-1.5 rounded-lg border p-3 text-xs">
                <div className="text-muted-foreground flex flex-col gap-0.5 sm:flex-row sm:items-start sm:justify-between">
                  <span className="shrink-0">{t('selectedProduct')}</span>
                  <span className="text-foreground font-medium break-all whitespace-pre-line sm:text-right">
                    {selectedVariant.productTitle} ({selectedVariant.title})
                  </span>
                </div>
                <div className="text-muted-foreground flex justify-between">
                  <span>{t('currentStock')}</span>
                  <span>
                    {tReseller('table.unitPieces', {
                      count: formatNumber(maxStock),
                    })}
                  </span>
                </div>
                <div className="text-foreground flex justify-between border-t pt-1.5 text-sm font-bold">
                  <span>{t('afterAllocation')}</span>
                  <span className="text-primary">
                    {tReseller('table.unitPieces', {
                      count: formatNumber(
                        Math.max(0, maxStock - inputQuantity),
                      ),
                    })}
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
                  {t('reset')}
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isPending}
                >
                  {t('cancel')}
                </Button>
              )}
              <Button
                type="submit"
                disabled={isPending || !selectedVariantId || maxStock <= 0}
              >
                {isPending ? (
                  <>
                    <Spinner /> {t('submitting')}
                  </>
                ) : (
                  t('submit')
                )}
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  )
}
