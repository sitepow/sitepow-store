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
import { ProductType } from '@/generated/prisma/enums'
import { useCurrentStore } from '@/hooks/use-current-store'
import {
  AFFILIATE_PLATFORM_CONFIG,
  AffiliatePlatform,
  parseMarketplaceInput,
} from '@/types/affiliate-product'
import {
  IconArrowLeft,
  IconCheck,
  IconExternalLink,
  IconLoader2,
  IconPhoto,
  IconPlayerPlay,
  IconPlus,
  IconSparkles,
  IconStar,
  IconStarFilled,
  IconTag,
  IconTrash,
  IconUpload,
  IconVideo,
  IconWorld,
} from '@tabler/icons-react'

import { DialogHeaderIcon } from '@/components/DialogHeaderIcon'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from '@/components/ui/dialog'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'

interface AiAffiliateProductDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  storeId: string
  onSuccess?: () => void
}

const PLATFORM_OPTIONS: { value: AffiliatePlatform; label: string }[] = [
  { value: 'SHOPEE', label: 'Shopee' },
  { value: 'LAZADA', label: 'Lazada' },
  { value: 'TIKTOK', label: 'TikTok Shop' },
  { value: 'OTHER', label: 'Other / ร้านค้าทั่วไป' },
]

export function AiAffiliateProductDialog({
  open,
  onOpenChange,
  storeId,
  onSuccess,
}: AiAffiliateProductDialogProps) {
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
    setSlug(`aff-${platform.toLowerCase()}-${Date.now().toString(36)}`)
    setPrice(liveScraped.price || 0)
    setOriginalPrice(liveScraped.price || 0)
    setIsOnSale(Boolean(liveScraped.discountText))
    setDiscountText(liveScraped.discountText || '')
    setPlatform(liveScraped.platform || platform)
    setPlatformLabel(liveScraped.platform || '')

    const collectedImages = Array.from(
      new Set(
        [liveScraped.image, ...(liveScraped.images || [])].filter(
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
  }

  // Handle smart input pasting: auto-detect link, title, price, discount
  const handleUrlInputChange = (val: string) => {
    setProductUrl(val)
    const parsed = parseMarketplaceInput(val)

    if (parsed.url && parsed.url !== val) {
      // The user pasted a share message containing a URL + text!
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

  const handleStartGenerate = async () => {
    const trimmedInput = productUrl.trim()
    if (!trimmedInput) {
      toast.error(t('errNoUrl'))
      return
    }

    const parsed = parseMarketplaceInput(trimmedInput)
    const cleanUrl = parsed.url || trimmedInput

    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      toast.error(t('errInvalidUrl'))
      return
    }

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

  const handleRemoveImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx))
    if (primaryImageIndex >= idx && primaryImageIndex > 0) {
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

      toast.loading(t('btnSaving'), { id: saveToast })

      // Prepare images with primary tag
      const productImages = finalUploadedUrls.map((url, i) => ({
        url,
        isPrimary: i === primaryImageIndex,
      }))

      const finalImages = productImages.length > 0 ? productImages : []

      const targetBranchId =
        defaultBranchId ||
        branches.find((b) => b.isMain)?.id ||
        branches[0]?.id ||
        ''

      const res = await createProductMutation.mutateAsync({
        storeId,
        categoryId: selectedCategoryId,
        title: title.trim(),
        slug: cleanSlug,
        tags: tags.trim() || undefined,
        description: description.trim() || undefined,
        isPublished: true,
        productType: ProductType.AFFILIATE_LINK,
        images: finalImages,
        metadata: cleanedSpecs.length > 0 ? cleanedSpecs : undefined,
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
            stocks: [
              {
                branchId: targetBranchId,
                quantity: 999,
                minStock: 0,
              },
            ],
          },
        ],
      })

      if (res.success) {
        toast.success(res.messageTH || t('successToast'), { id: saveToast })
        handleFullReset()
        onOpenChange(false)
        onSuccess?.()
      } else {
        toast.error(res.messageTH || res.message || 'Error', { id: saveToast })
      }
    } catch (err: any) {
      toast.error(err?.message || 'Error creating product', { id: saveToast })
    }
  }

  const platformCfg =
    AFFILIATE_PLATFORM_CONFIG[platform] || AFFILIATE_PLATFORM_CONFIG.OTHER

  const primaryImageSrc = images[primaryImageIndex] || images[0]

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) handleFullReset()
        onOpenChange(isOpen)
      }}
    >
      <DialogContent
        style={
          {
            '--primary': currentStore?.primaryColor ?? store?.primaryColor,
          } as React.CSSProperties
        }
        className="flex max-h-[92vh] w-[calc(100vw-1.5rem)] flex-col gap-0 overflow-hidden p-0 sm:max-h-[90vh] sm:w-full sm:max-w-3xl"
      >
        <DialogHeader className="bg-muted/20 border-b p-4 text-left sm:p-6">
          <div className="flex flex-col items-center gap-2.5">
            <DialogHeaderIcon
              icon={IconSparkles}
              title={t('title')}
              description={t('description')}
              className="pr-6 sm:pr-0"
            />

            <div className="hidden items-center gap-2 pr-8 text-xs font-medium sm:flex">
              <span
                className={`rounded-full border px-2.5 py-1 transition-colors ${
                  step === 'input'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-background text-muted-foreground'
                }`}
              >
                {t('step1')}
              </span>
              <span className="text-muted-foreground">→</span>
              <span
                className={`rounded-full border px-2.5 py-1 transition-colors ${
                  step === 'preview'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-background text-muted-foreground'
                }`}
              >
                {t('step2', {
                  title: title ? title.slice(0, 16) + '...' : 'Preview',
                })}
              </span>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {step === 'input' ? (
            <div className="space-y-4">
              {generateMutation.isPending ? (
                <Card className="border-primary/30 bg-primary/5 py-8 text-center">
                  <CardContent className="flex flex-col items-center justify-center space-y-4">
                    <div className="bg-primary/10 text-primary relative flex h-14 w-14 items-center justify-center rounded-full">
                      <IconSparkles className="h-7 w-7 animate-pulse" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-foreground text-base font-semibold">
                        {t('loadingTitle')}
                      </h4>
                      <p className="text-muted-foreground text-sm">
                        {loadingStepIndex === 1
                          ? t('loadingStep1')
                          : t('loadingStep2')}
                      </p>
                    </div>
                    <div className="text-primary flex items-center gap-2 text-xs">
                      <IconLoader2 className="h-4 w-4 animate-spin" />
                      <span>{t('generating')}</span>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <>
                  <Field>
                    <FieldLabel className="flex items-center justify-between">
                      <span>{t('productUrlLabel')} *</span>
                      <div className="flex items-center gap-1.5">
                        <Badge
                          variant="outline"
                          className="bg-[#EE4D2D]/10 text-[10px] text-[#EE4D2D]"
                        >
                          Shopee
                        </Badge>
                        <Badge
                          variant="outline"
                          className="bg-[#0F146D]/10 text-[10px] text-[#0F146D] dark:text-blue-400"
                        >
                          Lazada
                        </Badge>
                        <Badge
                          variant="outline"
                          className="bg-black/10 text-[10px] text-black dark:bg-white/10 dark:text-white"
                        >
                          TikTok Shop
                        </Badge>
                      </div>
                    </FieldLabel>
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        placeholder={t('productUrlPlaceholder')}
                        value={productUrl}
                        onChange={(e) => handleUrlInputChange(e.target.value)}
                        autoFocus
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        disabled={
                          !productUrl.trim() || scrapeMutation.isPending
                        }
                        onClick={() => handleFetchLive()}
                        className="shrink-0 gap-1.5"
                      >
                        {scrapeMutation.isPending ? (
                          <>
                            <IconLoader2 className="h-4 w-4 animate-spin" />
                            <span className="hidden sm:inline">
                              {t('fetchingLive')}
                            </span>
                          </>
                        ) : (
                          <>
                            <IconWorld className="h-4 w-4 text-emerald-500" />
                            <span>{t('fetchLiveBtn')}</span>
                          </>
                        )}
                      </Button>
                    </div>
                    <p className="text-muted-foreground text-xs">
                      {t('productUrlHelp')}
                    </p>
                  </Field>

                  {/* Live Web Data Card Preview */}
                  {liveScraped && (
                    <div className="space-y-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                          <IconCheck className="h-4 w-4" />
                          <span>
                            {t('liveDataFound')} ({liveScraped.platform})
                          </span>
                        </div>
                        {liveScraped.price ? (
                          <Badge variant="secondary" className="font-semibold">
                            ฿{liveScraped.price.toLocaleString()}
                          </Badge>
                        ) : null}
                      </div>

                      <div className="flex items-center gap-3">
                        {liveScraped.image && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={liveScraped.image}
                            alt={liveScraped.title || ''}
                            className="bg-background h-16 w-16 shrink-0 rounded-lg border object-cover"
                          />
                        )}
                        <div className="min-w-0 flex-1 space-y-1">
                          <p className="truncate text-sm leading-tight font-semibold">
                            {liveScraped.title}
                          </p>
                          <p className="text-muted-foreground line-clamp-2 text-xs">
                            {liveScraped.description ||
                              'ตรวจพบข้อมูลสเปกและรายละเอียดสินค้าครบถ้วนจากหน้าเว็บจริง'}
                          </p>
                          <div className="text-muted-foreground flex items-center gap-2 pt-0.5 text-[11px]">
                            <span>
                              {t('liveImagesCount', {
                                count: liveScraped.images.length || 1,
                              })}
                            </span>
                            {liveScraped.videoUrl && <span>• มีวิดีโอ</span>}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 border-t border-emerald-500/20 pt-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleUseLiveDirectly}
                          className="h-8 gap-1.5 text-xs"
                        >
                          <span>{t('useDirectlyBtn')}</span>
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          onClick={handleStartGenerate}
                          disabled={generateMutation.isPending}
                          className="h-8 gap-1.5 text-xs"
                        >
                          <IconSparkles className="h-3.5 w-3.5" />
                          <span>{t('generateBtn')}</span>
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Product Title / Information */}
                  <Field>
                    <FieldLabel>{t('rawTitleLabel')}</FieldLabel>
                    <Input
                      placeholder={t('rawTitlePlaceholder')}
                      value={rawTitle}
                      onChange={(e) => setRawTitle(e.target.value)}
                    />
                  </Field>

                  <Field>
                    <FieldLabel>{t('affiliateUrlLabel')}</FieldLabel>
                    <Input
                      type="url"
                      placeholder={t('affiliateUrlPlaceholder')}
                      value={affiliateUrl}
                      onChange={(e) => setAffiliateUrl(e.target.value)}
                    />
                    <p className="text-muted-foreground text-xs">
                      {t('affiliateUrlHelp')}
                    </p>
                  </Field>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field>
                      <FieldLabel>{t('categoryLabel')} *</FieldLabel>
                      <Select
                        value={selectedCategoryId}
                        onValueChange={setSelectedCategoryId}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t('categoryPlaceholder')} />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>

                    <Field>
                      <FieldLabel>{t('fieldPlatform')}</FieldLabel>
                      <Select
                        value={platform}
                        onValueChange={(val) =>
                          setPlatform(val as AffiliatePlatform)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PLATFORM_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                  </div>

                  <Field>
                    <FieldLabel>{t('notesLabel')}</FieldLabel>
                    <Textarea
                      placeholder={t('notesPlaceholder')}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={2}
                    />
                  </Field>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Product Visual Card Preview */}
              <div className="bg-muted/20 flex flex-col gap-4 rounded-xl border p-4 sm:flex-row sm:items-center">
                <div className="bg-background relative flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-lg border">
                  {primaryImageSrc ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={primaryImageSrc}
                      alt={title}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        ;(e.target as HTMLElement).style.display = 'none'
                      }}
                    />
                  ) : (
                    <IconPhoto className="text-muted-foreground/50 h-8 w-8" />
                  )}
                  {videoUrl && (
                    <span className="absolute right-1 bottom-1 rounded-full bg-black/70 p-1 text-white">
                      <IconPlayerPlay className="h-3.5 w-3.5" />
                    </span>
                  )}
                </div>

                <div className="flex-1 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-semibold ${platformCfg.badgeClass}`}
                    >
                      {platformCfg.name}
                    </span>
                    {isOnSale && (
                      <Badge variant="destructive" className="text-xs">
                        {discountText || 'ลดราคา'}
                      </Badge>
                    )}
                    {videoUrl && (
                      <Badge variant="secondary" className="gap-1 text-xs">
                        <IconVideo className="h-3 w-3" />
                        มีวิดีโอ
                      </Badge>
                    )}
                  </div>

                  <h3 className="text-foreground line-clamp-2 text-base font-medium">
                    {title || 'ชื่อสินค้า'}
                  </h3>

                  <div className="flex items-baseline gap-2">
                    <span className="text-primary text-lg font-bold">
                      ฿{Number(price).toLocaleString()}
                    </span>
                    {isOnSale && originalPrice > price && (
                      <span className="text-muted-foreground text-xs line-through">
                        ฿{Number(originalPrice).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Product Media Gallery & Video Section */}
              <div className="space-y-4 rounded-xl border p-4">
                <div className="flex items-center justify-between">
                  <h4 className="flex items-center gap-1.5 text-sm font-semibold">
                    <IconPhoto className="text-primary h-4 w-4" />
                    <span>{t('imagesTitle', { count: images.length })}</span>
                  </h4>
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      ref={imageFileInputRef}
                      onChange={handleImageUpload}
                      accept="image/*"
                      multiple
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => imageFileInputRef.current?.click()}
                      disabled={uploadImageMutation.isPending}
                      className="h-7 text-xs"
                    >
                      <IconUpload className="mr-1 h-3.5 w-3.5" />
                      {t('uploadImageBtn')}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsAddingImageUrl(!isAddingImageUrl)}
                      className="h-7 text-xs"
                    >
                      <IconPlus className="mr-1 h-3.5 w-3.5" />
                      {t('addImageUrlBtn')}
                    </Button>
                  </div>
                </div>

                {/* Inline URL adder */}
                {isAddingImageUrl && (
                  <div className="flex items-center gap-2">
                    <Input
                      type="url"
                      placeholder="https://... (URL รูปภาพ)"
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      className="h-8 text-xs"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAddImageUrl()
                      }}
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleAddImageUrl}
                      className="h-8 text-xs"
                    >
                      เพิ่ม
                    </Button>
                  </div>
                )}

                {/* Images grid */}
                <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-6">
                  {images.map((img, idx) => (
                    <div
                      key={idx}
                      className={`group bg-muted/20 relative flex aspect-square flex-col items-center justify-center overflow-hidden rounded-lg border ${
                        primaryImageIndex === idx
                          ? 'border-primary ring-primary/40 ring-2'
                          : 'border-border'
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img}
                        alt={`image-${idx}`}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          ;(e.target as HTMLElement).style.display = 'none'
                        }}
                      />

                      {/* Primary badge or select button */}
                      {primaryImageIndex === idx ? (
                        <span className="bg-primary absolute top-1 left-1 rounded px-1 py-0.5 text-[10px] font-medium text-white shadow">
                          {t('primaryBadge')}
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setPrimaryImageIndex(idx)}
                          title={t('setPrimaryImage')}
                          className="hover:bg-primary absolute top-1 left-1 rounded bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                        >
                          <IconStar className="h-3.5 w-3.5" />
                        </button>
                      )}

                      {/* Delete image button */}
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="text-destructive hover:bg-destructive absolute top-1 right-1 rounded bg-black/60 p-1 opacity-0 transition-opacity group-hover:opacity-100 hover:text-white"
                      >
                        <IconTrash className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}

                  {images.length === 0 && (
                    <div className="text-muted-foreground col-span-full flex flex-col items-center justify-center py-6 text-center text-xs">
                      <IconPhoto className="mb-1 h-8 w-8 opacity-40" />
                      <span>
                        ยังไม่มีรูปภาพสินค้า
                        สามารถกดอัปโหลดหรือเพิ่มลิงก์รูปภาพได้
                      </span>
                    </div>
                  )}
                </div>

                {/* Video section */}
                <div className="space-y-2 border-t pt-3">
                  <div className="flex items-center justify-between">
                    <FieldLabel className="flex items-center gap-1.5">
                      <IconVideo className="text-primary h-4 w-4" />
                      <span>{t('videoTitle')}</span>
                    </FieldLabel>
                    <div>
                      <input
                        type="file"
                        ref={videoFileInputRef}
                        onChange={handleVideoUpload}
                        accept="video/*"
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => videoFileInputRef.current?.click()}
                        disabled={uploadVideoMutation.isPending}
                        className="h-7 text-xs"
                      >
                        <IconUpload className="mr-1 h-3.5 w-3.5" />
                        {t('uploadVideoBtn')}
                      </Button>
                    </div>
                  </div>

                  <Input
                    type="url"
                    placeholder={t('videoPlaceholder')}
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    className="text-xs"
                  />

                  {/* Video preview player */}
                  {videoUrl && (
                    <div className="mt-2 overflow-hidden rounded-lg border bg-black">
                      {videoUrl.includes('.mp4') ||
                      videoUrl.includes('.webm') ||
                      videoUrl.includes('r2.dev') ||
                      videoUrl.includes('cloudflare') ? (
                        <video
                          src={videoUrl}
                          controls
                          className="max-h-56 w-full object-contain"
                        />
                      ) : videoUrl.includes('tiktok.com/embed') ? (
                        <iframe
                          src={videoUrl}
                          className="h-56 w-full border-0"
                          allowFullScreen
                        />
                      ) : (
                        <div className="flex items-center justify-between p-3 text-xs text-white">
                          <span className="truncate">{videoUrl}</span>
                          <a
                            href={videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary flex items-center gap-1 underline"
                          >
                            <span>เปิดดูวิดีโอ</span>
                            <IconExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Editable Form Controls */}
              <div className="space-y-4">
                <Field>
                  <FieldLabel>{t('fieldTitle')} *</FieldLabel>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </Field>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field>
                    <FieldLabel>{t('fieldSlug')}</FieldLabel>
                    <Input
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                    />
                  </Field>

                  <Field>
                    <FieldLabel>{t('categoryLabel')} *</FieldLabel>
                    <Select
                      value={selectedCategoryId}
                      onValueChange={setSelectedCategoryId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('categoryPlaceholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                </div>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <Field>
                    <FieldLabel>{t('fieldPrice')} *</FieldLabel>
                    <Input
                      type="number"
                      min={0}
                      value={price}
                      onChange={(e) =>
                        setPrice(parseFloat(e.target.value) || 0)
                      }
                    />
                  </Field>

                  <Field>
                    <FieldLabel>{t('fieldOriginalPrice')}</FieldLabel>
                    <Input
                      type="number"
                      min={0}
                      value={originalPrice}
                      onChange={(e) =>
                        setOriginalPrice(parseFloat(e.target.value) || 0)
                      }
                    />
                  </Field>

                  <Field>
                    <FieldLabel>{t('fieldPlatform')}</FieldLabel>
                    <Select
                      value={platform}
                      onValueChange={(val) =>
                        setPlatform(val as AffiliatePlatform)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PLATFORM_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>

                  <Field>
                    <FieldLabel>{t('fieldPlatformLabel')}</FieldLabel>
                    <Input
                      placeholder="Shopee Mall, LazMall"
                      value={platformLabel}
                      onChange={(e) => setPlatformLabel(e.target.value)}
                    />
                  </Field>
                </div>

                <div className="flex flex-wrap items-center gap-6 rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={isOnSale}
                      onCheckedChange={setIsOnSale}
                      id="isOnSaleSwitch"
                    />
                    <label
                      htmlFor="isOnSaleSwitch"
                      className="cursor-pointer text-sm font-medium"
                    >
                      {t('fieldIsOnSale')}
                    </label>
                  </div>

                  {isOnSale && (
                    <div className="flex-1">
                      <Input
                        placeholder={t('fieldDiscountText')}
                        value={discountText}
                        onChange={(e) => setDiscountText(e.target.value)}
                        className="h-8 text-xs"
                      />
                    </div>
                  )}
                </div>

                <Field>
                  <FieldLabel>{t('affiliateUrlLabel')}</FieldLabel>
                  <Input
                    type="url"
                    value={destinationUrl}
                    onChange={(e) => setDestinationUrl(e.target.value)}
                  />
                </Field>

                <Field>
                  <FieldLabel>{t('fieldTags')}</FieldLabel>
                  <Input
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="เก้าอี้เพื่อสุขภาพ, ergonomic, WFH"
                  />
                </Field>

                <Field>
                  <FieldLabel>{t('fieldDescription')}</FieldLabel>
                  <Textarea
                    rows={8}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="text-xs leading-relaxed"
                  />
                </Field>

                {/* Specifications / Metadata */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <FieldLabel>{t('fieldSpecs')}</FieldLabel>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddSpec}
                      className="h-7 text-xs"
                    >
                      <IconPlus className="mr-1 h-3.5 w-3.5" />
                      {t('addSpec')}
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {specs.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <Input
                          placeholder={t('specKey')}
                          value={item.key}
                          onChange={(e) =>
                            handleUpdateSpec(idx, 'key', e.target.value)
                          }
                          className="w-1/3 text-xs"
                        />
                        <Input
                          placeholder={t('specValue')}
                          value={item.value}
                          onChange={(e) =>
                            handleUpdateSpec(idx, 'value', e.target.value)
                          }
                          className="flex-1 text-xs"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveSpec(idx)}
                          className="text-destructive h-8 w-8"
                        >
                          <IconTrash className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="bg-muted/10 border-t p-4 sm:p-6">
          {step === 'input' ? (
            <div className="flex w-full items-center justify-end gap-2">
              <Button
                variant="outline"
                disabled={generateMutation.isPending}
                onClick={() => {
                  handleFullReset()
                  onOpenChange(false)
                }}
              >
                {t('btnBack')}
              </Button>
              <Button
                disabled={!productUrl.trim() || generateMutation.isPending}
                onClick={handleStartGenerate}
                className="gap-2"
              >
                {generateMutation.isPending ? (
                  <>
                    <IconLoader2 className="h-4 w-4 animate-spin" />
                    <span>{t('generating')}</span>
                  </>
                ) : (
                  <>
                    <IconSparkles className="h-4 w-4" />
                    <span>{t('generateBtn')}</span>
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="flex w-full items-center justify-between gap-2">
              <Button
                variant="outline"
                disabled={
                  createProductMutation.isPending ||
                  uploadExternalImagesMutation.isPending
                }
                onClick={() => setStep('input')}
                className="gap-1.5"
              >
                <IconArrowLeft className="h-4 w-4" />
                {t('btnBack')}
              </Button>
              <Button
                disabled={
                  createProductMutation.isPending ||
                  uploadExternalImagesMutation.isPending ||
                  !title.trim()
                }
                onClick={handleSaveProduct}
                className="gap-2"
              >
                {createProductMutation.isPending ||
                uploadExternalImagesMutation.isPending ? (
                  <>
                    <IconLoader2 className="h-4 w-4 animate-spin" />
                    <span>{t('btnSaving')}</span>
                  </>
                ) : (
                  <>
                    <IconCheck className="h-4 w-4" />
                    <span>{t('btnSave')}</span>
                  </>
                )}
              </Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
