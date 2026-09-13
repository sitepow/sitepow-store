'use client'

import { useEffect, useRef, useState } from 'react'
import {
  Controller,
  FormProvider,
  useFieldArray,
  useForm,
} from 'react-hook-form'
import toast from 'react-hot-toast'

import { useTranslations } from 'next-intl'
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
import { useCurrentStore } from '@/hooks/use-current-store'
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
import { Switch } from '@/components/ui/switch'

import { AffiliateLinksSection } from './AffiliateLinksSection'
import { CategoryField } from './CategoryField'
import { CopyProductDataPicker } from './CopyProductDataPicker'
import { ImageUploadSection } from './ImageUploadSection'
import { MetadataCombobox } from './MetadataCombobox'
import { ProductPreviewContent } from './ProductPreviewContent'
import { ProductSlugField } from './ProductSlugField'
import { ProductTitleField } from './ProductTitleField'
import { VariantItem } from './VariantItem'

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = (error) => reject(error)
  })

const dataURLtoFile = (dataurl: string, filename: string): File => {
  const arr = dataurl.split(',')
  const mimeMatch = arr[0].match(/:(.*?);/)
  const mime = mimeMatch ? mimeMatch[1] : 'image/png'
  const bstr = atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  return new File([u8arr], filename, { type: mime })
}

