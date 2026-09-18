'use client'

import React, { useState } from 'react'

import { useTranslations } from 'next-intl'

import { useEmployeePermission } from '@/actions/hooks/employee'
import { useStoreOptions } from '@/actions/hooks/store'
import { MERCHANT_NAVIGATION } from '@/constants/navigation'
import { ALL_STORES, useStoreFilter } from '@/stores/use-store-filter'
import { IconLock, IconReportMoney } from '@tabler/icons-react'

import { ActionRequiredAlert } from '@/components/ActionRequiredAlert'
import { BranchSelectField } from '@/components/BranchSelectField'
import { PageTabHeader } from '@/components/PageTabHeader'
import { StoreSelectField } from '@/components/StoreSelectField'
import { Sidebar } from '@/components/layout/Sidebar'
import { Tabs, TabsContent } from '@/components/ui/tabs'

import { MonthlyPayrollView } from './_components/MonthlyPayrollView'
import { PayrollHistoryView } from './_components/PayrollHistoryView'
import { PayrollTabList } from './_components/PayrollTabList'
import { StaffSalaryTable } from './_components/StaffSalaryTable'

export default function PayrollPage() {
  const t = useTranslations('merchant.payroll')
  const { selectedStoreId } = useStoreFilter()
  const { data: storeOptions = [] } = useStoreOptions()

  const { canViewPayroll, isLoading: isPermissionLoading } =
    useEmployeePermission()

  const [currentTab, setCurrentTab] = useState<string>('settlement')

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
      !canViewPayroll ? (
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
            <PayrollTabList />

            <TabsContent value="settlement" className="space-y-6">
              <MonthlyPayrollView
                storeId={resolvedStoreId}
                storeName={storeName}
              />
            </TabsContent>

            <TabsContent value="staff" className="space-y-6">
              <StaffSalaryTable storeId={resolvedStoreId} />
            </TabsContent>

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
