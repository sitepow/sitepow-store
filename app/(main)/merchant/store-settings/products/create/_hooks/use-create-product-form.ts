'use client'

import { useEffect, useRef, useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'

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
import { DiscountType, Plan, ProductType } from '@/generated/prisma/enums'
import { useCurrentStore } from '@/hooks/use-current-store'
import { ALL_STORES, useStoreFilter } from '@/stores/use-store-filter'
import { AiGenTask } from '@/types/ai'
import { buildProductPrompt } from '@/utils/ai'
import { getPathR2FromUrl } from '@/utils/image'
import { transformProductToFormValues } from '@/utils/product'
import { ProductFormValues, productFormSchema } from '@/zod/product'

interface DraftImageData {
  url?: string | File
  file?: File
  fileBase64?: string
  fileName?: string
  isPrimary?: boolean
}

interface DraftVariantData {
  image?: string | File | null
  imageBase64?: string
  imageFileName?: string
  [key: string]: unknown
}

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

export function useCreateProductForm({ productId }: { productId?: string }) {
  const t = useTranslations('merchant.products.form')
  const tAffiliate = useTranslations('merchant.products.form.affiliateLinks')
  const router = useRouter()
  const { currentStore, store } = useCurrentStore()
  const { selectedStoreId } = useStoreFilter()

  const [aiTaskConfirm, setAiTaskConfirm] = useState<{
    task: AiGenTask
    cost: number
    action: () => void
  } | null>(null)

  const DRAFT_KEY = `product_form_draft_${productId || 'new'}`
  const isRestoredRef = useRef(false)

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

  const {
    register,
    handleSubmit,
    reset,
    getValues,
    watch,
    control,
    formState: { isDirty },
  } = form

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

  // Restore draft from localStorage
  useEffect(() => {
    const savedDraft = localStorage.getItem(DRAFT_KEY)
    if (savedDraft) {
      try {
        const parsedDraft = JSON.parse(savedDraft)

        if (Array.isArray(parsedDraft.images)) {
          parsedDraft.images = parsedDraft.images.map((img: DraftImageData) => {
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
          parsedDraft.variants = parsedDraft.variants.map(
            (v: DraftVariantData) => {
              if (v?.imageBase64 && v?.imageFileName) {
                const restoredFile = dataURLtoFile(
                  v.imageBase64,
                  v.imageFileName,
                )
                return {
                  ...v,
                  image: restoredFile,
                  imageBase64: v.imageBase64,
                }
              }
              return v
            },
          )
        }

        reset(parsedDraft)
      } catch (e) {
        console.error(e)
      }
    }
    isRestoredRef.current = true
  }, [DRAFT_KEY, reset])

  // Save draft to localStorage on form changes
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
              value.images.map(async (img: DraftImageData | undefined) => {
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
              value.variants.map(async (v: DraftVariantData | undefined) => {
                if (!v) return v
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
    control,
    name: 'variants',
  })

  const {
    fields: addonFields,
    append: appendAddon,
    remove: removeAddon,
  } = useFieldArray({
    control,
    name: 'addons',
  })

  const {
    fields: metadataFields,
    append: appendMetadata,
    remove: removeMetadata,
  } = useFieldArray({
    control,
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
        affiliateLinks: data.affiliateLinks as CreateProductInput['affiliateLinks'],
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

  return {
    form,
    register,
    handleSubmit,
    reset,
    getValues,
    watch,
    control,
    isDirty,
    currentStore,
    store,
    selectedStoreId,
    isPending,
    aiTaskConfirm,
    setAiTaskConfirm,
    handleAiTrigger,
    genAll,
    isGenAll,
    genSlug,
    genMeta,
    isGenMeta,
    genTags,
    isGenTags,
    genAddons,
    isGenAddons,
    genVariants,
    isGenVariants,
    handleResetForm,
    handleApplyPreset,
    variantFields,
    appendVariant,
    removeVariant,
    addonFields,
    appendAddon,
    removeAddon,
    metadataFields,
    appendMetadata,
    removeMetadata,
    onSubmit,
    t,
  }
}