export function CreateProductForm({ productId }: { productId?: string }) {
  const t = useTranslations('merchant.products.form')
  const tAffiliate = useTranslations('merchant.products.form.affiliateLinks')
  const { currentStore, store } = useCurrentStore()
  const [aiTaskConfirm, setAiTaskConfirm] = useState<{
    task: AiGenTask
    cost: number
    action: () => void
  } | null>(null)

  const DRAFT_KEY = `product_form_draft_${productId || 'new'}`
  const isRestoredRef = useRef(false)

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

  const defaultFormValues: ProductFormValues = {
    title: '',
    slug: '',
    categoryId: '',
    isPublished: true,
    images: [],
    variants: [
      {
        title: t('defaultVariantTitle'),
        price: 0,
        costPrice: 0,
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
    affiliateLinks: [],
  }

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    values: product ? transformProductToFormValues(product) : undefined,
    defaultValues: defaultFormValues,
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
    watch,
    formState: { isDirty },
  } = form

  useEffect(() => {
    const savedDraft = localStorage.getItem(DRAFT_KEY)
    if (savedDraft) {
      try {
        const parsedDraft = JSON.parse(savedDraft)

        if (Array.isArray(parsedDraft.images)) {
          parsedDraft.images = parsedDraft.images.map((img: any) => {
            if (img?.fileBase64 && img?.fileName) {
              const restoredFile = dataURLtoFile(img.fileBase64, img.fileName)
              return {
                ...img,
                url: restoredFile,
                fileBase64: img.fileBase64,
              }
            }
            return img
          })
        }

        if (Array.isArray(parsedDraft.variants)) {
          parsedDraft.variants = parsedDraft.variants.map((v: any) => {
            if (v?.imageBase64 && v?.imageFileName) {
              const restoredFile = dataURLtoFile(v.imageBase64, v.imageFileName)
              return {
                ...v,
                image: restoredFile,
                imageBase64: v.imageBase64,
              }
            }
            return v
          })
        }

        reset(parsedDraft)
      } catch (e) {
        console.error(e)
      }
    }
    isRestoredRef.current = true
  }, [DRAFT_KEY, reset])

  useEffect(() => {
    const subscription = watch((value) => {
      if (!isRestoredRef.current) {
        return
      }

      const timer = setTimeout(async () => {
        try {
          const serializableValues = JSON.parse(
            JSON.stringify(value, (key, val) =>
              val instanceof File ? undefined : val,
            ),
          )

          if (Array.isArray(value.images)) {
            serializableValues.images = await Promise.all(
              value.images.map(async (img: any) => {
                const rawFile = img?.url || img?.file
                if (rawFile instanceof File) {
                  const base64 = await fileToBase64(rawFile)
                  return {
                    ...img,
                    fileBase64: base64,
                    fileName: rawFile.name,
                    url: undefined,
                  }
                }
                return {
                  ...img,
                  url: typeof img?.url === 'string' ? img.url : undefined,
                }
              }),
            )
          }

          if (Array.isArray(value.variants)) {
            serializableValues.variants = await Promise.all(
              value.variants.map(async (v: any) => {
                const rawFile = v.image
                if (rawFile instanceof File) {
                  const base64 = await fileToBase64(rawFile)
                  return {
                    ...v,
                    imageBase64: base64,
                    imageFileName: rawFile.name,
                    image: undefined,
                  }
                }
                return {
                  ...v,
                  image: typeof v?.image === 'string' ? v.image : undefined,
                }
              }),
            )
          }

          localStorage.setItem(DRAFT_KEY, JSON.stringify(serializableValues))
        } catch (err) {
          console.error(err)
        }
      }, 600)

      return () => clearTimeout(timer)
    })

    return () => subscription.unsubscribe()
  }, [watch, DRAFT_KEY])

  const handleResetForm = () => {
    localStorage.removeItem(DRAFT_KEY)
    reset(defaultFormValues)
    toast.success(t('clearSuccess'))
  }

  const handleApplyPreset = (id: string) => {
    const preset = PRODUCT_PRESETS_MASTER.find((p) => p.id === id)
    if (!preset) return

    const currentValues = getValues()
    reset({
      ...currentValues,
      ...preset.data,
    } as ProductFormValues)

    toast.success(t('loadPresetSuccess', { label: preset.toastLabel }))
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
      const oldImageUrls = product?.images?.map((img) => img.url) || []

      const processedImages = await Promise.all(
        data.images.map(async (img) => {
          const rawFile = img.file || img.url || img
          let finalUrl = typeof img.url === 'string' ? img.url : ''

          if (rawFile instanceof File) {
            const formData = new FormData()
            formData.append('file', rawFile)

            const res = await uploadMutation.mutateAsync(formData)
            if (res?.success && res?.url) {
              finalUrl = res.url
            }
          }

          return {
            url: finalUrl,
            isPrimary: Boolean(img.isPrimary),
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

      if (data.productType === ProductType.AFFILIATE_LINK) {
        if (!data.affiliateLinks || data.affiliateLinks.length === 0) {
          toast.error(tAffiliate('noLinksAlert'))
          return
        }
      }

      let processedVariants: CreateProductInput['variants'] = []

      if (data.productType === ProductType.AFFILIATE_LINK) {
        const firstLink = data.affiliateLinks?.[0]
        const hasDiscount = Boolean(
          firstLink?.isDiscounted &&
          firstLink?.originalPrice &&
          firstLink?.price !== undefined &&
          firstLink.originalPrice > firstLink.price,
        )
        const discountAmount =
          hasDiscount &&
          firstLink?.originalPrice &&
          firstLink?.price !== undefined
            ? firstLink.originalPrice - firstLink.price
            : 0

        processedVariants = [
          {
            id: data.variants?.[0]?.id,
            title: firstLink?.label || 'Default',
            price: firstLink?.price ?? 0,
            costPrice: 0,
            sku: data.variants?.[0]?.sku || `AFF-${data.slug}`,
            image: null,
            digitalUrl: firstLink?.url || '',
            stocks: [],
            discount: {
              active: hasDiscount,
              type: 'FIXED',
              amount: discountAmount,
            },
            rewardPoints: { isActive: false, amount: 0 },
            digitalItems: [],
            isAvailable: true,
          },
        ]
      } else {
        processedVariants = await Promise.all(
          data.variants.map(async (v) => {
            let variantImageUrl: string | null =
              typeof v.image === 'string' ? v.image : null
            const rawVariantFile = v.image?.file || v.image

            if (rawVariantFile instanceof File) {
              const formData = new FormData()
              formData.append('file', rawVariantFile)
              const res = await uploadMutation.mutateAsync(formData)
              if (res?.success && res?.url) {
                variantImageUrl = res.url
              }
            }

            return {
              id: v.id,
              title: v.title,
              price: v.price,
              costPrice: v.costPrice ?? 0,
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
              translations: v.translations,
            }
          }),
        )
      }

      const payload: CreateProductInput = {
        storeId: selectedStoreId,
        categoryId: data.categoryId,
        title: data.title,
        slug: data.slug,
        isPublished: data.isPublished,
        tags: data.tags,
        images: validImages,
        variants: processedVariants,
        addons: data.addons?.map((a) => ({
          title: a.title,
          price: a.price,
          isAvailable: a.isAvailable ?? true,
          translations: a.translations,
        })),
        metadata: data.metadata,
        productType: data.productType as ProductType,
        affiliateLinks: data.affiliateLinks as any,
        translations: data.translations,
      }

      if (productId) {
        update({ id: productId, data: payload })
      } else {
        create(payload)
      }

      localStorage.removeItem(DRAFT_KEY)

      router.push('/merchant/store-settings/products')
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div
      style={
        {
          '--primary': currentStore?.primaryColor ?? store?.primaryColor,
        } as React.CSSProperties
      }
    >
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
                  {t('aiTools')}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>{t('createContent')}</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => handleAiTrigger(AiGenTask.ALL, () => genAll())}
                >
                  {t('aiThinkAll')}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    handleAiTrigger(AiGenTask.SLUG, () => genSlug())
                  }
                >
                  {t('aiThinkSlug')}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>{t('loadPresets')}</DropdownMenuLabel>
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
                onClick={handleResetForm}
              >
                <IconX /> {t('clearSettings')}
              </Button>
            )}

            {isDirty && (
              <Button onClick={handleSubmit(onSubmit)} disabled={isPending}>
                {isPending && <Spinner />}
                {isPending ? t('savingProduct') : t('saveProduct')}
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
                <div className="rounded-lg border p-3.5 bg-muted/20 space-y-2">
                  <div className="text-xs font-semibold flex items-center gap-1.5 text-muted-foreground">
                    <span>🌐 คำแปลภาษาอังกฤษ (English Translation)</span>
                  </div>
                  <Field>
                    <FieldLabel className="text-xs">Product Title (EN)</FieldLabel>
                    <Input
                      placeholder="Product title in English..."
                      {...register('translations.en.title')}
                      disabled={isPending}
                    />
                  </Field>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <ProductSlugField
                    isPending={isPending}
                    onAiTrigger={(action) =>
                      handleAiTrigger(AiGenTask.SLUG, action)
                    }
                  />
                  <CategoryField isPending={isPending} />
                </div>
                <Controller
                  control={form.control}
                  name="isPublished"
                  render={({ field }) => (
                    <Field className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                      <div className="space-y-0.5">
                        <FieldLabel className="text-base font-semibold">
                          {t('displayStorefront')}
                        </FieldLabel>
                        <p className="text-muted-foreground text-xs">
                          {t('displayStorefrontDesc')}
                        </p>
                      </div>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isPending}
                      />
                    </Field>
                  )}
                />
              </FieldGroup>
            </FieldSet>

            <Field>
              <FieldLabel>{t('productType')}</FieldLabel>
              <Controller
                control={form.control}
                name="productType"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('selectProductType')} />
                    </SelectTrigger>
                    <SelectContent>
                      {PRODUCT_TYPE_OPTIONS.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {t(`productTypes.${type.value}` as any)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>

            <ImageUploadSection />

            {form.watch('productType') === ProductType.AFFILIATE_LINK ? (
              <AffiliateLinksSection />
            ) : (
              <>
                <div className="flex flex-wrap items-center justify-between gap-2.5">
                  <FieldLegend variant="label" className="text-lg font-bold">
                    {t('variantsTitle')}
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
                      {t('aiVariants')}
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
                      <PlusCircle className="mr-2 size-4" /> {t('addVariant')}
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
              </>
            )}

            <FieldSet
              disabled={isPending}
              className="dark:bg-foreground/5 border-l-primary rounded-lg border p-4"
            >
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2.5">
                <FieldLegend variant="label" className="text-lg font-bold">
                  {t('metadataTitle')}
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
                    {t('aiMetadata')}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => appendMetadata({ key: '', value: '' })}
                  >
                    <CirclePlus className="mr-1 size-4" /> {t('addField')}
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
                      placeholder={t('propertyValuePlaceholder')}
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
                <FieldLabel>{t('tagsLabel')}</FieldLabel>
                <div className="flex gap-2">
                  <Input
                    placeholder={t('tagsPlaceholder')}
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
                  {t('addonsTitle')}
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
                    {t('aiAddons')}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() =>
                      appendAddon({ title: '', price: 0, isAvailable: true })
                    }
                  >
                    <PlusCircle className="mr-2 size-4" /> {t('addAddon')}
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
                            {t('addonNamePlaceholder')}
                          </FieldLabel>
                          <Input {...register(`addons.${index}.title`)} />
                        </Field>
                        <Field>
                          <FieldLabel className="text-xs">
                            {t('extraPrice')}
                          </FieldLabel>
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
                    {t('noAddons')}
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
          <AlertDialogContent
            style={
              {
                '--primary': currentStore?.primaryColor ?? store?.primaryColor,
              } as React.CSSProperties
            }
          >
            <AlertDialogHeader>
              <AlertDialogTitle>{t('aiConfirmTitle')}</AlertDialogTitle>
              <AlertDialogDescription>
                {t.rich('aiConfirmDesc', {
                  cost: aiTaskConfirm?.cost ?? 0,
                  highlight: (chunks) => (
                    <span className="text-primary">{chunks}</span>
                  ),
                })}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (aiTaskConfirm) {
                    aiTaskConfirm.action()
                    setAiTaskConfirm(null)
                  }
                }}
              >
                {t('aiConfirm')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </FormProvider>
    </div>
  )
}
