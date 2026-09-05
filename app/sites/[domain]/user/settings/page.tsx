'use client'

import { Suspense } from 'react'

import { useTranslations } from 'next-intl'

import { BUYER_NAVIGATION } from '@/constants/navigation'
import { UserSettingsTab } from '@/constants/settings'
import { useQueryParam } from '@/hooks/use-query-param'
import {
  IconBell,
  IconLock,
  IconSettings,
  IconShieldLock,
} from '@tabler/icons-react'

import { PageTabHeader } from '@/components/PageTabHeader'
import { Sidebar } from '@/components/layout/Sidebar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { ChangePasswordForm } from './_components/ChangePasswordForm'
import { NotificationSettingsForm } from './_components/NotificationSettingsForm'
import { PdpaManagementForm } from './_components/PdpaManagementForm'

export const dynamic = 'force-dynamic'

function StoreUserSettingsContent() {
  const t = useTranslations('customer.settings')
  const [activeTab, setActiveTab] = useQueryParam(
    'tab',
    UserSettingsTab.PASSWORD,
  )

  return (
    <Sidebar redirectPath="user" items={BUYER_NAVIGATION}>
      <PageTabHeader
        icon={IconSettings}
        title={t('title')}
        description={t('description')}
      />
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        orientation="vertical"
        className="flex flex-col gap-6 xl:flex-row"
      >
        <TabsList className="flex h-auto w-full shrink-0 items-stretch justify-start gap-1 rounded-xl border p-1 xl:sticky xl:top-5 xl:w-57.5 xl:flex-col">
          <TabsTrigger value={UserSettingsTab.PASSWORD}>
            <IconLock size={14} /> {t('tabs.password')}
          </TabsTrigger>
          <TabsTrigger value={UserSettingsTab.NOTIFICATIONS}>
            <IconBell size={14} /> {t('tabs.notifications')}
          </TabsTrigger>
          <TabsTrigger value={UserSettingsTab.PDPA}>
            <IconShieldLock size={14} /> {t('tabs.pdpa')}
          </TabsTrigger>
        </TabsList>
        <TabsContent value={UserSettingsTab.PASSWORD} className="flex-1">
          <ChangePasswordForm />
        </TabsContent>
        <TabsContent value={UserSettingsTab.NOTIFICATIONS} className="flex-1">
          <NotificationSettingsForm />
        </TabsContent>
        <TabsContent value={UserSettingsTab.PDPA} className="flex-1">
          <PdpaManagementForm />
        </TabsContent>
      </Tabs>
    </Sidebar>
  )
}

export default function StoreUserSettingsPage() {
  return (
    <Suspense fallback={null}>
      <StoreUserSettingsContent />
    </Suspense>
  )
}
