/* eslint-disable @next/next/no-img-element */
'use client'

import { useEffect, useMemo } from 'react'
import {
  Controller,
  useFieldArray,
  useFormContext,
  useWatch,
} from 'react-hook-form'

import { useBranches } from '@/actions/store/branch/hooks'
import { ProductType } from '@/generated/prisma/enums'
import { useStoreFilter } from '@/stores/use-store-filter'
import { ProductFormValues } from '@/zod/catalog/product'
import { IconTrash } from '@tabler/icons-react'
import { ImagePlus, PlusCircle, X } from 'lucide-react'

import { ActionRequiredAlert } from '@/components/ActionRequiredAlert'
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

import { cn } from '@/lib/utils'

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

  const imageValue = watch(`variants.${index}.image`)

  const { selectedStoreId } = useStoreFilter()
  const { data: branchesData } = useBranches({ storeId: selectedStoreId })
  const branches = useMemo(() => branchesData?.data ?? [], [branchesData])

  const usedBranchIds =
    useWatch({
      control,
      name: `variants.${index}.stocks`,
    })?.map((s) => s.branchId) ?? []

  const productType = watch('productType')
  const isPhysical = productType === ProductType.PHYSICAL
  const isDigitalLink = productType === ProductType.DIGITAL_LINK
  const isDigitalItem = productType === ProductType.DIGITAL_ITEM
  const isDigitalService = productType === ProductType.DIGITAL_SERVICE

  const {
    fields: digitalFields,
    append: appendDigital,
    remove: removeDigital,
  } = useFieldArray({
    control,
    name: `variants.${index}.digitalItems`,
  })

  const stocks = useWatch({
    control,
    name: `variants.${index}.stocks`,
  })

  const isAvailable = watch(`variants.${index}.isAvailable`)

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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setValue(`variants.${index}.image`, file, { shouldDirty: true })
    }
  }

  const handleRemoveImage = () => {
    setValue(`variants.${index}.image`, null, { shouldDirty: true })
  }

  const previewUrl =
    imageValue instanceof File
      ? URL.createObjectURL(imageValue)
      : typeof imageValue === 'string'
        ? imageValue
        : null

  return (
    <Card
      className={cn(
        'relative overflow-hidden rounded-lg border-l',
        isAvailable && 'border-primary',
      )}
    >
      <div className="flex flex-wrap justify-between gap-2.5 border-b px-5 pt-3 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            {isAvailable ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
          </span>
          <Controller
            name={`variants.${index}.isAvailable`}
            control={control}
            render={({ field }) => (
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            )}
          />
        </div>
        <Button
          variant="destructive"
          size="icon-lg"
          onClick={() => removeVariant(index)}
          disabled={isOnlyOne}
        >
          <IconTrash />
        </Button>
      </div>
      <CardContent className="grid gap-6 pt-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-12">
          <div className="flex items-center justify-center sm:col-span-3">
            <div
              className={cn(
                'bg-muted/20 hover:bg-muted/40 relative flex aspect-square w-full shrink-0 items-center justify-center overflow-hidden border border-dashed p-1.5',
                previewUrl ? 'border-primary' : 'border-border',
              )}
            >
              {previewUrl ? (
                <div className="group relative size-full">
                  <img
                    src={previewUrl}
                    alt="Variant thumbnail"
                    className="size-full object-cover"
                  />
                  <div className="dark absolute inset-0 flex items-center justify-center bg-black/40 opacity-100 transition-opacity">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon-lg"
                      className="size-8"
                      onClick={handleRemoveImage}
                      title="ลบรูปภาพ"
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <label className="text-muted-foreground hover:text-foreground flex size-full cursor-pointer flex-col items-center justify-center transition-colors">
                  <ImagePlus className="size-5" />
                  <span className="mt-2 text-xs font-medium">
                    เพิ่มรูปตัวเลือก
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </label>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:col-span-9 sm:grid-cols-12">
            <div className="sm:col-span-6 md:col-span-6">
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
            <div className="sm:col-span-6 md:col-span-6">
              <Controller
                name={`variants.${index}.sku`}
                control={control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel className="text-xs">SKU (ถ้ามี)</FieldLabel>
                    <Input
                      {...field}
                      value={field.value ?? ''}
                      placeholder="SKU-12345"
                    />
                  </Field>
                )}
              />
            </div>
            <div className="sm:col-span-6">
              <Controller
                name={`variants.${index}.price`}
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel className="text-xs">ราคาขาย</FieldLabel>
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
            <div className="sm:col-span-6">
              <Controller
                name={`variants.${index}.costPrice`}
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel className="text-xs">ต้นทุนสินค้า</FieldLabel>
                    <Input
                      {...field}
                      type="number"
                      min="0"
                      step="1"
                      placeholder="0"
                      value={field.value ?? 0}
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
          </div>
          <div className="grid gap-5 border-t pt-5 sm:col-span-12 sm:grid-cols-2 xl:col-span-12">
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
            <div className="sm:col-span-12">
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
          {isPhysical && (
            <div className="space-y-5 sm:col-span-12">
              <Separator />
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
            </div>
          )}
        </div>
        {isPhysical && (
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
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
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
        )}
        {isDigitalItem && (
          <div className="bg-muted/20 mt-6 rounded-lg border p-4">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2.5">
              <FieldLegend variant="label" className="text-lg font-bold">
                รายการสินค้าดิจิทัล (Key/Content)
              </FieldLegend>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => appendDigital({ content: '', isUsed: false })}
              >
                <PlusCircle className="mr-2 size-4" /> เพิ่มเนื้อหา/คีย์
              </Button>
            </div>
            <div className="space-y-2">
              {digitalFields.map((item, dIndex) => (
                <div key={item.id} className="flex gap-2">
                  <Controller
                    name={`variants.${index}.digitalItems.${dIndex}.content`}
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        placeholder="ระบุคีย์สินค้า หรือเนื้อหาดิจิทัล"
                      />
                    )}
                  />
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-muted-foreground text-[10px]">
                      ใช้แล้ว
                    </span>
                    <Controller
                      name={`variants.${index}.digitalItems.${dIndex}.isUsed`}
                      control={control}
                      render={({ field }) => (
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="scale-90"
                        />
                      )}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => removeDigital(dIndex)}
                  >
                    <IconTrash />
                  </Button>
                </div>
              ))}
              {digitalFields.length === 0 && (
                <p className="text-muted-foreground py-4 text-center text-sm">
                  ยังไม่มีข้อมูลดิจิทัล
                </p>
              )}
            </div>
          </div>
        )}
        {isDigitalService && (
          <ActionRequiredAlert
            title="ข้อมูลแจ้งเตือน"
            description=" ระบบจะส่งเหตุการณ์ตัวเลือกของสินค้านี้เข้าไปใน Webhook
              ที่ตั้งค่าไว้ในลิงก์ API Webhooks ของคุณ
              เพื่อนำข้อมูลการสั่งซื้อไปทำงานต่อใน Logic ของคุณ
              หากยังไม่ได้ตั้งค่า Webhook
              โปรดไปตั้งค่าและตรวจสอบให้เรียบร้อยครับ"
          />
        )}
      </CardContent>
    </Card>
  )
}
