'use client'

import React from 'react'

import { useTranslations } from 'next-intl'

import { useMerchantCurrency } from '@/hooks/use-merchant-currency'
import { EmployeeSalaryConfigItem } from '@/types/payroll'
import { IconUserCheck, IconUsers, IconWallet } from '@tabler/icons-react'

import { StatsCard } from '@/components/StatsCard'

interface StaffSalarySummaryCardsProps {
  staffList: EmployeeSalaryConfigItem[]
}

export function StaffSalarySummaryCards({
  staffList,
}: StaffSalarySummaryCardsProps) {
  const tStaff = useTranslations('merchant.payroll.staff')
  const { formatCurrency } = useMerchantCurrency()

  const activeStaff = staffList.filter((s) => s.isActive)
  const totalBase = activeStaff.reduce((sum, s) => sum + s.baseSalary, 0)

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <StatsCard
        title={tStaff('totalStaff')}
        value={tStaff('staffUnit', { count: staffList.length })}
        description={tStaff('description')}
        icon={IconUsers}
      />
      <StatsCard
        title={tStaff('totalBasePerMonth')}
        value={formatCurrency(totalBase)}
        description={tStaff('activeStaff')}
        icon={IconWallet}
        valueClassName="text-primary font-bold"
      />
      <StatsCard
        title={tStaff('activeStaff')}
        value={`${activeStaff.length} / ${staffList.length}`}
        description={tStaff('hasSocialSecurityDesc')}
        icon={IconUserCheck}
        badge={
          activeStaff.length === staffList.length
            ? tStaff('active')
            : tStaff('inactive')
        }
      />
    </div>
  )
}
