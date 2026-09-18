'use client'

import { useTranslations } from 'next-intl'

import { useDashboard } from '@/actions/hooks/dashboard'
import { useEmployeePermission } from '@/actions/hooks/employee'
import { MERCHANT_NAVIGATION } from '@/constants/navigation'
import { useMerchantCurrency } from '@/hooks/use-merchant-currency'
import { useBranchFilter } from '@/stores/use-branch-filter'
import { ALL_STORES, useStoreFilter } from '@/stores/use-store-filter'
import { IconLock } from '@tabler/icons-react'

import { ActionRequiredAlert } from '@/components/ActionRequiredAlert'
import { Sidebar } from '@/components/layout/Sidebar'
import { Skeleton } from '@/components/ui/skeleton'

import { StoreCreditCard } from '../credits/_components/StoreCreditCard'
import { DashboardHeader } from './_components/DashboardHeader'
import { DashboardMetricsGrid } from './_components/DashboardMetricsGrid'
import { LowStockCard } from './_components/LowStockCard'
import { RecentSalesChart } from './_components/RecentSalesChart'
import { SalesTrendChart } from './_components/SalesTrendChart'

export default function MerchantDashboardPage() {
  const t = useTranslations('merchant.dashboard')
  const { selectedStoreId, selectedStoreSlug } = useStoreFilter()
  const { selectedBranchId } = useBranchFilter()
  const { formatCurrency } = useMerchantCurrency()

  const {
    canViewDashboard,
    canViewCreditCard,
    isLoading: isPermissionLoading,
  } = useEmployeePermission()

  const { data, isLoading } = useDashboard(selectedStoreId, selectedBranchId)

  return (
    <Sidebar redirectPath="merchant" items={MERCHANT_NAVIGATION}>
      <DashboardHeader
        showQuickLinks={selectedStoreId !== ALL_STORES}
        storeSlug={selectedStoreSlug}
      />

      {selectedStoreId === ALL_STORES && <ActionRequiredAlert />}

      {selectedStoreId !== ALL_STORES && (isPermissionLoading || isLoading) && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[...Array(16)].map((_, i) => (
              <Skeleton key={i} className="h-28" />
            ))}
          </div>
          <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
        </div>
      )}

      {selectedStoreId !== ALL_STORES &&
        !isPermissionLoading &&
        !canViewDashboard && (
          <ActionRequiredAlert
            icon={<IconLock />}
            title={t('noAccessTitle')}
            description={t('noAccessDescription')}
          />
        )}

      {selectedStoreId !== ALL_STORES &&
        !isPermissionLoading &&
        canViewDashboard &&
        !isLoading &&
        data && (
          <div className="space-y-6">
            {data.stats && (
              <DashboardMetricsGrid
                stats={data.stats}
                formatCurrency={formatCurrency}
              />
            )}

            <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
              {canViewCreditCard && <StoreCreditCard />}
              <SalesTrendChart data={data} />
              <RecentSalesChart data={data} />
              <LowStockCard data={data} />
            </div>
          </div>
        )}
    </Sidebar>
  )
}
