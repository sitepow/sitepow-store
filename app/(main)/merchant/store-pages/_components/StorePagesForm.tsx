'use client'

import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'

import { useLocale, useTranslations } from 'next-intl'

import { estimateStorePageAiCost } from '@/actions/ai'
import { useStorePageAi } from '@/actions/hooks/ai'
import { useStorePages, useUpdateStorePages } from '@/actions/hooks/store-pages'
import {
  ABOUT_PAGE,
  FAQ_PAGE,
  HOW_TO_ORDER_PAGE,
  PRIVATE_POLICY_PAGE,
  REFUND_POLICY_PAGE,
} from '@/constants/sites/page'
import { useCurrentStore } from '@/hooks/use-current-store'
import { getStoreUrl } from '@/utils/storefront-seo'
import {
  IconBrandDiscord,
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandLine,
  IconBrandTiktok,
  IconBrandYoutube,
  IconCopyright,
  IconDeviceFloppy,
  IconExternalLink,
  IconFileDescription,
  IconFileText,
  IconHelpCircle,
  IconInfoCircle,
  IconLayoutBottombar,
  IconMessageDots,
  IconPhone,
  IconReceiptRefund,
  IconRefresh,
  IconShieldLock,
  IconSparkles,
} from '@tabler/icons-react'

import BlogEditor from '@/components/BlogEditor'
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'

import { cn } from '@/lib/utils'

type PageKey =
  | 'aboutPage'
  | 'faqsPage'
  | 'descriptionPage'
  | 'privacyPolicyPage'
  | 'refundPolicyPage'

const PAGE_CONFIGS = [
  {
    id: 'about',
    key: 'aboutPage' as const,
    labelKey: 'pages.about.label',
    descKey: 'pages.about.description',
    path: '/about',
    icon: IconInfoCircle,
    defaultTemplate: ABOUT_PAGE,
  },
  {
    id: 'faqs',
    key: 'faqsPage' as const,
    labelKey: 'pages.faqs.label',
    descKey: 'pages.faqs.description',
    path: '/faqs',
    icon: IconHelpCircle,
    defaultTemplate: FAQ_PAGE,
  },
  {
    id: 'description',
    key: 'descriptionPage' as const,
    labelKey: 'pages.description.label',
    descKey: 'pages.description.description',
    path: '/description',
    icon: IconFileText,
    defaultTemplate: HOW_TO_ORDER_PAGE,
  },
  {
    id: 'privacy-policy',
    key: 'privacyPolicyPage' as const,
    labelKey: 'pages.privacyPolicy.label',
    descKey: 'pages.privacyPolicy.description',
    path: '/privacy-policy',
    icon: IconShieldLock,
    defaultTemplate: PRIVATE_POLICY_PAGE,
  },
  {
    id: 'refund-return-policy',
    key: 'refundPolicyPage' as const,
    labelKey: 'pages.refundPolicy.label',
    descKey: 'pages.refundPolicy.description',
    path: '/refund-return-policy',
    icon: IconReceiptRefund,
    defaultTemplate: REFUND_POLICY_PAGE,
  },
] as const

interface StorePagesFormProps {
  storeId: string
}

