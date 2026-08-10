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

import { handleUserPrompt } from '@/actions/ai'
import { useProductAi } from '@/actions/hooks/ai'
import {
  useCreateProduct,
  useProduct,
  useUpdateProduct,
} from '@/actions/hooks/product'
import { useR2DeleteImage, useR2UploadImage } from '@/actions/hooks/r2'
import { CreateProductInput } from '@/actions/product'
import { PRODUCT_PRESETS_MASTER } from '@/constants/product-preset'
import { PRODUCT_TYPE_OPTIONS } from '@/constants/translate'
import { DiscountType, Plan, ProductType } from '@/generated/prisma/enums'
import { useStoreData } from '@/stores/sites/use-store-data'
import { ALL_STORES, useStoreFilter } from '@/stores/use-store-filter'
import { AiGenTask } from '@/types/ai'
import { buildProductPrompt } from '@/utils/ai'
import { getPathR2FromUrl } from '@/utils/image'
import { transformProductToFormValues } from '@/utils/product'
import { ProductFormValues, productFormSchema } from '@/zod/product'
import { zodResolver } from '@hookform/resolvers/zod'
import { IconDatabase, IconTrash, IconWand, IconX } from '@tabler/icons-react'
import { CirclePlus, PlusCircle } from 'lucide-react'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
  const { store } = useStoreData()
  const [aiTaskConfirm, setAiTaskConfirm] = useState<{
    task: AiGenTask
    cost: number
    action: () => void
  } | null>(null)

  const handleAiTrigger = async (task: AiGenTask, action: () => void) => {
    const storePlan = store?.plan || Plan.FREE
    const currentTitle = getValues('title')
    const prompt = buildProductPrompt(task, currentTitle)

    const costEstimate = await handleUserPrompt(prompt, storePlan)

    setAiTaskConfirm({
      task,
      cost: costEstimate.credits,
      action,
    })
  }

  const router = useRouter()
  const { selectedStoreId } = useStoreFilter()
  const { data: product, isLoading: isProductLoading } = useProduct(
    productId ?? '',
  )

  const { mutate: create, isPending: isCreating } = useCreateProduct()
  const { mutate: update, isPending: isUpdating } = useUpdateProduct()

  const uploadMutation = useR2UploadImage(`store/${selectedStoreId}/products`)
  const deleteMutation = useR2DeleteImage()

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
          image: null,
          weight: 0,
          width: 0,
          height: 0,
          length: 0,
          stocks: [{ branchId: '', quantity: 0, minStock: 0 }],
          discount: { active: false, type: DiscountType.PERCENTAGE, amount: 0 },
          rewardPoints: { isActive: false, amount: 0 },
          isAvailable: true,
        },
      ],
      addons: [],
      metadata: [{ key: 'brand', value: '' }],
      tags: '',
      productType: ProductType.PHYSICAL,
    },
  })

  const { mutate: genAll, isPending: isGenAll } = useProductAi(
    form,
    AiGenTask.ALL,
    selectedStoreId,
  )
  const { mutate: genSlug, isPending: isGenSlug } = useProductAi(
    form,
    AiGenTask.SLUG,
    selectedStoreId,
  )
  const { mutate: genMeta, isPending: isGenMeta } = useProductAi(
    form,
    AiGenTask.METADATA,
    selectedStoreId,
  )
  const { mutate: genTags, isPending: isGenTags } = useProductAi(
    form,
    AiGenTask.TAGS,
    selectedStoreId,
  )
  const { mutate: genAddons, isPending: isGenAddons } = useProductAi(
    form,
    AiGenTask.ADDONS,
    selectedStoreId,
  )
  const { mutate: genVariants, isPending: isGenVariants } = useProductAi(
    form,
    AiGenTask.VARIANTS,
    selectedStoreId,
  )

  const isPending =
    isCreating ||
    isUpdating ||
    isProductLoading ||
    uploadMutation.isPending ||
    deleteMutation.isPending ||
    isGenAll ||
    isGenSlug ||
    isGenMeta ||
    isGenTags ||
    isGenAddons

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

      const processedImages = await Promise.all(
        data.images.map(async (img) => {
          let url: string | File | undefined = img.url

          if (url instanceof File) {
            const formData = new FormData()
            formData.append('file', url)
            const res = await uploadMutation.mutateAsync(formData)
            if (res.success) {
              url = res.url
            }
          }

          return {
            url: typeof url === 'string' ? url : '',
            isPrimary: img.isPrimary ?? false,
          }
        }),
      )

      const validImages = processedImages.filter((img) => img.url !== '')
      const finalImageUrls = validImages.map((img) => img.url)

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

      const processedVariants = await Promise.all(
        data.variants.map(async (v) => {
          let variantImageUrl: string | undefined | null =
            typeof v.image === 'string' ? v.image : null

          if (v.image instanceof File) {
            const formData = new FormData()
            formData.append('file', v.image)
            const res = await uploadMutation.mutateAsync(formData)
            if (res.success) {
              variantImageUrl = res.url
            }
          }

          return {
            title: v.title,
            price: v.price,
            sku: v.sku,
            image: variantImageUrl,
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
            digitalItems:
              v.digitalItems?.map((item) => ({
                content: item.content ?? '',
                isUsed: !!item.isUsed,
              })) || [],
            isAvailable: v.isAvailable ?? false,
          }
        }),
      )

      const payload: CreateProductInput = {
        storeId: selectedStoreId,
        categoryId: data.categoryId,
        title: data.title,
        slug: data.slug,
        tags: data.tags,
        images: validImages,
        variants: processedVariants,
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
      console.error(error)
    }
  }

  return (
    <FormProvider {...form}>
      <Card>
        <CardContent className="flex flex-wrap items-center gap-2.5">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" disabled={isGenAll}>
                {isGenAll ? (
                  <Spinner className="mr-2" />
                ) : (
                  <IconWand className="mr-2 size-4" />
                )}{' '}
                เครื่องมือ AI
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>สร้างเนื้อหา</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => handleAiTrigger(AiGenTask.ALL, () => genAll())}
              >
                ให้ AI คิดให้ทั้งหมด
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleAiTrigger(AiGenTask.SLUG, () => genSlug())}
              >
                ให้ AI คิดให้เฉพาะ Slug
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>โหลดตัวอย่าง</DropdownMenuLabel>
              {PRODUCT_PRESETS_MASTER.map((preset) => (
                <DropdownMenuItem
                  key={preset.id}
                  onClick={() => handleApplyPreset(preset.id)}
                >
                  <IconDatabase className="mr-2 size-4" /> {preset.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <CopyProductDataPicker storeId={selectedStoreId!} />
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
          <FieldSet disabled={isPending}>
            <FieldGroup className="mt-4 grid gap-6">
              <ProductTitleField
                isPending={isPending}
                onAiTrigger={(action) =>
                  handleAiTrigger(AiGenTask.TITLE, action)
                }
              />
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <ProductSlugField
                  isPending={isPending}
                  onAiTrigger={(action) =>
                    handleAiTrigger(AiGenTask.SLUG, action)
                  }
                />
                <CategoryField isPending={isPending} />
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
                    {PRODUCT_TYPE_OPTIONS.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
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
            <div className="flex flex-wrap items-center gap-2.5">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() =>
                  handleAiTrigger(AiGenTask.VARIANTS, () => genVariants())
                }
                disabled={isGenVariants}
              >
                {isGenVariants ? (
                  <Spinner />
                ) : (
                  <IconWand className="mr-2 size-4" />
                )}
                ให้ AI ช่วยคิด Variants
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() =>
                  appendVariant({
                    title: '',
                    price: 0,
                    sku: '',
                    image: null,
                    stocks: [{ branchId: '', quantity: 0, minStock: 0 }],
                    discount: {
                      active: false,
                      type: DiscountType.PERCENTAGE,
                      amount: 0,
                    },
                    rewardPoints: { isActive: false, amount: 0 },
                    isAvailable: true,
                  })
                }
              >
                <PlusCircle className="mr-2 size-4" /> เพิ่มตัวเลือก
              </Button>
            </div>
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
              <div className="flex flex-wrap gap-2.5">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    handleAiTrigger(AiGenTask.METADATA, () => genMeta())
                  }
                  disabled={isGenMeta}
                >
                  {isGenMeta ? (
                    <Spinner />
                  ) : (
                    <IconWand className="mr-2 size-4" />
                  )}
                  ให้ AI ช่วยคิด Metadata
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => appendMetadata({ key: '', value: '' })}
                >
                  <CirclePlus className="mr-1 size-4" /> เพิ่มฟิลด์
                </Button>
              </div>
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
              <div className="flex gap-2">
                <Input
                  placeholder="เสื้อผ้า, แฟชั่น, cotton"
                  {...register('tags')}
                  disabled={isPending}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    handleAiTrigger(AiGenTask.TAGS, () => genTags())
                  }
                  disabled={isGenTags}
                >
                  {isGenTags ? <Spinner /> : <IconWand />}
                </Button>
              </div>
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
              <div className="flex flex-wrap gap-2.5">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    handleAiTrigger(AiGenTask.ADDONS, () => genAddons())
                  }
                  disabled={isGenAddons}
                >
                  {isGenAddons ? (
                    <Spinner />
                  ) : (
                    <IconWand className="mr-2 size-4" />
                  )}
                  ให้ AI ช่วยคิด Addons
                </Button>
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
      <AlertDialog
        open={!!aiTaskConfirm}
        onOpenChange={() => setAiTaskConfirm(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการใช้ AI</AlertDialogTitle>
            <AlertDialogDescription>
              การดำเนินการนี้จะใช้เครดิตประมาณ{' '}
              <span className="text-primary">{aiTaskConfirm?.cost} เครดิต</span>{' '}
              คุณต้องการดำเนินการต่อหรือไม่?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (aiTaskConfirm) {
                  aiTaskConfirm.action()
                  setAiTaskConfirm(null)
                }
              }}
            >
              ยืนยัน
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </FormProvider>
  )
}
