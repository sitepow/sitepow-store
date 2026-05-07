import {
  Controller,
  useFieldArray,
  useFormContext,
  useWatch,
} from 'react-hook-form'

import { ProductFormValues } from '@/zod/product'
import { PlusCircle, Trash2 } from 'lucide-react'

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
import { Switch } from '@/components/ui/switch'

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
  const { control } = useFormContext<ProductFormValues>()

  const {
    fields: stockFields,
    append: appendStock,
    remove: removeStock,
  } = useFieldArray({
    control,
    name: `variants.${index}.stocks`,
  })

  const discountActive = useWatch({
    control,
    name: `variants.${index}.discount.active`,
  })
  const pointsActive = useWatch({
    control,
    name: `variants.${index}.rewardPoints.isActive`,
  })

  return (
    <Card className="relative overflow-hidden">
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

          <div className="grid grid-cols-1 gap-6 border-t pt-6 sm:col-span-12 lg:grid-cols-2 xl:col-span-12">
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <div className="space-y-0.5">
                  <span className="text-sm font-medium">เปิดใช้งานส่วนลด</span>
                </div>
                <Controller
                  name={`variants.${index}.discount.active`}
                  control={control}
                  render={({ field }) => (
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                <Controller
                  name={`variants.${index}.discount.type`}
                  control={control}
                  render={({ field }) => (
                    <Field>
                      <FieldLabel className="text-muted-foreground text-[10px] tracking-wider uppercase">
                        ประเภท
                      </FieldLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={!discountActive}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Percentage">
                            เปอร์เซ็นต์ (%)
                          </SelectItem>
                          <SelectItem value="Fixed">จำนวนเงิน (฿)</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>
                  )}
                />
                <Controller
                  name={`variants.${index}.discount.amount`}
                  control={control}
                  render={({ field }) => (
                    <Field>
                      <FieldLabel className="text-muted-foreground text-[10px] tracking-wider uppercase">
                        มูลค่าส่วนลด
                      </FieldLabel>
                      <Input
                        {...field}
                        type="number"
                        placeholder="0"
                        className="h-9"
                        disabled={!discountActive}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </Field>
                  )}
                />
              </div>
            </div>

            <div className="space-y-4 border-l pl-6 max-lg:border-t max-lg:border-l-0 max-lg:pt-6 max-lg:pl-0">
              <div className="flex items-center justify-between px-1">
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
                    <FieldLabel className="text-muted-foreground text-[10px] tracking-wider uppercase">
                      คะแนนที่ได้รับ
                    </FieldLabel>
                    <Input
                      {...field}
                      type="number"
                      placeholder="ระบุจำนวนแต้ม"
                      className="h-9"
                      disabled={!pointsActive}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </Field>
                )}
              />
            </div>
          </div>
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
                        <SelectItem value="branch-1">สาขาหลัก</SelectItem>
                        <SelectItem value="branch-2">สาขาพารากอน</SelectItem>
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
                      className="h-8 text-xs"
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  )}
                />
                <Button
                  type="button"
                  variant="destructive"
                  className="col-span-2"
                  size="icon"
                  onClick={() => removeStock(stockIndex)}
                  disabled={stockFields.length === 1}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </CardContent>

      <div className="absolute top-2 right-2">
        <Button
          type="button"
          variant="destructive"
          size="icon"
          onClick={() => removeVariant(index)}
          disabled={isOnlyOne}
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
    </Card>
  )
}
