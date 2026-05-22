'use client'

import {
  Controller,
  FormProvider,
  useFieldArray,
  useForm,
} from 'react-hook-form'

import { generateProductAiAction } from '@/actions/ai'
import { DiscountType, MetadataDetail } from '@/types/sites/product'
import { ProductFormValues, productFormSchema } from '@/zod/product'
import { zodResolver } from '@hookform/resolvers/zod'
import { IconImageGeneration, IconLoader2 } from '@tabler/icons-react'
import { useMutation } from '@tanstack/react-query'
import { CirclePlus, PlusCircle, Trash2 } from 'lucide-react'
import z from 'zod'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { ImageUploadSection } from './ImageUploadSection'
import { ProductPreviewContent } from './ProductPreviewContent'
import { VariantItem } from './VariantItem'

export function CreateProductForm() {
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      title: '',
      slug: '',
      categoryId: '',
      images: [],
      variants: [
        {
          title: 'Standard',
          price: 0,
          sku: '',
          stocks: [{ branchId: '', quantity: 0, minStock: 0 }],
          discount: { active: false, type: DiscountType.PERCENTAGE, amount: 0 },
          rewardPoints: { isActive: false, amount: 0 },
        },
      ],
      addons: [],
      metadata: [{ key: 'brand', value: '' }],
      tags: '',
    },
  })

  const {
    fields: variantFields,
    append: appendVariant,
    remove: removeVariant,
  } = useFieldArray({
    control: form.control,
    name: 'variants',
  })

  const {
    fields: addonFields,
    append: appendAddon,
    remove: removeAddon,
  } = useFieldArray({
    control: form.control,
    name: 'addons',
  })

  const {
    fields: metadataFields,
    append: appendMetadata,
    remove: removeMetadata,
  } = useFieldArray({
    control: form.control,
    name: 'metadata',
  })

  const onSubmit = (data: z.infer<typeof productFormSchema>) => {
    console.log('Submitted Data:', data)
  }

  const { mutate: handleAiGen, isPending: isPendingAiGen } = useMutation({
    mutationFn: async () => {
      const title = form.getValues('title')

      // if (!title) {
      //   throw new Error('กรุณาระบุชื่อสินค้าก่อนให้ AI ช่วยคิด')
      // }

      return await generateProductAiAction(title)
    },
    onSuccess: (data) => {
      const metadataDynamicFields =
        (data.metadata?.details as MetadataDetail[])?.map((item) => ({
          key: String(item.key),
          value: String(item.value),
        })) || []

      form.reset({
        ...form.getValues(),
        ...data,
        addons: data.addons || [],
        tags: data.metadata?.tags ? data.metadata.tags.join(', ') : '',
        metadata: metadataDynamicFields,
      })
    },
    onError: (error) => {
      console.error('AI Gen Error:', error)
    },
  })

  return (
    <FormProvider {...form}>
      <div className="grid grid-cols-1 items-start gap-10 xl:grid-cols-2">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
          <FieldSet disabled={isPendingAiGen}>
            <FieldGroup className="mt-4 grid gap-6">
              <Controller
                name="title"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>ชื่อสินค้า</FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      placeholder="เช่น เสื้อยืดลายพิเศษ"
                      aria-invalid={fieldState.invalid}
                    />
                    <FieldDescription>
                      ชื่อที่จะแสดงบนหน้าร้านค้า
                    </FieldDescription>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Controller
                  name="slug"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>URL Slug</FieldLabel>
                      <Input
                        {...field}
                        id={field.name}
                        placeholder="t-shirt-limited"
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Controller
                  name="categoryId"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>หมวดหมู่</FieldLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger
                          id={field.name}
                          aria-invalid={fieldState.invalid}
                        >
                          <SelectValue placeholder="เลือกหมวดหมู่" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="019d8c50-5e3a-7df1-8de0-e260f4f4f8dd">
                            Fashion & Apparel
                          </SelectItem>
                          <SelectItem value="it-gadgets">
                            IT & Gadgets
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>
            </FieldGroup>
          </FieldSet>

          <ImageUploadSection />

          <FieldSet
            disabled={isPendingAiGen}
            className="bg-muted/30 rounded-xl border p-6"
          >
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2.5">
              <FieldLegend variant="label" className="text-lg font-bold">
                ตัวเลือกสินค้า (Variants)
              </FieldLegend>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  appendVariant({
                    title: '',
                    price: 0,
                    sku: '',
                    stocks: [{ branchId: '', quantity: 0, minStock: 0 }],
                    discount: {
                      active: false,
                      type: DiscountType.PERCENTAGE,
                      amount: 0,
                    },
                    rewardPoints: { isActive: false, amount: 0 },
                  })
                }
              >
                <PlusCircle className="mr-2 size-4" /> เพิ่มตัวเลือก
              </Button>
            </div>

            <FieldGroup className="space-y-4">
              {variantFields.map((item, index) => (
                <VariantItem
                  key={item.id}
                  index={index}
                  removeVariant={removeVariant}
                  isOnlyOne={variantFields.length === 1}
                />
              ))}
            </FieldGroup>
          </FieldSet>

          <FieldSet
            disabled={isPendingAiGen}
            className="bg-muted/30 rounded-lg border p-4"
          >
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2.5">
              <FieldLegend className="text-lg font-bold">
                Metadata (ข้อมูลทางเทคนิค)
              </FieldLegend>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => appendMetadata({ key: '', value: '' })}
              >
                <CirclePlus className="mr-1 size-4" /> เพิ่มฟิลด์
              </Button>
            </div>

            <div className="space-y-3">
              {metadataFields.map((field, index) => (
                <div key={field.id} className="flex items-start gap-2">
                  <Controller
                    name={`metadata.${index}.key`}
                    control={form.control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        placeholder="ชื่อฟิลด์ (เช่น material)"
                        className="w-1/3"
                      />
                    )}
                  />
                  <Controller
                    name={`metadata.${index}.value`}
                    control={form.control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        placeholder="ค่าข้อมูล"
                        className="flex-1"
                      />
                    )}
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => removeMetadata(index)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
            </div>

            <Controller
              name="tags"
              control={form.control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>Tags (คั่นด้วยเครื่องหมายคอมม่า)</FieldLabel>
                  <Input {...field} placeholder="เสื้อผ้า, แฟชั่น, cotton" />
                </Field>
              )}
            />
          </FieldSet>

          <FieldSet
            disabled={isPendingAiGen}
            className="bg-muted/30 rounded-xl border p-6"
          >
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2.5">
              <FieldLegend variant="label" className="text-lg font-bold">
                บริการเสริม (Addons)
              </FieldLegend>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  appendAddon({ title: '', price: 0, isAvailable: true })
                }
              >
                <PlusCircle className="mr-2 size-4" /> เพิ่มบริการเสริม
              </Button>
            </div>

            <FieldGroup className="grid gap-4">
              {addonFields.map((item, index) => (
                <Card key={item.id} className="border-blue-50 shadow-sm">
                  <CardContent className="flex items-end gap-3 pt-6">
                    <div className="grid flex-1 gap-3">
                      <Controller
                        name={`addons.${index}.title`}
                        control={form.control}
                        render={({ field }) => (
                          <Field>
                            <FieldLabel className="text-xs">
                              ชื่อบริการ (เช่น ห่อของขวัญ)
                            </FieldLabel>
                            <Input {...field} />
                          </Field>
                        )}
                      />
                      <Controller
                        name={`addons.${index}.price`}
                        control={form.control}
                        render={({ field }) => (
                          <Field>
                            <FieldLabel className="text-xs">
                              ราคาเพิ่ม
                            </FieldLabel>
                            <Input
                              {...field}
                              type="number"
                              onChange={(e) =>
                                field.onChange(Number(e.target.value))
                              }
                            />
                          </Field>
                        )}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() => removeAddon(index)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
              {addonFields.length === 0 && (
                <div className="text-muted-foreground rounded-lg border-2 border-dashed py-6 text-center md:col-span-2">
                  ยังไม่มีบริการเสริม
                </div>
              )}
            </FieldGroup>
          </FieldSet>

          <div className="flex flex-wrap justify-end gap-4 border-t pt-6">
            <Button type="button" variant="ghost" onClick={() => form.reset()}>
              ล้างฟอร์ม
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleAiGen()}
            >
              {isPendingAiGen ? (
                <IconLoader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <IconImageGeneration className="mr-2 size-4" />
              )}
              {isPendingAiGen ? 'กำลังประมวลผล...' : 'ให้ AI ช่วยคิดเนื้อหา'}
            </Button>
            <Button type="submit">บันทึกสินค้าใหม่</Button>
          </div>
        </form>

        <div className="sticky top-6 space-y-6 xl:col-span-1">
          <ProductPreviewContent />
        </div>
      </div>
    </FormProvider>
  )
}
