'use client'

import { useTranslations } from 'next-intl'
import {
  IconBell,
  IconBuildingStore,
  IconCreditCard,
  IconLock,
  IconReceiptTax,
  IconReplace,
  IconStar,
  IconTruck,
  IconWebhook,
  IconWorld,
} from '@tabler/icons-react'

import { TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SettingsTab } from '@/constants/settings'

export function SettingsTabList() {
  const t = useTranslations('merchant.settings')

  return (
    <TabsList className="flex h-auto w-full shrink-0 items-stretch justify-start gap-1 rounded-xl border p-1 xl:sticky xl:top-5 xl:w-57.5 xl:flex-col">
      <TabsTrigger value={SettingsTab.STORE_PROFILE}>
        <IconBuildingStore size={14} /> {t('tabs.storeProfile')}
      </TabsTrigger>
      <TabsTrigger value={SettingsTab.DOMAIN}>
        <IconWorld size={14} /> {t('tabs.domain')}
      </TabsTrigger>
      <TabsTrigger value={SettingsTab.SECURITY}>
        <IconLock size={14} /> {t('tabs.security')}
      </TabsTrigger>
      <TabsTrigger value={SettingsTab.NOTIFICATIONS}>
        <IconBell size={14} /> {t('tabs.notifications')}
      </TabsTrigger>
      <TabsTrigger value={SettingsTab.TRANSFER}>
        <IconReplace size={14} /> {t('tabs.transfer')}
      </TabsTrigger>
      <TabsTrigger value={SettingsTab.TAX}>
        <IconReceiptTax size={14} /> {t('tabs.tax')}
      </TabsTrigger>
      <TabsTrigger value={SettingsTab.SHIPPING}>
        <IconTruck size={14} /> {t('tabs.shipping')}
      </TabsTrigger>
      <TabsTrigger value={SettingsTab.PAYMENT}>
        <IconCreditCard size={14} /> {t('tabs.payment')}
      </TabsTrigger>
      <TabsTrigger value={SettingsTab.REVIEW_REWARD}>
        <IconStar size={14} /> {t('tabs.reviewReward')}
      </TabsTrigger>
      <TabsTrigger value={SettingsTab.WEBHOOK}>
        <IconWebhook size={14} /> {t('tabs.webhook')}
      </TabsTrigger>
    </TabsList>
  )
}