export function StorePagesForm({ storeId }: StorePagesFormProps) {
  const t = useTranslations('merchant.storePages')
  const locale = useLocale()
  const { currentStore } = useCurrentStore()
  const { data: storePages, isLoading } = useStorePages(storeId)
  const updateMutation = useUpdateStorePages()

  const [activeTab, setActiveTab] = useState<string>(PAGE_CONFIGS[0].id)
  const [contents, setContents] = useState<Record<PageKey, string>>({
    aboutPage: '',
    faqsPage: '',
    descriptionPage: '',
    privacyPolicyPage: '',
    refundPolicyPage: '',
  })
  const [resetKeys, setResetKeys] = useState<Record<string, number>>({})

  // Footer state
  const [footerData, setFooterData] = useState({
    footerText: '',
    footerCopyright: '',
    phone: '',
    facebookPage: '',
    lineId: '',
    instagramPage: '',
    tiktokPage: '',
    messengerUrl: '',
    discordUrl: '',
    youtubePage: '',
  })

  // Initialize content when storePages loads or changes
  useEffect(() => {
    if (storePages) {
      setContents({
        aboutPage: storePages.aboutPage ?? ABOUT_PAGE,
        faqsPage: storePages.faqsPage ?? FAQ_PAGE,
        descriptionPage: storePages.descriptionPage ?? HOW_TO_ORDER_PAGE,
        privacyPolicyPage: storePages.privacyPolicyPage ?? PRIVATE_POLICY_PAGE,
        refundPolicyPage: storePages.refundPolicyPage ?? REFUND_POLICY_PAGE,
      })

      setFooterData({
        footerText: storePages.footerText ?? storePages.description ?? '',
        footerCopyright: storePages.footerCopyright ?? '',
        phone: storePages.phone ?? '',
        facebookPage: storePages.facebookPage ?? '',
        lineId: storePages.lineId ?? '',
        instagramPage: storePages.instagramPage ?? '',
        tiktokPage: storePages.tiktokPage ?? '',
        messengerUrl: storePages.messengerUrl ?? '',
        discordUrl: storePages.discordUrl ?? '',
        youtubePage: storePages.youtubePage ?? '',
      })
    }
  }, [storePages])

  const storeBaseUrl = useMemo(() => {
    const slug = currentStore?.slug || storePages?.slug || ''
    return getStoreUrl(currentStore as { customDomain?: string | null }, slug)
  }, [currentStore, storePages])

  const pages = useMemo(
    () =>
      PAGE_CONFIGS.map((config) => ({
        ...config,
        label: t(config.labelKey),
        description: t(config.descKey),
      })),
    [t],
  )

  const currentYear = new Date().getFullYear()

  const [aiConfirmPage, setAiConfirmPage] = useState<
    (typeof pages)[number] | null
  >(null)
  const [aiEstimatedCost, setAiEstimatedCost] = useState<number>(0)
  const [isEstimatingAi, setIsEstimatingAi] = useState<boolean>(false)
  const [generatingPageId, setGeneratingPageId] = useState<string | null>(null)

  const storePageAiMutation = useStorePageAi()

  const handleAiTrigger = async (config: (typeof pages)[number]) => {
    setIsEstimatingAi(true)
    try {
      const currentContent = contents[config.key]
      const estimate = await estimateStorePageAiCost(
        config.id as any,
        storeId,
        currentContent,
      )
      setAiEstimatedCost(estimate.credits || 0)
      setAiConfirmPage(config)
    } catch {
      setAiEstimatedCost(0)
      setAiConfirmPage(config)
    } finally {
      setIsEstimatingAi(false)
    }
  }

  const handleExecuteAi = async () => {
    if (!aiConfirmPage) return
    const targetPage = aiConfirmPage
    setAiConfirmPage(null)
    setGeneratingPageId(targetPage.id)

    try {
      const res = await storePageAiMutation.mutateAsync({
        pageType: targetPage.id as any,
        storeId,
        currentContent: contents[targetPage.key],
      })

      if (res.success && res.data?.content) {
        setContents((prev) => ({
          ...prev,
          [targetPage.key]: res.data.content,
        }))
        setResetKeys((prev) => ({
          ...prev,
          [targetPage.id]: (prev[targetPage.id] || 0) + 1,
        }))
        toast.success(
          locale === 'th'
            ? `AI สร้างเนื้อหาสำหรับ "${targetPage.label}" เรียบร้อยแล้ว! สามารถปรับแต่งและกดบันทึกได้เลย`
            : `AI generated content for "${targetPage.label}" successfully!`,
        )
      } else {
        toast.error(res.message || 'เกิดข้อผิดพลาดในการสร้างเนื้อหาด้วย AI')
      }
    } catch (error: any) {
      toast.error(error?.message || 'เกิดข้อผิดพลาดในการประมวลผลของ AI')
    } finally {
      setGeneratingPageId(null)
    }
  }

  const handleContentChange = (key: PageKey, value: string) => {
    setContents((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleResetTemplate = (config: (typeof pages)[number]) => {
    setContents((prev) => ({
      ...prev,
      [config.key]: config.defaultTemplate,
    }))
    setResetKeys((prev) => ({
      ...prev,
      [config.id]: (prev[config.id] || 0) + 1,
    }))
    toast.success(t('toastTemplateLoaded', { name: config.label }))
  }

  const handleSavePage = async (config: (typeof pages)[number]) => {
    try {
      const res = await updateMutation.mutateAsync({
        storeId,
        input: {
          [config.key]: contents[config.key],
        },
      })

      if (res?.success) {
        const message =
          (locale === 'th' ? res.messageTH : res.messageEN) || t('toastSaved')
        toast.success(message)
      } else {
        const message =
          (locale === 'th' ? res.messageTH : res.messageEN) || t('toastError')
        toast.error(message)
      }
    } catch {
      toast.error(t('toastSaveError'))
    }
  }

  const handleSaveFooter = async () => {
    try {
      const res = await updateMutation.mutateAsync({
        storeId,
        input: {
          footerText: footerData.footerText || null,
          footerCopyright: footerData.footerCopyright || null,
          phone: footerData.phone || null,
          facebookPage: footerData.facebookPage || null,
          lineId: footerData.lineId || null,
          instagramPage: footerData.instagramPage || null,
          tiktokPage: footerData.tiktokPage || null,
          messengerUrl: footerData.messengerUrl || null,
          discordUrl: footerData.discordUrl || null,
          youtubePage: footerData.youtubePage || null,
        },
      })

      if (res?.success) {
        const message =
          (locale === 'th' ? res.messageTH : res.messageEN) ||
          t('footer.toastSaved')
        toast.success(message)
      } else {
        const message =
          (locale === 'th' ? res.messageTH : res.messageEN) || t('toastError')
        toast.error(message)
      }
    } catch {
      toast.error(t('toastSaveError'))
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  return (
    <Card className="border-border/80 rounded-xl shadow-xs sm:rounded-2xl">
      <CardHeader className="p-4 pb-3 sm:p-6 sm:pb-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <IconFileDescription className="text-primary size-5 shrink-0" />
              {t('cardTitle')}
            </CardTitle>
            <CardDescription className="mt-1 text-xs sm:text-sm">
              {t('cardDescription')}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 p-4 pt-0 sm:space-y-6 sm:p-6 sm:pt-0">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full space-y-4 sm:space-y-6"
        >
          <div className="w-full">
            <TabsList className="bg-muted/70 border-border/80 grid w-full grid-cols-2 gap-1 rounded-xl border p-1 shadow-xs group-data-horizontal/tabs:h-auto sm:grid-cols-3 sm:gap-1.5 sm:rounded-2xl sm:p-1.5 lg:grid-cols-6">
              {pages.map((page) => {
                const Icon = page.icon
                const isActive = activeTab === page.id
                return (
                  <TabsTrigger
                    key={page.id}
                    value={page.id}
                    className={cn(
                      'group flex h-auto cursor-pointer items-center justify-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-semibold transition-all duration-200 sm:rounded-xl sm:px-3 sm:py-2.5 sm:text-sm',
                      'data-active:bg-background data-active:text-foreground dark:data-active:bg-background dark:data-active:text-foreground data-active:font-bold data-active:shadow-sm',
                      'text-muted-foreground hover:text-foreground hover:bg-background/40',
                      'border-0 after:hidden',
                    )}
                  >
                    <Icon
                      className={cn(
                        'size-4 shrink-0 transition-colors',
                        isActive
                          ? 'text-primary'
                          : 'text-muted-foreground group-hover:text-foreground',
                      )}
                    />
                    <span className="truncate">{page.label}</span>
                  </TabsTrigger>
                )
              })}
              <TabsTrigger
                value="footer"
                className={cn(
                  'group flex h-auto cursor-pointer items-center justify-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-semibold transition-all duration-200 sm:rounded-xl sm:px-3 sm:py-2.5 sm:text-sm',
                  'data-active:bg-background data-active:text-foreground dark:data-active:bg-background dark:data-active:text-foreground data-active:font-bold data-active:shadow-sm',
                  'text-muted-foreground hover:text-foreground hover:bg-background/40',
                  'border-0 after:hidden',
                )}
              >
                <IconLayoutBottombar
                  className={cn(
                    'size-4 shrink-0 transition-colors',
                    activeTab === 'footer'
                      ? 'text-primary'
                      : 'text-muted-foreground group-hover:text-foreground',
                  )}
                />
                <span className="truncate">{t('footer.tabLabel')}</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* 5 Markdown Pages */}
          {pages.map((page) => {
            const pageUrl = `${storeBaseUrl}${page.path}`
            const editorKey = `${page.id}-${resetKeys[page.id] || 0}`

            return (
              <TabsContent
                key={page.id}
                value={page.id}
                className="space-y-4 focus-visible:outline-none"
              >
                {/* Header Action Bar */}
                <div className="bg-muted/30 flex flex-col gap-3 rounded-xl border p-3.5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-foreground text-sm font-semibold sm:text-base">
                        {page.label}
                      </h3>
                      <a
                        href={pageUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary inline-flex items-center gap-1 text-xs break-all hover:underline"
                        title={t('openInNewTab')}
                      >
                        <span className="">{page.path}</span>
                        <IconExternalLink className="size-3.5 shrink-0" />
                      </a>
                    </div>
                    <p className="text-muted-foreground text-xs leading-relaxed">
                      {page.description}
                    </p>
                  </div>

                  <div className="flex w-full shrink-0 flex-wrap items-center gap-2 sm:w-auto">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleAiTrigger(page)}
                      disabled={
                        updateMutation.isPending ||
                        generatingPageId !== null ||
                        isEstimatingAi
                      }
                      className="text-primary border-primary/30 bg-primary/5 hover:bg-primary/10 flex-1 cursor-pointer text-xs font-medium sm:flex-initial"
                      title={
                        locale === 'th'
                          ? 'ให้ AI ช่วยคิดเนื้อหาสำหรับหน้านี้'
                          : 'Generate content with AI'
                      }
                    >
                      {generatingPageId === page.id ? (
                        <Spinner className="mr-1.5 size-3.5 shrink-0" />
                      ) : (
                        <IconSparkles className="text-primary mr-1 size-3.5 shrink-0" />
                      )}
                      {generatingPageId === page.id
                        ? locale === 'th'
                          ? 'AI กำลังคิดเนื้อหา...'
                          : 'Generating...'
                        : locale === 'th'
                          ? 'ให้ AI คิดเนื้อหาให้'
                          : 'AI Generate'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleResetTemplate(page)}
                      disabled={
                        updateMutation.isPending || generatingPageId !== null
                      }
                      className="flex-1 text-xs sm:flex-initial"
                      title={t('loadTemplateTooltip')}
                    >
                      <IconRefresh className="mr-1 size-3.5 shrink-0" />
                      {t('loadTemplate')}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => handleSavePage(page)}
                      disabled={updateMutation.isPending}
                      className="flex-1 text-xs font-medium sm:flex-initial"
                    >
                      {updateMutation.isPending ? (
                        <Spinner className="mr-1.5 size-3.5 shrink-0" />
                      ) : (
                        <IconDeviceFloppy className="mr-1 size-3.5 shrink-0" />
                      )}
                      {updateMutation.isPending ? t('saving') : t('save')}
                    </Button>
                  </div>
                </div>

                {/* Markdown Editor */}
                <div className="space-y-2">
                  <BlogEditor
                    key={editorKey}
                    value={contents[page.key]}
                    onChange={(val) => handleContentChange(page.key, val)}
                  />
                </div>
              </TabsContent>
            )
          })}

          {/* Footer Settings Tab */}
          <TabsContent
            value="footer"
            className="space-y-6 focus-visible:outline-none"
          >
            <div className="bg-muted/30 flex flex-col gap-3 rounded-xl border p-3.5 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-foreground text-sm font-semibold sm:text-base">
                    {t('footer.title')}
                  </h3>
                  <a
                    href={storeBaseUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary inline-flex items-center gap-1 text-xs break-all hover:underline"
                    title={t('openInNewTab')}
                  >
                    <span>{t('footer.viewStorefront')}</span>
                    <IconExternalLink className="size-3.5 shrink-0" />
                  </a>
                </div>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  {t('footer.description')}
                </p>
              </div>

              <div className="flex w-full shrink-0 sm:w-auto">
                <Button
                  type="button"
                  size="sm"
                  onClick={handleSaveFooter}
                  disabled={updateMutation.isPending}
                  className="w-full text-xs font-medium sm:w-auto"
                >
                  {updateMutation.isPending ? (
                    <Spinner className="mr-1.5 size-3.5 shrink-0" />
                  ) : (
                    <IconDeviceFloppy className="mr-1 size-3.5 shrink-0" />
                  )}
                  {updateMutation.isPending
                    ? t('saving')
                    : t('footer.saveButton')}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:gap-6">
              {/* Description & Contact */}
              <div className="bg-card space-y-4 rounded-xl border p-4 sm:p-4.5">
                <h4 className="text-foreground flex items-center gap-2 text-sm font-semibold">
                  <IconFileText className="text-primary size-4 shrink-0" />
                  {t('footer.descriptionContactHeading')}
                </h4>

                <Field>
                  <FieldLabel className="text-xs font-medium">
                    {t('footer.footerTextLabel')}
                  </FieldLabel>
                  <Textarea
                    placeholder={t('footer.footerTextPlaceholder')}
                    value={footerData.footerText}
                    onChange={(e) =>
                      setFooterData((prev) => ({
                        ...prev,
                        footerText: e.target.value,
                      }))
                    }
                    rows={3}
                  />
                  <FieldDescription className="text-[11px] leading-normal">
                    {t('footer.footerTextHelp')}
                  </FieldDescription>
                </Field>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field>
                    <FieldLabel className="flex items-center gap-1.5 text-xs font-medium">
                      <IconPhone className="text-primary size-3.5 shrink-0" />
                      {t('footer.phoneLabel')}
                    </FieldLabel>
                    <Input
                      placeholder={t('footer.phonePlaceholder')}
                      value={footerData.phone}
                      onChange={(e) =>
                        setFooterData((prev) => ({
                          ...prev,
                          phone: e.target.value,
                        }))
                      }
                    />
                  </Field>

                  <Field>
                    <FieldLabel className="flex items-center gap-1.5 text-xs font-medium">
                      <IconCopyright className="text-primary size-3.5 shrink-0" />
                      {t('footer.copyrightLabel')}
                    </FieldLabel>
                    <Input
                      placeholder={`© ${currentYear} ${currentStore?.name || t('footer.storeNameFallback')}. All rights reserved.`}
                      value={footerData.footerCopyright}
                      onChange={(e) =>
                        setFooterData((prev) => ({
                          ...prev,
                          footerCopyright: e.target.value,
                        }))
                      }
                    />
                    <FieldDescription className="text-[11px] leading-normal">
                      {t('footer.copyrightHelp', {
                        year: currentYear,
                        storeName:
                          currentStore?.name || t('footer.storeNameFallback'),
                      })}
                    </FieldDescription>
                  </Field>
                </div>
              </div>

              {/* Social Media Links */}
              <div className="bg-card space-y-4 rounded-xl border p-4 sm:p-4.5">
                <div className="space-y-1">
                  <h4 className="text-foreground flex items-center gap-2 text-sm font-semibold">
                    <IconMessageDots className="text-primary size-4 shrink-0" />
                    {t('footer.socialHeading')}
                  </h4>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    {t('footer.socialDescription')}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field>
                    <FieldLabel className="flex items-center gap-1.5 text-xs font-medium">
                      <IconBrandFacebook className="size-4 shrink-0 text-[#1877F2]" />
                      {t('footer.facebookLabel')}
                    </FieldLabel>
                    <Input
                      placeholder="https://facebook.com/your-store"
                      value={footerData.facebookPage}
                      onChange={(e) =>
                        setFooterData((prev) => ({
                          ...prev,
                          facebookPage: e.target.value,
                        }))
                      }
                    />
                  </Field>

                  <Field>
                    <FieldLabel className="flex items-center gap-1.5 text-xs font-medium">
                      <IconBrandLine className="size-4 shrink-0 text-[#06C755]" />
                      {t('footer.lineLabel')}
                    </FieldLabel>
                    <Input
                      placeholder={t('footer.linePlaceholder')}
                      value={footerData.lineId}
                      onChange={(e) =>
                        setFooterData((prev) => ({
                          ...prev,
                          lineId: e.target.value,
                        }))
                      }
                    />
                  </Field>

                  <Field>
                    <FieldLabel className="flex items-center gap-1.5 text-xs font-medium">
                      <IconBrandInstagram className="size-4 shrink-0 text-[#E4405F]" />
                      {t('footer.instagramLabel')}
                    </FieldLabel>
                    <Input
                      placeholder="https://instagram.com/your-store"
                      value={footerData.instagramPage}
                      onChange={(e) =>
                        setFooterData((prev) => ({
                          ...prev,
                          instagramPage: e.target.value,
                        }))
                      }
                    />
                  </Field>

                  <Field>
                    <FieldLabel className="flex items-center gap-1.5 text-xs font-medium">
                      <IconBrandTiktok className="size-4 shrink-0" />
                      {t('footer.tiktokLabel')}
                    </FieldLabel>
                    <Input
                      placeholder="https://tiktok.com/@your-store"
                      value={footerData.tiktokPage}
                      onChange={(e) =>
                        setFooterData((prev) => ({
                          ...prev,
                          tiktokPage: e.target.value,
                        }))
                      }
                    />
                  </Field>

                  <Field>
                    <FieldLabel className="flex items-center gap-1.5 text-xs font-medium">
                      <IconMessageDots className="size-4 shrink-0 text-[#00B2FF]" />
                      {t('footer.messengerLabel')}
                    </FieldLabel>
                    <Input
                      placeholder="https://m.me/your-store"
                      value={footerData.messengerUrl}
                      onChange={(e) =>
                        setFooterData((prev) => ({
                          ...prev,
                          messengerUrl: e.target.value,
                        }))
                      }
                    />
                  </Field>

                  <Field>
                    <FieldLabel className="flex items-center gap-1.5 text-xs font-medium">
                      <IconBrandDiscord className="size-4 shrink-0 text-[#5865F2]" />
                      {t('footer.discordLabel')}
                    </FieldLabel>
                    <Input
                      placeholder="https://discord.gg/your-invite"
                      value={footerData.discordUrl}
                      onChange={(e) =>
                        setFooterData((prev) => ({
                          ...prev,
                          discordUrl: e.target.value,
                        }))
                      }
                    />
                  </Field>

                  <Field className="sm:col-span-2">
                    <FieldLabel className="flex items-center gap-1.5 text-xs font-medium">
                      <IconBrandYoutube className="size-4 shrink-0 text-[#FF0000]" />
                      {t('footer.youtubeLabel')}
                    </FieldLabel>
                    <Input
                      placeholder="https://youtube.com/@your-channel"
                      value={footerData.youtubePage}
                      onChange={(e) =>
                        setFooterData((prev) => ({
                          ...prev,
                          youtubePage: e.target.value,
                        }))
                      }
                    />
                  </Field>
                </div>
              </div>

              {/* Bottom Action Bar */}
              <div className="flex justify-end pt-2">
                <Button
                  type="button"
                  onClick={handleSaveFooter}
                  disabled={updateMutation.isPending}
                  className="w-full font-medium sm:w-auto"
                >
                  {updateMutation.isPending ? (
                    <Spinner className="mr-2 shrink-0" />
                  ) : (
                    <IconDeviceFloppy className="mr-2 size-4 shrink-0" />
                  )}
                  {updateMutation.isPending
                    ? t('saving')
                    : t('footer.saveAllButton')}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <AlertDialog
          open={!!aiConfirmPage}
          onOpenChange={() => setAiConfirmPage(null)}
        >
          <AlertDialogContent
            style={
              {
                '--primary': currentStore?.primaryColor,
              } as React.CSSProperties
            }
          >
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <IconSparkles className="text-primary size-5" />
                {locale === 'th'
                  ? `ให้ AI ช่วยคิดเนื้อหาหน้า "${aiConfirmPage?.label}"`
                  : `Generate content for "${aiConfirmPage?.label}" with AI`}
              </AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="text-muted-foreground space-y-3 pt-2 text-sm">
                  <p>
                    {locale === 'th'
                      ? `ระบบ AI จะนำข้อมูลร้านค้า "${currentStore?.name || ''}" (เช่น คำอธิบายร้านค้า, สินค้า, ข้อมูลติดต่อ) มาวิเคราะห์และสร้างเนื้อหาแบบ Markdown ที่ตรงกับร้านค้าของคุณให้อัตโนมัติ`
                      : `AI will analyze your store information and generate tailored Markdown content.`}
                  </p>
                  <div className="bg-muted/50 space-y-1 rounded-xl border p-3 text-xs">
                    <div className="text-foreground flex items-center justify-between font-medium">
                      <span>
                        {locale === 'th'
                          ? 'ประมาณการค่าบริการ AI:'
                          : 'Estimated AI Cost:'}
                      </span>
                      <span className="text-primary text-sm font-bold">
                        {aiEstimatedCost}{' '}
                        {locale === 'th' ? 'เครดิต' : 'Credits'}
                      </span>
                    </div>
                    <p className="text-muted-foreground text-[11px]">
                      {locale === 'th'
                        ? '* หักจากเครดิตคงเหลือของร้านค้าตามจำนวน Token ที่ใช้งานจริง'
                        : '* Deducted from store credits balance based on actual tokens used'}
                    </p>
                  </div>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>
                {locale === 'th' ? 'ยกเลิก' : 'Cancel'}
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleExecuteAi}
                className="font-semibold"
              >
                <IconSparkles className="mr-1.5 size-4" />
                {locale === 'th'
                  ? 'ยืนยันให้ AI สร้างเนื้อหา'
                  : 'Confirm & Generate'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  )
}
