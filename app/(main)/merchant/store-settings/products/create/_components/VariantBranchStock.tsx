'use client'

import { useEffect, useMemo } from 'react'
import {
  Controller,
  useFieldArray,
  useFormContext,
  useWatch,
} from 'react-hook-form'
import { useTranslations } from 'next-intl'
import { IconTrash } from '@tabler/icons-react'
import { PlusCircle } from 'lucide-react'

import { useBranches } from '@/actions/hooks/branch'
import { Button } from '@/components/ui/button'
import { FieldLegend } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useStoreFilter } from '@/stores/use-store-filter'
import { ProductFormValues } from '@/zod/product'

interface VariantBranchStockProps {
  index: number
}

export function VariantBranchStock({ index }: VariantBranchStockProps) {
  const t = useTranslations('merchant.products.form')
  const { control, setValue } = useFormContext<ProductFormValues>()
  const { selectedStoreId } = useStoreFilter()

  const {
    fields: stockFields,
    append: appendStock,
    remove: removeStock,
  } = useFieldArray({
    control,
    name: `variants.${index}.stocks`,
  })

  const { data: branchesData } = useBranches({ storeId: selectedStoreId })
  const branches = useMemo(() => branchesData?.data ?? [], [branchesData])

  const usedBranchIds =
    useWatch({
      control,
      name: `variants.${index}.stocks`,
    })?.map((s) => s.branchId) ?? []

  const stocks = useWatch({
    control,
    name: `variants.${index}.stocks`,
  })

  const availableBranches = branches.filter(
    (b) => !usedBranchIds.includes(b.id),
  )

  useEffect(() => {
    if (branches.length > 0 && stocks?.length === 1 && !stocks[0]?.branchId) {
      const mainBranch = branches.find((b) => b.isMain)
      if (mainBranch) {
        setValue(`variants.${index}.stocks.0.branchId`, mainBranch.id)
      }
    }
  }, [branches, stocks, index, setValue])

  return (
    <div className="bg-muted/20 rounded-lg border p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2.5">
        <FieldLegend variant="label" className="text-lg font-bold">
          {t('branchStock')}
        </FieldLegend>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={availableBranches.length === 0}
          onClick={() =>
            appendStock({ branchId: '', quantity: 0, minStock: 0 })
          }
        >
          <PlusCircle className="mr-2 size-4" /> {t('addBranch')}
        </Button>
      </div>
      <div className="space-y-2">
        {stockFields.map((stock, stockIndex) => (
          <div
            key={stock.id}
            className="flex flex-wrap items-start gap-2 sm:flex-nowrap"
          >
            <Controller
              name={`variants.${index}.stocks.${stockIndex}.branchId`}
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                >
                  <SelectTrigger className="h-8 w-full text-xs">
                    <SelectValue placeholder={t('selectBranch')} />
                  </SelectTrigger>
                  <SelectContent>
                    {branches
                      .filter(
                        (b) =>
                          !usedBranchIds.includes(b.id) ||
                          b.id === field.value,
                      )
                      .map((branch) => (
                        <SelectItem key={branch.id} value={branch.id}>
                          {branch.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              )}
            />
            <Controller
              name={`variants.${index}.stocks.${stockIndex}.quantity`}
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  type="number"
                  min="0"
                  step="1"
                  className="h-8 text-xs"
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              )}
            />
            <Button
              variant="destructive"
              className="col-span-2"
              size="icon"
              onClick={() => removeStock(stockIndex)}
              disabled={stockFields.length === 1}
            >
              <IconTrash />
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
