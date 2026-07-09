import { useEffect, useMemo } from 'react'
import {
  Controller,
  useFieldArray,
  useFormContext,
  useWatch,
} from 'react-hook-form'

import { useBranches } from '@/actions/hooks/branch'
import { ProductType } from '@/generated/prisma/enums'
import { useStoreFilter } from '@/stores/use-store-filter'
import { ProductFormValues } from '@/zod/product'
import { IconTrash } from '@tabler/icons-react'
import { PlusCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Field,
  FieldError,
  FieldLabel,
  FieldLegend,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'

import { DiscountField } from './DiscountField'

interface VariantItemProps {
  index: number
  removeVariant: (index: number) => void
  isOnlyOne: boolean
}

export function VariantItem({
  index,
  removeVariant,
  isOnlyOne,
}: VariantItemProps) {
  const { control, setValue, watch } = useFormContext<ProductFormValues>()

  const {
    fields: stockFields,
    append: appendStock,
    remove: removeStock,
  } = useFieldArray({
    control,
    name: `variants.${index}.stocks`,
  })

  const pointsActive = useWatch({
    control,
    name: `variants.${index}.rewardPoints.isActive`,
  })

  const { selectedStoreId } = useStoreFilter()
  const { data: branchesData } = useBranches({ storeId: selectedStoreId })
  const branches = useMemo(() => branchesData?.data ?? [], [branchesData])

  const usedBranchIds =
    useWatch({
      control,
      name: `variants.${index}.stocks`,
    })?.map((s) => s.branchId) ?? []

  const productType = watch('productType')
  const isDigitalLink = productType === ProductType.DIGITAL_LINK

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
    <Card className="border-primary relative overflow-hidden rounded-lg border-l">
      <CardContent className="grid gap-6 pt-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
          <div className="md:col-span-6">
            <Controller
              name={`variants.${index}.title`}
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel className="text-xs">
                    ชื่อตัวเลือก (เช่น ไซส์ M)
                  </FieldLabel>
                  <Input {...field} />
                </Field>
              )}
            />
          </div>
          <div className="md:col-span-6">
            <Controller
              name={`variants.${index}.price`}
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel className="text-xs">ราคา</FieldLabel>
                  <Input
                    {...field}
                    type="number"
                    min="0"
                    step="1"
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>
          <div className="grid grid-cols-2 gap-5 border-t pt-5 sm:col-span-12 xl:col-span-12">
            <DiscountField index={index} />
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2.5">
                <div className="space-y-0.5">
                  <span className="text-sm font-medium">สะสมคะแนน</span>
                </div>
                <Controller
                  name={`variants.${index}.rewardPoints.isActive`}
                  control={control}
                  render={({ field }) => (
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
              </div>
              <Controller
                name={`variants.${index}.rewardPoints.amount`}
                control={control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel className="text-muted-foreground text-[10px]">
                      คะแนนที่ได้รับ
                    </FieldLabel>
                    <Input
                      {...field}
                      type="number"
                      placeholder="ระบุจำนวนแต้ม"
                      className="h-9"
                      min="0"
                      step="1"
                      disabled={!pointsActive}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </Field>
                )}
              />
            </div>
          </div>
          {isDigitalLink && (
            <div className="md:col-span-12">
              <Controller
                name={`variants.${index}.digitalUrl`}
                control={control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel className="text-xs">
                      ลิงก์ดาวน์โหลด (Digital URL)
                    </FieldLabel>
                    <Input
                      {...field}
                      value={field.value ?? ''}
                      placeholder="ระบุลิงค์ดาว์นโหลดของคุณ"
                    />
                  </Field>
                )}
              />
            </div>
          )}
          {!isDigitalLink && (
            <>
              <Separator className="col-span-12" />
              <div className="grid grid-cols-2 gap-4 md:col-span-12">
                <div className="col-span-2">
                  <FieldLabel className="text-muted-foreground text-xs font-bold">
                    ข้อมูลการจัดส่ง
                  </FieldLabel>
                </div>
                <Controller
                  name={`variants.${index}.weight`}
                  control={control}
                  render={({ field }) => (
                    <Field>
                      <FieldLabel className="text-xs">น้ำหนัก (g)</FieldLabel>
                      <Input
                        {...field}
                        type="number"
                        min="0"
                        step="0.01"
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </Field>
                  )}
                />
                <Controller
                  name={`variants.${index}.width`}
                  control={control}
                  render={({ field }) => (
                    <Field>
                      <FieldLabel className="text-xs">กว้าง (cm)</FieldLabel>
                      <Input
                        {...field}
                        type="number"
                        min="0"
                        step="0.01"
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </Field>
                  )}
                />
                <Controller
                  name={`variants.${index}.height`}
                  control={control}
                  render={({ field }) => (
                    <Field>
                      <FieldLabel className="text-xs">สูง (cm)</FieldLabel>
                      <Input
                        {...field}
                        type="number"
                        min="0"
                        step="0.01"
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </Field>
                  )}
                />
                <Controller
                  name={`variants.${index}.length`}
                  control={control}
                  render={({ field }) => (
                    <Field>
                      <FieldLabel className="text-xs">ยาว (cm)</FieldLabel>
                      <Input
                        {...field}
                        type="number"
                        min="0"
                        step="0.01"
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </Field>
                  )}
                />
              </div>
            </>
          )}
        </div>
        <div className="bg-muted/20 rounded-lg border p-4">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2.5">
            <FieldLegend variant="label" className="text-lg font-bold">
              สต็อกรายสาขา
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
              <PlusCircle className="mr-2 size-4" /> เพิ่มสาขา
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
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="h-8 w-full text-xs">
                        <SelectValue placeholder="เลือกสาขา" />
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
      </CardContent>
      <div className="absolute top-2 right-2">
        <Button
          variant="destructive"
          size="icon-lg"
          onClick={() => removeVariant(index)}
          disabled={isOnlyOne}
        >
          <IconTrash />
        </Button>
      </div>
    </Card>
  )
}
