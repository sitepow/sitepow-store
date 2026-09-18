'use client'

import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { useTranslations } from 'next-intl'

import { ScrapedAffiliateProductResult } from '@/actions/ai'
import {
  useGenerateAffiliateProductAi,
  useScrapeAffiliateProduct,
} from '@/actions/hooks/ai'
import { useBranches } from '@/actions/hooks/branch'
import { useCategoryOptions } from '@/actions/hooks/category'
import { useCreateProduct } from '@/actions/hooks/product'
import {
  useR2UploadImage,
  useUploadExternalImagesToR2,
} from '@/actions/hooks/r2'
import { CreateProductInput } from '@/actions/product'
import { ProductType } from '@/generated/prisma/enums'
import { useCurrentStore } from '@/hooks/use-current-store'
import {
  AffiliatePlatform,
  parseMarketplaceInput,
} from '@/types/affiliate-product'

interface UseAiAffiliateProductFormProps {
  storeId: string
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function useAiAffiliateProductForm({
  storeId,
  onOpenChange,
  onSuccess,
}: UseAiAffiliateProductFormProps) {
  const t = useTranslations('merchant.products.aiAffiliateDialog')
  const { currentStore, store } = useCurrentStore()

  const { data: categories = [] } = useCategoryOptions({ storeId })
  const { data: branchesData } = useBranches({ storeId })

  const branches = branchesData?.data || []
  const defaultBranchId =
    branches.find((b) => b.isMain)?.id || branches[0]?.id || ''

  const generateMutation = useGenerateAffiliateProductAi()
  const scrapeMutation = useScrapeAffiliateProduct()
  const createProductMutation = useCreateProduct()
  const uploadImageMutation = useR2UploadImage(`store/${storeId}/products`)
  const uploadVideoMutation = useR2UploadImage(`store/${storeId}/videos`)
  const uploadExternalImagesMutation = useUploadExternalImagesToR2()

  const imageFileInputRef = useRef<HTMLInputElement>(null)
  const videoFileInputRef = useRef<HTMLInputElement>(null)

  // Steps: 'input' | 'preview'
  const [step, setStep] = useState<'input' | 'preview'>('input')

  // Step 1: Input state
  const [productUrl, setProductUrl] = useState('')
  const [rawTitle, setRawTitle] = useState('')
  const [affiliateUrl, setAffiliateUrl] = useState('')
  const [selectedCategoryId, setSelectedCategoryId] = useState('')
  const [platform, setPlatform] = useState<AffiliatePlatform>('SHOPEE')
  const [notes, setNotes] = useState('')
  const [liveScraped, setLiveScraped] =
    useState<ScrapedAffiliateProductResult | null>(null)

  // Loading animation step
  const [loadingStepIndex, setLoadingStepIndex] = useState(1)

  // Step 2: Generated Preview & Edit state
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [price, setPrice] = useState<number>(0)
  const [originalPrice, setOriginalPrice] = useState<number>(0)
  const [isOnSale, setIsOnSale] = useState(false)
  const [discountText, setDiscountText] = useState('')
  const [platformLabel, setPlatformLabel] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [primaryImageIndex, setPrimaryImageIndex] = useState(0)
  const [videoUrl, setVideoUrl] = useState('')
  const [tags, setTags] = useState('')
  const [description, setDescription] = useState('')
  const [specs, setSpecs] = useState<{ key: string; value: string }[]>([])
  const [destinationUrl, setDestinationUrl] = useState('')

  // Inline new image url state
  const [newImageUrl, setNewImageUrl] = useState('')
  const [isAddingImageUrl, setIsAddingImageUrl] = useState(false)

  // Pre-select category if available
  useEffect(() => {
    if (categories.length > 0 && !selectedCategoryId) {
      setSelectedCategoryId(categories[0].id)
    }
  }, [categories, selectedCategoryId])

  // Draft auto-save and restore key
  const DRAFT_KEY = `ai_affiliate_product_draft_${storeId || 'default'}`
  const isRestoredRef = useRef(false)

  // Restore draft from localStorage
  useEffect(() => {
    try {
      const savedDraft = localStorage.getItem(DRAFT_KEY)
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft)
        if (parsed && typeof parsed === 'object') {
          if (parsed.step) setStep(parsed.step)
          if (typeof parsed.productUrl === 'string')
            setProductUrl(parsed.productUrl)
          if (typeof parsed.rawTitle === 'string') setRawTitle(parsed.rawTitle)
          if (typeof parsed.affiliateUrl === 'string')
            setAffiliateUrl(parsed.affiliateUrl)
          if (typeof parsed.selectedCategoryId === 'string')
            setSelectedCategoryId(parsed.selectedCategoryId)
          if (parsed.platform) setPlatform(parsed.platform)
          if (typeof parsed.notes === 'string') setNotes(parsed.notes)
          if (parsed.liveScraped) setLiveScraped(parsed.liveScraped)
          if (typeof parsed.title === 'string') setTitle(parsed.title)
          if (typeof parsed.slug === 'string') setSlug(parsed.slug)
          if (typeof parsed.price === 'number') setPrice(parsed.price)
          if (typeof parsed.originalPrice === 'number')
            setOriginalPrice(parsed.originalPrice)
          if (typeof parsed.isOnSale === 'boolean') setIsOnSale(parsed.isOnSale)
          if (typeof parsed.discountText === 'string')
            setDiscountText(parsed.discountText)
          if (typeof parsed.platformLabel === 'string')
            setPlatformLabel(parsed.platformLabel)
          if (Array.isArray(parsed.images)) setImages(parsed.images)
          if (typeof parsed.primaryImageIndex === 'number')
            setPrimaryImageIndex(parsed.primaryImageIndex)
          if (typeof parsed.videoUrl === 'string') setVideoUrl(parsed.videoUrl)
          if (typeof parsed.tags === 'string') setTags(parsed.tags)
          if (typeof parsed.description === 'string')
            setDescription(parsed.description)
          if (Array.isArray(parsed.specs)) setSpecs(parsed.specs)
          if (typeof parsed.destinationUrl === 'string')
            setDestinationUrl(parsed.destinationUrl)
        }
      }
    } catch (e) {
      console.error(
        'Failed to restore AI affiliate draft from localStorage:',
        e,
      )
    } finally {
      isRestoredRef.current = true
    }
  }, [DRAFT_KEY])

  // Debounced auto-save draft to localStorage
  useEffect(() => {
    if (!isRestoredRef.current) {
      return
    }

    const hasData = Boolean(
      productUrl.trim() ||
        rawTitle.trim() ||
        affiliateUrl.trim() ||
        notes.trim() ||
        title.trim() ||
        images.length > 0 ||
        step === 'preview',
    )

    if (!hasData) {
      return
    }

    const timer = setTimeout(() => {
      try {
        const draft = {
          step,
          productUrl,
          rawTitle,
          affiliateUrl,
          selectedCategoryId,
          platform,
          notes,
          liveScraped,
          title,
          slug,
          price,
          originalPrice,
          isOnSale,
          discountText,
          platformLabel,
          images,
          primaryImageIndex,
          videoUrl,
          tags,
          description,
          specs,
          destinationUrl,
        }
        localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
      } catch (err) {
        console.error('Failed to auto-save AI affiliate draft:', err)
      }
    }, 600)

    return () => clearTimeout(timer)
  }, [
    DRAFT_KEY,
    step,
    productUrl,
    rawTitle,
    affiliateUrl,
    selectedCategoryId,
    platform,
    notes,
    liveScraped,
    title,
    slug,
    price,
    originalPrice,
    isOnSale,
    discountText,
    platformLabel,
    images,
    primaryImageIndex,
    videoUrl,
    tags,
    description,
    specs,
    destinationUrl,
  ])

  const hasDraft = Boolean(
    productUrl.trim() ||
      rawTitle.trim() ||
      affiliateUrl.trim() ||
      notes.trim() ||
      title.trim() ||
      images.length > 0 ||
      step === 'preview',
  )

  const handleFullReset = () => {
    setStep('input')
    setProductUrl('')
    setRawTitle('')
    setAffiliateUrl('')
    setNotes('')
    setLiveScraped(null)
    setTitle('')
    setSlug('')
    setPrice(0)
    setOriginalPrice(0)
    setIsOnSale(false)
    setDiscountText('')
    setPlatform('SHOPEE')
    setPlatformLabel('')
    setImages([])
    setPrimaryImageIndex(0)
    setVideoUrl('')
    setTags('')
    setDescription('')
    setSpecs([])
    setDestinationUrl('')
    setNewImageUrl('')
    setIsAddingImageUrl(false)
  }

  const handleClearDraft = () => {
    try {
      localStorage.removeItem(DRAFT_KEY)
    } catch (e) {
      console.error(e)
    }
    handleFullReset()
    toast.success('ล้างข้อมูลแบบร่างเรียบร้อยแล้ว')
  }

  // Progress ticker during generation
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (generateMutation.isPending) {
      setLoadingStepIndex(1)
      timer = setTimeout(() => {
        setLoadingStepIndex(2)
      }, 2500)
    }
    return () => clearTimeout(timer)
  }, [generateMutation.isPending])

  const handleFetchLive = async (customUrl?: string) => {
    const raw = (customUrl || productUrl).trim()
    if (!raw) {
      toast.error(t('errNoUrl'))
      return
    }

    const parsed = parseMarketplaceInput(raw)
    const cleanUrl = parsed.url || raw

    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      toast.error(t('errInvalidUrl'))
      return
    }

    const toastId = toast.loading(t('fetchingLive'))
    try {
      const res = await scrapeMutation.mutateAsync(cleanUrl)
      if (res && res.success) {
        setLiveScraped(res)
        if (res.title) {
          setRawTitle(res.title)
        }
        if (res.platform && res.platform !== 'OTHER') {
          setPlatform(res.platform)
        }
        if (res.price && price === 0) {
          setPrice(res.price)
        }
        if (res.discountText && !discountText) {
          setDiscountText(res.discountText)
          setIsOnSale(true)
        }
        if (res.images && res.images.length > 0) {
          setImages(res.images)
        }
        if (res.videoUrl) {
          setVideoUrl(res.videoUrl)
        }
        toast.success(t('liveDataFound'), { id: toastId })
      } else {
        toast.error(
          'ไม่สามารถดึงข้อมูลจากเว็บได้ กรุณาระบุชื่อสินค้าด้วยตนเอง',
          {
            id: toastId,
          },
        )
      }
    } catch {
      toast.error('เกิดข้อผิดพลาดในการเชื่อมต่อกับเว็บสินค้า', { id: toastId })
    }
  }

  const handleUseLiveDirectly = () => {
    if (!liveScraped) return

    const cleanTitle = liveScraped.title || rawTitle || 'สินค้า Affiliate'
    setTitle(cleanTitle)

    const randomSuffix = Math.random().toString(36).substring(2, 7)
    const rawSlugCandidate = cleanTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
    const finalSlug = rawSlugCandidate
      ? `${rawSlugCandidate.slice(0, 30)}-${randomSuffix}`
      : `aff-${platform.toLowerCase()}-${Date.now().toString(36)}`
    setSlug(finalSlug)

    const livePrice = Number(liveScraped.price) || 0
    setPrice(livePrice)
    setOriginalPrice(livePrice)
    setIsOnSale(Boolean(liveScraped.discountText))
    setDiscountText(liveScraped.discountText || '')
    setPlatform(liveScraped.platform || platform)
    setPlatformLabel(liveScraped.platform || platform)

    const collectedImages = Array.from(
      new Set(
        [
          liveScraped.image,
          ...(liveScraped.images || []),
          ...images,
        ].filter(
          (img): img is string => typeof img === 'string' && Boolean(img),
        ),
      ),
    )
    setImages(collectedImages)
    setPrimaryImageIndex(0)
    setVideoUrl(liveScraped.videoUrl || '')
    setDescription(liveScraped.description || '')
    setDestinationUrl(
      affiliateUrl.trim() || liveScraped.finalUrl || productUrl.trim(),
    )

    setStep('preview')
    toast.success('นำเข้าข้อมูลโดยตรงเรียบร้อยแล้ว')
  }

  const handleUrlInputChange = (val: string) => {
    setProductUrl(val)
    const parsed = parseMarketplaceInput(val)

    if (parsed.url && parsed.url !== val) {
      setProductUrl(parsed.url)
    }

    if (parsed.title && !rawTitle) {
      setRawTitle(parsed.title)
    }

    if (parsed.platform && parsed.platform !== 'OTHER') {
      setPlatform(parsed.platform)
    }

    if (parsed.price && price === 0) {
      setPrice(parsed.price)
    }

    if (parsed.discountText && !discountText) {
      setDiscountText(parsed.discountText)
      setIsOnSale(true)
    }
  }

  const handleGenerate = async () => {
    if (!productUrl.trim() && !rawTitle.trim()) {
      toast.error(t('errEnterUrlOrTitle'))
      return
    }

    const parsed = parseMarketplaceInput(productUrl)
    const cleanUrl = parsed.url || productUrl.trim()

    try {
      const effectiveRawTitle =
        liveScraped?.title || rawTitle.trim() || parsed.title || undefined

      const res = await generateMutation.mutateAsync({
        url: cleanUrl,
        affiliateUrl: affiliateUrl.trim() || undefined,
        rawTitle: effectiveRawTitle,
        rawNotes: notes.trim() || undefined,
        storeId,
      })

      if (!res.success || !res.data) {
        toast.error(res.messageTH || res.message || t('generating'))
        return
      }

      const d = res.data
      setTitle(d.title || effectiveRawTitle || '')
      setSlug(d.slug || '')
      setPrice(d.price || liveScraped?.price || parsed.price || 0)
      setOriginalPrice(
        d.originalPrice || d.price || liveScraped?.price || parsed.price || 0,
      )
      setIsOnSale(
        Boolean(d.isOnSale || liveScraped?.discountText || parsed.discountText),
      )
      setDiscountText(
        d.discountText ||
          liveScraped?.discountText ||
          parsed.discountText ||
          '',
      )
      setPlatform(d.platform || liveScraped?.platform || platform)
      setPlatformLabel(d.platformLabel || '')

      const collectedImages = Array.from(
        new Set(
          [
            d.imageUrl,
            ...(Array.isArray(d.images) ? d.images : []),
            ...(liveScraped?.images || []),
            liveScraped?.image,
          ].filter(
            (img): img is string => typeof img === 'string' && Boolean(img),
          ),
        ),
      )
      setImages(collectedImages)
      setPrimaryImageIndex(0)

      setVideoUrl(d.videoUrl || liveScraped?.videoUrl || videoUrl || '')
      setTags(d.tags || '')
      setDescription(d.description || liveScraped?.description || '')
      setSpecs(d.metadata || [])
      setDestinationUrl(d.affiliateUrl || cleanUrl)

      setStep('preview')
    } catch {
      toast.error(t('generating'))
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const uploadToast = toast.loading('กำลังอัปโหลดรูปภาพ...')
    try {
      const uploadedUrls: string[] = []
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const formData = new FormData()
        formData.append('file', file)
        const res = await uploadImageMutation.mutateAsync(formData)
        if (res?.success && res.url) {
          uploadedUrls.push(res.url)
        }
      }

      if (uploadedUrls.length > 0) {
        setImages((prev) => [...prev, ...uploadedUrls])
        toast.success(`อัปโหลดสำเร็จ ${uploadedUrls.length} รูปภาพ`, {
          id: uploadToast,
        })
      } else {
        toast.error('อัปโหลดรูปภาพไม่สำเร็จ', { id: uploadToast })
      }
    } catch {
      toast.error('เกิดข้อผิดพลาดในการอัปโหลด', { id: uploadToast })
    } finally {
      if (imageFileInputRef.current) {
        imageFileInputRef.current.value = ''
      }
    }
  }

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const uploadToast = toast.loading('กำลังอัปโหลดวิดีโอ...')
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await uploadVideoMutation.mutateAsync(formData)
      if (res?.success && res.url) {
        setVideoUrl(res.url)
        toast.success('อัปโหลดวิดีโอสำเร็จ', { id: uploadToast })
      } else {
        toast.error('อัปโหลดวิดีโอไม่สำเร็จ', { id: uploadToast })
      }
    } catch {
      toast.error('เกิดข้อผิดพลาดในการอัปโหลดวิดีโอ', { id: uploadToast })
    } finally {
      if (videoFileInputRef.current) {
        videoFileInputRef.current.value = ''
      }
    }
  }

  const handleAddImageUrl = () => {
    const trimmed = newImageUrl.trim()
    if (!trimmed) return
    if (!images.includes(trimmed)) {
      setImages((prev) => [...prev, trimmed])
    }
    setNewImageUrl('')
    setIsAddingImageUrl(false)
  }

  const handleSetPrimary = (targetIndex: number) => {
    setPrimaryImageIndex(targetIndex)
  }

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
    if (primaryImageIndex === index) {
      setPrimaryImageIndex(0)
    } else if (primaryImageIndex > index) {
      setPrimaryImageIndex((prev) => prev - 1)
    }
  }

  const handleAddSpec = () => {
    setSpecs((prev) => [...prev, { key: '', value: '' }])
  }

  const handleRemoveSpec = (idx: number) => {
    setSpecs((prev) => prev.filter((_, i) => i !== idx))
  }

  const handleUpdateSpec = (
    idx: number,
    field: 'key' | 'value',
    val: string,
  ) => {
    setSpecs((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [field]: val } : item)),
    )
  }

  const handleSaveProduct = async () => {
    if (!title.trim()) {
      toast.error(t('errTitleRequired'))
      return
    }

    if (price < 0) {
      toast.error(t('errPriceNonNegative'))
      return
    }

    if (!selectedCategoryId) {
      toast.error(t('errCategoryRequired'))
      return
    }

    const saveToast = toast.loading(t('btnSaving'))
    try {
      const finalDiscountActive = isOnSale && originalPrice > price
      const discountDiff = Math.max(0, originalPrice - price)

      const affiliateProductLinks = [
        {
          id: `aff-${Date.now()}`,
          platform,
          url: destinationUrl.trim() || productUrl.trim(),
          label: platformLabel.trim() || undefined,
          price: Number(price),
          originalPrice: Number(originalPrice),
          isDiscounted: isOnSale,
          discountText: discountText.trim() || undefined,
        },
      ]

      const cleanedSpecs = specs.filter(
        (s) =>
          s.key.trim().length > 0 &&
          s.value.trim().length > 0 &&
          s.key !== 'videoUrl' &&
          s.key !== 'description',
      )

      if (videoUrl.trim()) {
        cleanedSpecs.push({ key: 'videoUrl', value: videoUrl.trim() })
      }

      // Generate clean kebab-case slug
      let cleanSlug = slug
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')

      if (!cleanSlug) {
        cleanSlug = `aff-${platform.toLowerCase()}-${Date.now().toString(36)}`
      }

      // Upload external images to Cloudflare R2 if any
      let finalUploadedUrls = images
      const externalImages = images.filter(
        (url) =>
          !url.includes('images.sitepow.store') &&
          (url.startsWith('http://') || url.startsWith('https://')),
      )

      if (externalImages.length > 0) {
        toast.loading(
          `กำลังนำเข้ารูปภาพ ${externalImages.length} ภาพขึ้น Cloudflare R2...`,
          { id: saveToast },
        )
        try {
          finalUploadedUrls = await uploadExternalImagesMutation.mutateAsync({
            urls: images,
            folder: `store/${storeId}/products`,
          })
        } catch (uploadErr) {
          console.warn('Failed to upload external images to R2:', uploadErr)
        }
      }

      const productImages = finalUploadedUrls.map((url, idx) => ({
        url,
        isPrimary: idx === primaryImageIndex,
      }))

      const finalImages = productImages.length > 0 ? productImages : []
      const targetBranchId = defaultBranchId || ''

      const finalDescription = description.trim()
      const descMetadata = finalDescription
        ? [{ key: 'description', value: finalDescription }]
        : []

      const allMetadata = [...cleanedSpecs, ...descMetadata]

      const productPayload: CreateProductInput = {
        storeId,
        categoryId: selectedCategoryId,
        title: title.trim(),
        slug: cleanSlug,
        productType: ProductType.AFFILIATE_LINK,
        isPublished: true,
        tags: tags.trim() || undefined,
        images: finalImages,
        metadata: allMetadata.length > 0 ? allMetadata : undefined,
        affiliateLinks: affiliateProductLinks,
        variants: [
          {
            title: 'Standard',
            price: Number(price),
            costPrice: 0,
            sku: `AFF-${platform.substring(0, 3)}-${Date.now().toString(36).toUpperCase()}`,
            digitalUrl: destinationUrl.trim() || productUrl.trim(),
            weight: 0,
            width: 0,
            height: 0,
            length: 0,
            discount: {
              active: finalDiscountActive,
              type: 'FIXED',
              amount: discountDiff,
            },
            rewardPoints: { isActive: false, amount: 0 },
            isAvailable: true,
            stocks: targetBranchId
              ? [
                  {
                    branchId: targetBranchId,
                    quantity: 999,
                    minStock: 0,
                  },
                ]
              : [],
          },
        ],
      }

      createProductMutation.mutate(productPayload, {
        onSuccess: (res) => {
          if (res?.success) {
            toast.success(t('btnSavedSuccess'), { id: saveToast })
            try {
              localStorage.removeItem(DRAFT_KEY)
            } catch (e) {
              console.error(e)
            }
            onOpenChange(false)
            handleFullReset()
            onSuccess?.()
          } else {
            toast.error(res?.message || t('errSaveFailed'), {
              id: saveToast,
            })
          }
        },
        onError: (err) => {
          toast.error(err.message || t('errSaveFailed'), { id: saveToast })
        },
      })
    } catch {
      toast.error(t('errSaveFailed'), { id: saveToast })
    }
  }

  return {
    t,
    currentStore,
    store,
    categories,
    step,
    setStep,
    productUrl,
    setProductUrl,
    rawTitle,
    setRawTitle,
    affiliateUrl,
    setAffiliateUrl,
    selectedCategoryId,
    setSelectedCategoryId,
    platform,
    setPlatform,
    notes,
    setNotes,
    liveScraped,
    loadingStepIndex,
    title,
    setTitle,
    slug,
    setSlug,
    price,
    setPrice,
    originalPrice,
    setOriginalPrice,
    isOnSale,
    setIsOnSale,
    discountText,
    setDiscountText,
    platformLabel,
    setPlatformLabel,
    images,
    primaryImageIndex,
    videoUrl,
    setVideoUrl,
    tags,
    setTags,
    description,
    setDescription,
    specs,
    destinationUrl,
    setDestinationUrl,
    newImageUrl,
    setNewImageUrl,
    isAddingImageUrl,
    setIsAddingImageUrl,
    hasDraft,
    imageFileInputRef,
    videoFileInputRef,
    isGenerating: generateMutation.isPending,
    isScraping: scrapeMutation.isPending,
    isSaving: createProductMutation.isPending,
    isUploadingImage: uploadImageMutation.isPending,
    isUploadingVideo: uploadVideoMutation.isPending,
    handleUrlInputChange,
    handleFetchLive,
    handleUseLiveDirectly,
    handleGenerate,
    handleImageUpload,
    handleVideoUpload,
    handleAddImageUrl,
    handleSetPrimary,
    handleRemoveImage,
    handleAddSpec,
    handleRemoveSpec,
    handleUpdateSpec,
    handleSaveProduct,
    handleFullReset,
    handleClearDraft,
  }
}
