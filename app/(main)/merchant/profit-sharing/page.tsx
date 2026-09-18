'use client'

import React, { useState } from 'react'

import { useTranslations } from 'next-intl'

import { useEmployeePermission } from '@/actions/hooks/employee'
import { useStoreOptions } from '@/actions/hooks/store'
import { MERCHANT_NAVIGATION } from '@/constants/navigation'
import { ALL_STORES, useStoreFilter } from '@/stores/use-store-filter'
import { IconLock, IconReceiptTax } from '@tabler/icons-react'

import { ActionRequiredAlert } from '@/components/ActionRequiredAlert'
import { PageTabHeader } from '@/components/PageTabHeader'
import { StoreSelectField } from '@/components/StoreSelectField'
import { Sidebar } from '@/components/layout/Sidebar'
import { Tabs, TabsContent } from '@/components/ui/tabs'

import { MonthlySettlementView } from './_components/MonthlySettlementView'
import { PartnerListTable } from './_components/PartnerListTable'
import { ProfitSharingTabList } from './_components/ProfitSharingTabList'
import { SettlementHistoryView } from './_components/SettlementHistoryView'

export default function ProfitSharingPage() {
  const t = useTranslations('merchant.profitSharing')
  const { selectedStoreId } = useStoreFilter()
  const { data: storeOptions = [] } = useStoreOptions()

  const { canViewProfitSharing, isLoading: isPermissionLoading } =
    useEmployeePermission()

  const [currentTab, setCurrentTab] = useState<string>('settlement')

  const resolvedStoreId =
    selectedStoreId !== ALL_STORES
      ? selectedStoreId
      : storeOptions?.[0]?.id || ''

  const currentStore = storeOptions.find((s) => s.id === resolvedStoreId)
  const storeName =
    currentStore?.name || t('settlement.statement.storeFallback')

  return (
    <Sidebar redirectPath="merchant" items={MERCHANT_NAVIGATION}>
      <PageTabHeader
        icon={IconReceiptTax}
        title={t('title')}
        description={t('description')}
        endContent={
          <div className="flex flex-wrap items-center gap-2.5">
            <StoreSelectField />
          </div>
        }
      />

      {selectedStoreId !== ALL_STORES &&
      !isPermissionLoading &&
      !canViewProfitSharing ? (
        <ActionRequiredAlert
          icon={<IconLock />}
          title={t('noAccessTitle')}
          description={t('noAccessDescription')}
        />
      ) : !resolvedStoreId ? (
        <div className="text-muted-foreground rounded-xl border border-dashed p-8 text-center">
          <p>{t('noStoreSelected')}</p>
        </div>
      ) : (
        <div className="space-y-6">
          <Tabs
            value={currentTab}
            onValueChange={setCurrentTab}
            className="w-full space-y-6"
          >
            <ProfitSharingTabList />

            <TabsContent value="settlement" className="space-y-6">
              <MonthlySettlementView
                storeId={resolvedStoreId}
                storeName={storeName}
              />
            </TabsContent>

            <TabsContent value="partners" className="space-y-6">
              <PartnerListTable storeId={resolvedStoreId} />
            </TabsContent>

            <TabsContent value="history" className="space-y-6">
              <SettlementHistoryView
                storeId={resolvedStoreId}
                storeName={storeName}
                onSelectPeriod={(_period) => {
                  setCurrentTab('settlement')
                }}
              />
            </TabsContent>
          </Tabs>
        </div>
      )}
    </Sidebar>
  )
}
