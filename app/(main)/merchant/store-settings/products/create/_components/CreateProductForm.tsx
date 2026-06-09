/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import {
  Controller,
  FormProvider,
  useFieldArray,
  useForm,
} from 'react-hook-form'
import toast from 'react-hot-toast'

import { useRouter } from 'next/navigation'

import { generateProductAiAction } from '@/actions/ai'
import { createProduct } from '@/actions/product'
import { PRODUCT_PRESETS_MASTER } from '@/constants/product-preset'
import { PRODUCT_METADATA_MASTER } from '@/constants/sites/metadata'
import { DiscountType } from '@/generated/prisma/enums'
import { ALL_STORES, useStoreFilter } from '@/stores/use-store-filter'
import { MetadataDetail } from '@/types/sites/product'
import { ProductFormValues, productFormSchema } from '@/zod/product'
import { zodResolver } from '@hookform/resolvers/zod'
import { IconImageGeneration, IconTrash } from '@tabler/icons-react'
import { useMutation } from '@tanstack/react-query'
import { CirclePlus, PlusCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'

import { CategoryField } from './CategoryField'
import { ImageUploadSection } from './ImageUploadSection'
import { ProductPreviewContent } from './ProductPreviewContent'
import { ProductSlugField } from './ProductSlugField'
import { ProductTitleField } from './ProductTitleField'
import { VariantItem } from './VariantItem'

export function CreateProductForm() {
  const router = useRouter()
  const { selectedStoreId } = useStoreFilter()
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      title: '',
      slug: '',
      categoryId: '',
      images: [],
      variants: [
        {
          title: 'มาตรฐาน',
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

  const { register, handleSubmit, reset, getValues } = form

  const handleApplyPreset = (type: string) => {
    const preset = PRODUCT_PRESETS_MASTER.find((p) => p.type === type)
    if (!preset) {
      return
    }

    const currentValues = getValues()

    reset({
      ...currentValues,
      ...preset.data,
    } as ProductFormValues)

    toast.success(`โหลดตัวอย่าง${preset.toastLabel} เรียบร้อยแล้ว`)
  }

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

  const { mutate: handleCreateProduct, isPending: isPendingCreate } =
    useMutation({
      mutationFn: async (data: ProductFormValues) => {
        if (!selectedStoreId || selectedStoreId === ALL_STORES) return
        return await createProduct({
          storeId: selectedStoreId,
          categoryId: data.categoryId,
          title: data.title,
          slug: data.slug,
          tags: data.tags,
          // images: data.images,
          variants: data.variants.map((v) => ({
            title: v.title,
            price: v.price,
            sku: v.sku,
            stocks: v.stocks.map((s) => ({
              branchId: s.branchId,
              quantity: s.quantity ?? 0,
              minStock: s.minStock ?? 0,
            })),
            discount: {
              active: v.discount.active ?? false,
              type: v.discount.type ?? DiscountType.PERCENTAGE,
              amount: v.discount.amount ?? 0,
            },
            rewardPoints: {
              isActive: v.rewardPoints.isActive ?? false,
              amount: v.rewardPoints.amount ?? 0,
            },
          })),
          addons: data.addons?.map((a) => ({
            title: a.title,
            price: a.price,
            isAvailable: a.isAvailable ?? true,
          })),
          metadata: data.metadata,
        })
      },
      onSuccess: () => {
        router.push('/merchant/store-settings/products')
      },
    })

  const onSubmit = (data: ProductFormValues) => {
    handleCreateProduct(data)
  }

  const { mutate: handleAiGen, isPending: isPendingAiGen } = useMutation({
    mutationFn: async () => {
      const title = getValues('title')
      return await generateProductAiAction(title)
    },
    onSuccess: (result) => {
      if (!result.success || !result.data) {
        return
      }

      const productData = result.data

      const metadataDynamicFields =
        (productData.metadata?.details as MetadataDetail[])?.map((item) => ({
          key: String(item.key),
          value: String(item.value),
        })) || []

      const {
        variants: _variants,
        metadata: _metadata,
        addons: _addons,
        ...restData
      } = productData

      reset({
        ...getValues(),
        ...restData,
        addons: productData.addons || [],
        tags: productData.metadata?.tags
          ? productData.metadata.tags.join(', ')
          : '',
        metadata: metadataDynamicFields,
      })
    },
  })

  const isPending = isPendingAiGen || isPendingCreate

  return (
    <FormProvider {...form}>
      <Card>
        <CardContent className="flex flex-wrap items-center gap-2.5">
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={() => handleAiGen()}
          >
            {isPendingAiGen ? (
              <Spinner />
            ) : (
              <IconImageGeneration className="mr-2 size-4" />
            )}
            {isPending ? 'กำลังประมวลผล...' : 'ให้ AI ช่วยคิดเนื้อหา'}
          </Button>
          {PRODUCT_PRESETS_MASTER.map((preset) => (
            <Button
              key={preset.type}
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={() => handleApplyPreset(preset.type)}
            >
              {preset.label}
            </Button>
          ))}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 items-start gap-10 xl:grid-cols-2">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
          <FieldSet disabled={isPendingAiGen}>
            <FieldGroup className="mt-4 grid gap-6">
              <ProductTitleField isPending={isPendingAiGen} />
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <ProductSlugField isPending={isPendingAiGen} />
                <CategoryField isPending={isPendingAiGen} />
              </div>
            </FieldGroup>
          </FieldSet>

          <ImageUploadSection />

          <div className="flex flex-wrap items-center justify-between gap-2.5">
            <FieldLegend variant="label" className="text-lg font-bold">
              ตัวเลือกสินค้า
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

          <FieldSet
            disabled={isPending}
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
                <div
                  key={field.id}
                  className="flex flex-wrap items-start gap-2"
                >
                  <div className="w-1/3">
                    <Controller
                      control={form.control}
                      name={`metadata.${index}.key`}
                      render={({ field: selectField }) => (
                        <Select
                          onValueChange={selectField.onChange}
                          value={selectField.value}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="เลือกคุณสมบัติ" />
                          </SelectTrigger>
                          <SelectContent className="max-h-75">
                            {PRODUCT_METADATA_MASTER.map((group) => (
                              <SelectGroup key={group.category}>
                                <SelectLabel>{group.category}</SelectLabel>
                                {group.fields.map((item) => (
                                  <SelectItem key={item.key} value={item.key}>
                                    {item.label}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                  <Input
                    placeholder="ค่าข้อมูล (เช่น Apple, 5000mAh, สีดำ)"
                    className="flex-1"
                    {...register(`metadata.${index}.value`)}
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon-lg"
                    onClick={() => removeMetadata(index)}
                  >
                    <IconTrash />
                  </Button>
                </div>
              ))}
            </div>
            <Field className="mt-4">
              <FieldLabel>Tags (คั่นด้วยเครื่องหมายคอมม่า)</FieldLabel>
              <Input
                placeholder="เสื้อผ้า, แฟชั่น, cotton"
                {...register('tags')}
              />
            </Field>
          </FieldSet>

          <FieldSet
            disabled={isPending}
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
                      <Field>
                        <FieldLabel className="text-xs">
                          ชื่อบริการ (เช่น ห่อของขวัญ)
                        </FieldLabel>
                        <Input {...register(`addons.${index}.title`)} />
                      </Field>
                      <Field>
                        <FieldLabel className="text-xs">ราคาเพิ่ม</FieldLabel>
                        <Input
                          type="number"
                          {...register(`addons.${index}.price`, {
                            valueAsNumber: true,
                          })}
                        />
                      </Field>
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon-lg"
                      onClick={() => removeAddon(index)}
                    >
                      <IconTrash />
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
            <Button
              type="button"
              disabled={isPending}
              variant="outline"
              onClick={() => reset()}
            >
              ล้างฟอร์ม
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPendingCreate && <Spinner />}
              บันทึกสินค้าใหม่
            </Button>
          </div>
        </form>

        <div className="sticky top-6 space-y-6 xl:col-span-1">
          <ProductPreviewContent />
        </div>
      </div>
    </FormProvider>
  )
}
