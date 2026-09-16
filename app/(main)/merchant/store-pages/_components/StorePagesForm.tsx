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
import { useQueryParam } from '@/hooks/use-query-param'
import { getStoreUrl } from '@/utils/storefront-seo'
import {
  IconDeviceFloppy,
  IconExternalLink,
  IconFileText,
  IconHelpCircle,
  IconInfoCircle,
  IconLayoutBottombar,
  IconReceiptRefund,
  IconRefresh,
  IconShieldLock,
  IconSparkles,
} from '@tabler/icons-react'

import BlogEditor from '@/components/BlogEditor'
import { PageTabHeader } from '@/components/PageTabHeader'
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
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'

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
  const { currentStore, style } = useCurrentStore()
  const { data: storePages, isLoading } = useStorePages(storeId)
  const updateMutation = useUpdateStorePages()

  const [activeTab, setActiveTab] = useQueryParam('tab', PAGE_CONFIGS[0].id)
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
      <div className="flex flex-col gap-6 xl:flex-row">
        <div className="flex h-auto w-full shrink-0 flex-col gap-1.5 rounded-xl border p-1.5 xl:sticky xl:top-5 xl:w-64">
          <Skeleton className="h-9 w-full rounded-lg" />
          <Skeleton className="h-9 w-full rounded-lg" />
          <Skeleton className="h-9 w-full rounded-lg" />
          <Skeleton className="h-9 w-full rounded-lg" />
          <Skeleton className="h-9 w-full rounded-lg" />
          <Skeleton className="h-9 w-full rounded-lg" />
        </div>
        <Card className="min-w-0 flex-1">
          <CardHeader>
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-80" />
            </div>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-96 w-full rounded-xl" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div style={style}>
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        orientation="vertical"
        className="flex flex-col gap-6 xl:flex-row"
      >
        <TabsList className="flex h-auto w-full shrink-0 items-stretch justify-start gap-1 overflow-x-auto rounded-xl border p-1 xl:sticky xl:top-5 xl:w-64 xl:flex-col">
          {pages.map((page) => {
            const Icon = page.icon
            return (
              <TabsTrigger
                key={page.id}
                value={page.id}
                className="shrink-0 cursor-pointer gap-2 py-2 xl:shrink"
              >
                <Icon size={16} className="shrink-0" />
                <span className="truncate">{page.label}</span>
              </TabsTrigger>
            )
          })}
          <TabsTrigger
            value="footer"
            className="shrink-0 cursor-pointer gap-2 py-2 xl:shrink"
          >
            <IconLayoutBottombar size={16} className="shrink-0" />
            <span className="truncate">{t('footer.tabLabel')}</span>
          </TabsTrigger>
        </TabsList>

        {/* 5 Markdown Pages */}
        {pages.map((page) => {
          const pageUrl = `${storeBaseUrl}${page.path}`
          const editorKey = `${page.id}-${resetKeys[page.id] || 0}`
          const isPending = updateMutation.isPending

          return (
            <TabsContent
              key={page.id}
              value={page.id}
              className="min-w-0 flex-1 focus-visible:outline-none"
            >
              <Card>
                <CardHeader>
                  <PageTabHeader
                    variant="secondary"
                    icon={page.icon}
                    title={
                      <div className="flex flex-wrap items-center gap-2">
                        <span>{page.label}</span>
                        <a
                          href={pageUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary inline-flex items-center gap-1 text-xs font-normal hover:underline"
                          title={t('openInNewTab')}
                        >
                          <span>{page.path}</span>
                          <IconExternalLink className="size-3.5 shrink-0" />
                        </a>
                      </div>
                    }
                    description={page.description}
                    endContent={
                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleAiTrigger(page)}
                          disabled={
                            isPending ||
                            generatingPageId !== null ||
                            isEstimatingAi
                          }
                          className="text-primary border-primary/30 bg-primary/5 hover:bg-primary/10 cursor-pointer text-xs font-medium"
                          title={
                            locale === 'th'
                              ? 'ให้ AI ช่วยคิดเนื้อหาสำหรับหน้านี้'
                              : 'Generate content with AI'
                          }
                        >
                          {generatingPageId === page.id ? (
                            <Spinner className="mr-1.5 size-3.5 shrink-0" />
                          ) : (
                            <IconSparkles className="text-primary mr-1.5 size-3.5 shrink-0" />
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
                          disabled={isPending || generatingPageId !== null}
                          title={t('loadTemplateTooltip')}
                          className="cursor-pointer text-xs font-medium"
                        >
                          <IconRefresh className="mr-1.5 size-3.5 shrink-0" />
                          {t('loadTemplate')}
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => handleSavePage(page)}
                          disabled={isPending}
                          className="cursor-pointer text-xs font-medium"
                        >
                          {isPending ? (
                            <Spinner className="mr-1.5 size-3.5 shrink-0" />
                          ) : (
                            <IconDeviceFloppy className="mr-1.5 size-3.5 shrink-0" />
                          )}
                          {isPending ? t('saving') : t('save')}
                        </Button>
                      </div>
                    }
                  />
                </CardHeader>
                <CardContent>
                  <BlogEditor
                    key={editorKey}
                    value={contents[page.key]}
                    onChange={(val) => handleContentChange(page.key, val)}
                  />
                </CardContent>
                <CardFooter className="flex flex-wrap items-center justify-between gap-3 border-t">
                  <p className="text-muted-foreground text-xs">
                    {t('markdownHint')}
                  </p>
                  <Button
                    type="button"
                    onClick={() => handleSavePage(page)}
                    disabled={isPending}
                    className="cursor-pointer font-medium"
                  >
                    {isPending ? (
                      <Spinner className="mr-1.5 size-4" />
                    ) : (
                      <IconDeviceFloppy className="mr-1.5 size-4" />
                    )}
                    {isPending ? t('saving') : t('save')}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          )
        })}

        {/* Footer & Social Media Tab */}
        <TabsContent
          value="footer"
          className="min-w-0 flex-1 focus-visible:outline-none"
        >
          <Card>
            <CardHeader>
              <PageTabHeader
                variant="secondary"
                icon={IconLayoutBottombar}
                title={
                  <div className="flex flex-wrap items-center gap-2">
                    <span>{t('footer.title')}</span>
                    <a
                      href={storeBaseUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary inline-flex items-center gap-1 text-xs font-normal hover:underline"
                      title={t('openInNewTab')}
                    >
                      <span>{t('footer.viewStorefront')}</span>
                      <IconExternalLink className="size-3.5 shrink-0" />
                    </a>
                  </div>
                }
                description={t('footer.description')}
                endContent={
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleSaveFooter}
                    disabled={updateMutation.isPending}
                    className="cursor-pointer text-xs font-medium"
                  >
                    {updateMutation.isPending ? (
                      <Spinner className="mr-1.5 size-3.5 shrink-0" />
                    ) : (
                      <IconDeviceFloppy className="mr-1.5 size-3.5 shrink-0" />
                    )}
                    {updateMutation.isPending
                      ? t('saving')
                      : t('footer.saveButton')}
                  </Button>
                }
              />
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-foreground text-sm font-semibold sm:text-base">
                  {t('footer.descriptionContactHeading')}
                </h3>

                <Field>
                  <FieldLabel>{t('footer.footerTextLabel')}</FieldLabel>
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
                  <FieldDescription>
                    {t('footer.footerTextHelp')}
                  </FieldDescription>
                </Field>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <Field>
                    <FieldLabel>{t('footer.phoneLabel')}</FieldLabel>
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
                    <FieldLabel>{t('footer.copyrightLabel')}</FieldLabel>
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
                    <FieldDescription>
                      {t('footer.copyrightHelp', {
                        year: currentYear,
                        storeName:
                          currentStore?.name || t('footer.storeNameFallback'),
                      })}
                    </FieldDescription>
                  </Field>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-foreground text-sm font-semibold sm:text-base">
                    {t('footer.socialHeading')}
                  </h3>
                  <p className="text-muted-foreground text-xs sm:text-sm">
                    {t('footer.socialDescription')}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <Field>
                    <FieldLabel>{t('footer.facebookLabel')}</FieldLabel>
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
                    <FieldLabel>{t('footer.lineLabel')}</FieldLabel>
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
                    <FieldLabel>{t('footer.instagramLabel')}</FieldLabel>
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
                    <FieldLabel>{t('footer.tiktokLabel')}</FieldLabel>
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
                    <FieldLabel>{t('footer.messengerLabel')}</FieldLabel>
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
                    <FieldLabel>{t('footer.discordLabel')}</FieldLabel>
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
                    <FieldLabel>{t('footer.youtubeLabel')}</FieldLabel>
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
            </CardContent>
            <CardFooter className="flex flex-wrap justify-end gap-2.5 border-t">
              <Button
                type="button"
                onClick={handleSaveFooter}
                disabled={updateMutation.isPending}
                className="cursor-pointer font-medium"
              >
                {updateMutation.isPending ? (
                  <Spinner className="mr-1.5 size-4" />
                ) : (
                  <IconDeviceFloppy className="mr-1.5 size-4" />
                )}
                {updateMutation.isPending
                  ? t('saving')
                  : t('footer.saveAllButton')}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      <AlertDialog
        open={!!aiConfirmPage}
        onOpenChange={() => setAiConfirmPage(null)}
      >
        <AlertDialogContent style={style}>
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
                      {aiEstimatedCost} {locale === 'th' ? 'เครดิต' : 'Credits'}
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
              className="cursor-pointer font-semibold"
            >
              <IconSparkles className="mr-1.5 size-4" />
              {locale === 'th'
                ? 'ยืนยันให้ AI สร้างเนื้อหา'
                : 'Confirm & Generate'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
