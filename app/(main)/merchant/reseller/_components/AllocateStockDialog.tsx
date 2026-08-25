/* eslint-disable @next/next/no-img-element */
'use client'

import { useEffect, useState } from 'react'
import {
  Controller,
  FormProvider,
  SubmitHandler,
  useForm,
} from 'react-hook-form'
import toast from 'react-hot-toast'

import { usePOSProducts } from '@/actions/hooks/pos/product'
import { useAllocateResellerStock } from '@/actions/hooks/reseller'
import { useBranchFilter } from '@/stores/use-branch-filter'
import { useResellerFilter } from '@/stores/use-reseller-filter'
import { useStoreFilter } from '@/stores/use-store-filter'
import { formatCurrency } from '@/utils/pricing'
import { IconSearch, IconX } from '@tabler/icons-react'

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
    formState: { errors, isDirty },
  } = methods

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
      <DialogContent className="max-h-[90vh] overflow-x-hidden overflow-y-auto sm:max-w-md">
        <FormProvider {...methods}>
          <DialogHeader>
            <DialogTitle>เติม / เพิ่มสต็อกสินค้าให้ตัวแทน</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
            <Field>
              <FieldLabel>เลือกรายการสินค้า / ตัวเลือก</FieldLabel>
              <Controller
                control={control}
                name="variantId"
                rules={{ required: 'กรุณาเลือกรายการสินค้า' }}
                render={({ field }) => (
                  <div className="space-y-2">
                    <div className="relative">
                      <IconSearch className="text-muted-foreground absolute top-2.5 left-3 size-4" />
                      <Input
                        placeholder="พิมพ์ค้นหาน้องสินค้า หรือ SKU..."
                        className="pl-9"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        disabled={isPending}
                      />
                    </div>
                    <ScrollArea className="h-52 rounded-md border p-2">
                      {isProductsLoading ? (
                        <div className="flex h-full items-center justify-center p-4">
                          <Spinner />
                        </div>
                      ) : products.length === 0 ? (
                        <p className="text-muted-foreground p-4 text-center text-sm">
                          ไม่พบรายการสินค้า
                        </p>
                      ) : (
                        <div className="space-y-1">
                          {products.map((product) =>
                            product.variants?.map((variant) => {
                              const isSelected = field.value === variant.id

                              return (
                                <button
                                  key={variant.id}
                                  type="button"
                                  onClick={() => field.onChange(variant.id)}
                                  className={`flex w-full items-center justify-between rounded-lg p-2 text-left text-sm transition-colors ${
                                    isSelected
                                      ? 'bg-primary text-primary-foreground font-medium'
                                      : 'hover:bg-accent hover:text-accent-foreground'
                                  }`}
                                >
                                  <div className="flex items-center gap-2 overflow-hidden">
                                    {variant.image ||
                                    product.images?.[0]?.url ? (
                                      <img
                                        src={
                                          variant.image ||
                                          product.images?.[0]?.url
                                        }
                                        alt={product.title}
                                        className="size-8 rounded border object-cover"
                                      />
                                    ) : (
                                      <div className="bg-muted size-8 rounded border" />
                                    )}
                                    <div className="truncate">
                                      <p className="truncate font-medium">
                                        {product.title}
                                      </p>
                                      <p className="text-xs opacity-80">
                                        {variant.title}{' '}
                                        {variant.sku ? `(${variant.sku})` : ''}
                                      </p>
                                    </div>
                                  </div>
                                  <span className="shrink-0 text-xs font-semibold">
                                    {formatCurrency(Number(variant.price || 0))}
                                  </span>
                                </button>
                              )
                            }),
                          )}
                        </div>
                      )}
                    </ScrollArea>
                  </div>
                )}
              />
              <FieldError>{errors.variantId?.message}</FieldError>
            </Field>
            <Field>
              <FieldLabel>จำนวนที่ต้องการเติม (ชิ้น)</FieldLabel>
              <Input
                type="number"
                min={1}
                placeholder="1"
                {...register('quantity', {
                  valueAsNumber: true,
                  min: { value: 1, message: 'จำนวนต้องอย่างน้อย 1 ชิ้น' },
                })}
                disabled={isPending}
              />
              <FieldError>{errors.quantity?.message}</FieldError>
            </Field>
            <DialogFooter className="gap-2">
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
              <Button type="submit" disabled={isPending}>
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
