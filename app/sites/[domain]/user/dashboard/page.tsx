'use client'

import { useParams } from 'next/navigation'

import { useStorefrontDashboard } from '@/actions/hooks/storefront/dashboard'
import { BUYER_NAVIGATION } from '@/constants/navigation'
import { CurrencyCode } from '@/generated/prisma/enums'
import { useStoreData } from '@/stores/sites/use-store-data'
import { useStorefrontCurrency } from '@/stores/use-currency-store'

import { Sidebar } from '@/components/layout/Sidebar'

import { UserDashboardSkeleton } from './_components/UserDashboardSkeleton'
import { UserDashboardStats } from './_components/UserDashboardStats'
import { UserPointsChart } from './_components/UserPointsChart'
import { UserSpendingChart } from './_components/UserSpendingChart'

export default function StoreUserDashboardPage() {
  const params = useParams()
  const storeSlug = params.domain as string
  const { store } = useStoreData()
  const { currentCurrency, convert } = useStorefrontCurrency(
    (store as { baseCurrency?: CurrencyCode } | null)?.baseCurrency,
  )

  const { data, isLoading } = useStorefrontDashboard(storeSlug)

  const stats = data?.stats
  const spendingTrend = data?.spendingTrend ?? []
  const pointsHistory = data?.pointsHistory ?? []

  return (
    <Sidebar redirectPath="user" items={BUYER_NAVIGATION}>
      {isLoading ? (
        <UserDashboardSkeleton />
      ) : (
        <>
          <UserDashboardStats
            stats={stats}
            convert={convert}
            currentCurrency={currentCurrency}
          />
          <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
            <UserSpendingChart
              spendingTrend={spendingTrend}
              convert={convert}
              currentCurrency={currentCurrency}
            />
            <UserPointsChart pointsHistory={pointsHistory} />
          </div>
        </>
      )}
    </Sidebar>
  )
}
