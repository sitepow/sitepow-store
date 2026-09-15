'use client'

import React, { useState } from 'react'

import { useTranslations } from 'next-intl'

import { useEmployeePermission } from '@/actions/hooks/employee'
import { useStoreOptions } from '@/actions/hooks/store'
import { MERCHANT_NAVIGATION } from '@/constants/navigation'
import { ALL_STORES, useStoreFilter } from '@/stores/use-store-filter'
import {
  IconCalculator,
  IconHistory,
  IconLock,
  IconReportMoney,
  IconUsers,
} from '@tabler/icons-react'

import { ActionRequiredAlert } from '@/components/ActionRequiredAlert'
import { BranchSelectField } from '@/components/BranchSelectField'
import { PageTabHeader } from '@/components/PageTabHeader'
import { StoreSelectField } from '@/components/StoreSelectField'
import { Sidebar } from '@/components/layout/Sidebar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { MonthlyPayrollView } from './_components/MonthlyPayrollView'
import { PayrollHistoryView } from './_components/PayrollHistoryView'
import { StaffSalaryTable } from './_components/StaffSalaryTable'

export default function PayrollPage() {
  const t = useTranslations('merchant.payroll')
  const { selectedStoreId } = useStoreFilter()
  const { data: storeOptions = [] } = useStoreOptions()

  const { canViewExpenses, isLoading: isPermissionLoading } =
    useEmployeePermission()

  const [currentTab, setCurrentTab] = useState<string>('settlement')

  // Resolve active store ID
  const resolvedStoreId =
    selectedStoreId !== ALL_STORES
      ? selectedStoreId
      : storeOptions?.[0]?.id || ''

  const currentStore = storeOptions.find((s) => s.id === resolvedStoreId)
  const storeName = currentStore?.name || t('settlement.payslip.storeFallback')

  const handleSelectHistoryPeriod = (_period: string) => {
    setCurrentTab('settlement')
  }

  return (
    <Sidebar redirectPath="merchant" items={MERCHANT_NAVIGATION}>
      <PageTabHeader
        icon={IconReportMoney}
        title={t('title')}
        description={t('description')}
        endContent={
          <div className="flex flex-wrap items-center gap-2.5">
            <StoreSelectField />
            <BranchSelectField />
          </div>
        }
      />

      {selectedStoreId !== ALL_STORES &&
      !isPermissionLoading &&
      !canViewExpenses ? (
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
            <TabsList className="grid h-auto w-full max-w-xl grid-cols-3 p-1">
              <TabsTrigger
                value="settlement"
                className="flex items-center justify-center gap-1.5 py-2 text-xs sm:gap-2 sm:text-sm"
              >
                <IconCalculator className="size-4 shrink-0" />
                <span className="hidden sm:inline">{t('tabs.settlement')}</span>
                <span className="sm:hidden">{t('tabs.settlementShort')}</span>
              </TabsTrigger>
              <TabsTrigger
                value="staff"
                className="flex items-center justify-center gap-1.5 py-2 text-xs sm:gap-2 sm:text-sm"
              >
                <IconUsers className="size-4 shrink-0" />
                <span className="hidden sm:inline">{t('tabs.staff')}</span>
                <span className="sm:hidden">{t('tabs.staffShort')}</span>
              </TabsTrigger>
              <TabsTrigger
                value="history"
                className="flex items-center justify-center gap-1.5 py-2 text-xs sm:gap-2 sm:text-sm"
              >
                <IconHistory className="size-4 shrink-0" />
                <span className="hidden sm:inline">{t('tabs.history')}</span>
                <span className="sm:hidden">{t('tabs.historyShort')}</span>
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: MONTHLY SETTLEMENT */}
            <TabsContent value="settlement" className="space-y-6">
              <MonthlyPayrollView
                storeId={resolvedStoreId}
                storeName={storeName}
              />
            </TabsContent>

            {/* TAB 2: STAFF SALARIES & CONFIG */}
            <TabsContent value="staff" className="space-y-6">
              <StaffSalaryTable storeId={resolvedStoreId} />
            </TabsContent>

            {/* TAB 3: PAYROLL HISTORY */}
            <TabsContent value="history" className="space-y-6">
              <PayrollHistoryView
                storeId={resolvedStoreId}
                onSelectPeriod={handleSelectHistoryPeriod}
              />
            </TabsContent>
          </Tabs>
        </div>
      )}
    </Sidebar>
  )
}
