/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import { useEffect, useState } from 'react'
import {
  Controller,
  FormProvider,
  useFieldArray,
  useForm,
} from 'react-hook-form'
import toast from 'react-hot-toast'

import { useRouter } from 'next/navigation'

import { generateProductAiAction } from '@/actions/ai'
import {
  useCreateProduct,
  useProduct,
  useUpdateProduct,
} from '@/actions/hooks/product'
import { useR2DeleteImage, useR2UploadImage } from '@/actions/hooks/r2'
import { CreateProductInput } from '@/actions/product'
import { PRODUCT_PRESETS_MASTER } from '@/constants/product-preset'
import { DiscountType, ProductType } from '@/generated/prisma/enums'
import { ALL_STORES, useStoreFilter } from '@/stores/use-store-filter'
import { getPathR2FromUrl } from '@/utils/image'
import { transformProductToFormValues } from '@/utils/product'
import { ProductFormValues, productFormSchema } from '@/zod/product'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  IconArrowForward,
  IconImageGeneration,
  IconTrash,
  IconX,
} from '@tabler/icons-react'
import { useMutation } from '@tanstack/react-query'
import { CirclePlus, PlusCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Field,
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
import { Spinner } from '@/components/ui/spinner'

import { CategoryField } from './CategoryField'
import { CopyProductDataPicker } from './CopyProductDataPicker'
import { ImageUploadSection } from './ImageUploadSection'
import { MetadataCombobox } from './MetadataCombobox'
import { ProductPreviewContent } from './ProductPreviewContent'
import { ProductSlugField } from './ProductSlugField'
import { ProductTitleField } from './ProductTitleField'
import { VariantItem } from './VariantItem'

export function CreateProductForm({ productId }: { productId?: string }) {
  const router = useRouter()
  const { selectedStoreId } = useStoreFilter()
  const { data: product, isLoading: isProductLoading } = useProduct(
    productId ?? '',
  )

  const { mutate: create, isPending: isCreating } = useCreateProduct()
  const { mutate: update, isPending: isUpdating } = useUpdateProduct()

  const uploadMutation = useR2UploadImage(`store/${selectedStoreId}/products`)
  const deleteMutation = useR2DeleteImage()

  const [showPresets, setShowPresets] = useState(false)

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
          weight: 0,
          width: 0,
          height: 0,
          length: 0,
          stocks: [{ branchId: '', quantity: 0, minStock: 0 }],
          discount: { active: false, type: DiscountType.PERCENTAGE, amount: 0 },
          rewardPoints: { isActive: false, amount: 0 },
        },
      ],
      addons: [],
      metadata: [{ key: 'brand', value: '' }],
      tags: '',
      productType: ProductType.PHYSICAL,
    },
  })

  const {
    register,
    handleSubmit,
    reset,
    getValues,
    formState: { isDirty },
  } = form

  useEffect(() => {
    if (product) {
      const formValues = transformProductToFormValues(product)
      reset(formValues, {
        keepDirty: false,
        keepValues: false,
      })
    }
  }, [product, reset])

  const handleApplyPreset = (id: string) => {
    const preset = PRODUCT_PRESETS_MASTER.find((p) => p.id === id)
    if (!preset) {
      return
    }

    const currentValues = getValues()

    reset({
      ...currentValues,
      ...preset.data,
    } as ProductFormValues)

    toast.success(`โหลดตัวอย่าง ${preset.toastLabel} เรียบร้อยแล้ว`)
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

  const onSubmit = async (data: ProductFormValues) => {
    if (!selectedStoreId || selectedStoreId === ALL_STORES) {
      return
    }

    try {
      const oldImageUrls = product?.images.map((img) => img.url) || []

      const newImages = await Promise.all(
        data.images.map(async (img) => {
          if (img.url instanceof File) {
            const formData = new FormData()
            formData.append('file', img.url)
            const res = await uploadMutation.mutateAsync(formData)
            return res.success ? res.url : null
          }
          return img.url
        }),
      )

      const finalImageUrls = newImages.filter(
        (url): url is string => url !== null,
      )

      const imagesToDelete = oldImageUrls.filter(
        (url) => !finalImageUrls.includes(url),
      )

      await Promise.all(
        imagesToDelete.map(async (url) => {
          const path = getPathR2FromUrl(url)
          if (path) {
            await deleteMutation.mutateAsync(path)
          }
        }),
      )

      const payload: CreateProductInput = {
        storeId: selectedStoreId,
        categoryId: data.categoryId,
        title: data.title,
        slug: data.slug,
        tags: data.tags,
        images: finalImageUrls,
        variants: data.variants.map((v) => ({
          title: v.title,
          price: v.price,
          sku: v.sku,
          digitalUrl: v.digitalUrl ?? '',
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
        productType: data.productType as ProductType,
      }

      if (productId) {
        update({ id: productId, data: payload })
      } else {
        create(payload)
      }

      router.push('/merchant/store-settings/products')
    } catch (error) {
      console.log(error)
    }
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
      })
    },
  })

  const isPending =
    isPendingAiGen ||
    isCreating ||
    isUpdating ||
    isProductLoading ||
    uploadMutation.isPending ||
    deleteMutation.isPending

  return (
    <FormProvider {...form}>
      <Card>
        <CardContent className="flex flex-wrap items-center gap-2.5">
          <Button
            type="button"
            disabled={isPending}
            onClick={() => handleAiGen()}
          >
            {isPendingAiGen ? (
              <Spinner />
            ) : (
              <IconImageGeneration className="mr-2 size-4" />
            )}
            {isPending ? 'กำลังประมวลผล...' : 'ให้ AI ช่วยคิดเนื้อหา'}
          </Button>{' '}
          <Button type="button" onClick={() => setShowPresets(!showPresets)}>
            {showPresets ? <IconX /> : <IconArrowForward />}
            {showPresets ? 'ปิดตัวอย่างสินค้า' : 'โหลดข้อมูลสินค้าตัวอย่าง'}
          </Button>
          {showPresets &&
            PRODUCT_PRESETS_MASTER.map((preset) => (
              <Button
                key={preset.id}
                type="button"
                variant="outline"
                disabled={isPending}
                onClick={() => handleApplyPreset(preset.id)}
              >
                <IconArrowForward /> {preset.label}
              </Button>
            ))}
          {<CopyProductDataPicker storeId={selectedStoreId!} />}
          {isDirty && (
            <Button
              type="button"
              disabled={isPending}
              variant="outline"
              onClick={() => reset()}
            >
              <IconX /> ล้างการตั้งค่า
            </Button>
          )}
          {!!isDirty && (
            <Button onClick={handleSubmit(onSubmit)} disabled={isPending}>
              {isPending && <Spinner />}
              บันทึกข้อมูล
            </Button>
          )}
        </CardContent>
      </Card>
      <div className="text-foreground grid grid-cols-1 items-start gap-10 xl:grid-cols-2">
        <div className="space-y-10">
          <FieldSet disabled={isPendingAiGen}>
            <FieldGroup className="mt-4 grid gap-6">
              <ProductTitleField isPending={isPendingAiGen} />
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <ProductSlugField isPending={isPendingAiGen} />
                <CategoryField isPending={isPendingAiGen} />
              </div>
            </FieldGroup>
          </FieldSet>
          <Field>
            <FieldLabel>ประเภทสินค้า</FieldLabel>
            <Controller
              control={form.control}
              name="productType"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกประเภทสินค้า" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ProductType.PHYSICAL}>
                      สินค้าทั่วไป (Physical)
                    </SelectItem>
                    <SelectItem value={ProductType.DIGITAL}>
                      สินค้าดิจิทัล (Digital)
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </Field>
          <ImageUploadSection />
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            <FieldLegend variant="label" className="text-lg font-bold">
              ตัวเลือกสินค้า
            </FieldLegend>
            <Button
              type="button"
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
            className="dark:bg-foreground/5 border-l-primary rounded-lg border p-4"
          >
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2.5">
              <FieldLegend variant="label" className="text-lg font-bold">
                Metadata (ข้อมูลทางเทคนิค)
              </FieldLegend>
              <Button
                type="button"
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
                        <MetadataCombobox
                          value={selectField.value!}
                          onChange={selectField.onChange}
                        />
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
            className="dark:bg-foreground/5 border-l-primary rounded-lg border p-6"
          >
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2.5">
              <FieldLegend variant="label" className="text-lg font-bold">
                บริการเสริม (Addons)
              </FieldLegend>
              <Button
                type="button"
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
                <Card key={item.id}>
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
        </div>
        <div className="sticky top-6 space-y-6 xl:col-span-1">
          <ProductPreviewContent />
        </div>
      </div>
    </FormProvider>
  )
}
