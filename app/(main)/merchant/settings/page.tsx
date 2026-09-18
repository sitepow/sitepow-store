'use client'

import { Suspense } from 'react'

import { useTranslations } from 'next-intl'

import { MERCHANT_NAVIGATION } from '@/constants/navigation'
import { SettingsTab } from '@/constants/settings'
import { useQueryParam } from '@/hooks/use-query-param'
import { ALL_STORES, useStoreFilter } from '@/stores/use-store-filter'
import { IconSettings } from '@tabler/icons-react'

import { ActionRequiredAlert } from '@/components/ActionRequiredAlert'
import { BranchSelectField } from '@/components/BranchSelectField'
import { PageTabHeader } from '@/components/PageTabHeader'
import { StoreSelectField } from '@/components/StoreSelectField'
import { Sidebar } from '@/components/layout/Sidebar'
import { Tabs } from '@/components/ui/tabs'

import { SettingsTabList } from './_components/SettingsTabList'
import { SettingsTabPanels } from './_components/SettingsTabPanels'

export const dynamic = 'force-dynamic'

function MerchantSettingsContent() {
  const t = useTranslations('merchant.settings')
  const [activeTab, setActiveTab] = useQueryParam(
    'tab',
    SettingsTab.STORE_PROFILE,
  )
  const { selectedStoreId } = useStoreFilter()

  return (
    <Sidebar redirectPath="merchant" items={MERCHANT_NAVIGATION}>
      <PageTabHeader
        icon={IconSettings}
        title={t('title')}
        description={t('description')}
        endContent={
          <div className="flex flex-wrap gap-2.5">
            <StoreSelectField />
            <BranchSelectField />
          </div>
        }
      />

      {selectedStoreId === ALL_STORES ? (
        <ActionRequiredAlert />
      ) : (
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          orientation="vertical"
          className="flex flex-col gap-6 xl:flex-row"
        >
          <SettingsTabList />
          <SettingsTabPanels />
        </Tabs>
      )}
    </Sidebar>
  )
}

export default function MerchantSettingsPage() {
  return (
    <Suspense fallback={null}>
      <MerchantSettingsContent />
    </Suspense>
  )
}
