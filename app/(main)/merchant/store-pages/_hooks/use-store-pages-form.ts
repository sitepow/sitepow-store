'use client'

import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { useLocale, useTranslations } from 'next-intl'
import {
  IconFileText,
  IconHelpCircle,
  IconInfoCircle,
  IconReceiptRefund,
  IconShieldLock,
} from '@tabler/icons-react'

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

export type PageKey =
  | 'aboutPage'
  | 'faqsPage'
  | 'descriptionPage'
  | 'privacyPolicyPage'
  | 'refundPolicyPage'

export type StorePageType =
  | 'about'
  | 'faqs'
  | 'description'
  | 'privacy-policy'
  | 'refund-return-policy'

export const PAGE_CONFIGS = [
  {
    id: 'about' as StorePageType,
    key: 'aboutPage' as const,
    labelKey: 'pages.about.label',
    descKey: 'pages.about.description',
    path: '/about',
    icon: IconInfoCircle,
    defaultTemplate: ABOUT_PAGE,
  },
  {
    id: 'faqs' as StorePageType,
    key: 'faqsPage' as const,
    labelKey: 'pages.faqs.label',
    descKey: 'pages.faqs.description',
    path: '/faqs',
    icon: IconHelpCircle,
    defaultTemplate: FAQ_PAGE,
  },
  {
    id: 'description' as StorePageType,
    key: 'descriptionPage' as const,
    labelKey: 'pages.description.label',
    descKey: 'pages.description.description',
    path: '/description',
    icon: IconFileText,
    defaultTemplate: HOW_TO_ORDER_PAGE,
  },
  {
    id: 'privacy-policy' as StorePageType,
    key: 'privacyPolicyPage' as const,
    labelKey: 'pages.privacyPolicy.label',
    descKey: 'pages.privacyPolicy.description',
    path: '/privacy-policy',
    icon: IconShieldLock,
    defaultTemplate: PRIVATE_POLICY_PAGE,
  },
  {
    id: 'refund-return-policy' as StorePageType,
    key: 'refundPolicyPage' as const,
    labelKey: 'pages.refundPolicy.label',
    descKey: 'pages.refundPolicy.description',
    path: '/refund-return-policy',
    icon: IconReceiptRefund,
    defaultTemplate: REFUND_POLICY_PAGE,
  },
] as const

export interface PageItemConfig {
  id: StorePageType
  key: PageKey
  labelKey: string
  descKey: string
  path: string
  icon: typeof IconInfoCircle
  defaultTemplate: string
  label: string
  description: string
}

export interface FooterFormData {
  footerText: string
  footerCopyright: string
  phone: string
  facebookPage: string
  lineId: string
  instagramPage: string
  tiktokPage: string
  messengerUrl: string
  discordUrl: string
  youtubePage: string
}

export function useStorePagesForm({ storeId }: { storeId: string }) {
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

  const [footerData, setFooterData] = useState<FooterFormData>({
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

  const pages: PageItemConfig[] = useMemo(
    () =>
      PAGE_CONFIGS.map((config) => ({
        ...config,
        label: t(config.labelKey as Parameters<typeof t>[0]),
        description: t(config.descKey as Parameters<typeof t>[0]),
      })),
    [t],
  )

  const [aiConfirmPage, setAiConfirmPage] = useState<PageItemConfig | null>(
    null,
  )
  const [aiEstimatedCost, setAiEstimatedCost] = useState<number>(0)
  const [isEstimatingAi, setIsEstimatingAi] = useState<boolean>(false)
  const [generatingPageId, setGeneratingPageId] = useState<string | null>(null)

  const storePageAiMutation = useStorePageAi()

  const handleAiTrigger = async (config: PageItemConfig) => {
    setIsEstimatingAi(true)
    try {
      const currentContent = contents[config.key]
      const estimate = await estimateStorePageAiCost(
        config.id,
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
        pageType: targetPage.id,
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
    } catch (error: unknown) {
      const msg =
        error instanceof Error
          ? error.message
          : 'เกิดข้อผิดพลาดในการประมวลผลของ AI'
      toast.error(msg)
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

  const handleResetTemplate = (config: PageItemConfig) => {
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

  const handleSavePage = async (config: PageItemConfig) => {
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

  return {
    t,
    locale,
    currentStore,
    style,
    isLoading,
    isUpdating: updateMutation.isPending,
    activeTab,
    setActiveTab,
    contents,
    resetKeys,
    footerData,
    setFooterData,
    storeBaseUrl,
    pages,
    aiConfirmPage,
    setAiConfirmPage,
    aiEstimatedCost,
    isEstimatingAi,
    generatingPageId,
    handleAiTrigger,
    handleExecuteAi,
    handleContentChange,
    handleResetTemplate,
    handleSavePage,
    handleSaveFooter,
  }
}
