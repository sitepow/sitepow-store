'use client'

import React from 'react'

import { useTranslations } from 'next-intl'

import { useMerchantCurrency } from '@/hooks/use-merchant-currency'
import { MonthlyPayrollRecord } from '@/types/payroll'
import {
  IconArrowDown,
  IconArrowUp,
  IconCash,
  IconWallet,
} from '@tabler/icons-react'

import { StatsCard } from '@/components/StatsCard'

interface PayrollSummaryCardsProps {
  payroll?: MonthlyPayrollRecord
  isLoading?: boolean
}

export function PayrollSummaryCards({
  payroll,
  isLoading = false,
}: PayrollSummaryCardsProps) {
  const t = useTranslations('merchant.payroll.summary')
  const { formatCurrency } = useMerchantCurrency()

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="border-border/50 bg-muted/40 h-28 animate-pulse rounded-xl border p-5"
          />
        ))}
      </div>
    )
  }

  const base = payroll?.totalBaseSalary ?? 0
  const additions =
    (payroll?.totalOvertime ?? 0) +
    (payroll?.totalBonus ?? 0) +
    (payroll?.totalCommission ?? 0)
  const deductions = payroll?.totalDeductions ?? 0
  const net = payroll?.totalNetSalary ?? 0
  const paid = payroll?.totalPaid ?? 0

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* 1. Base Salaries */}
      <StatsCard
        title={t('totalBase')}
        value={formatCurrency(base)}
        description={t('totalBaseDesc')}
        icon={IconCash}
        badge={t('badgeStaffCount', { count: payroll?.items?.length ?? 0 })}
      />

      {/* 2. Total Additions */}
      <StatsCard
        title={t('totalAdditions')}
        value={formatCurrency(additions)}
        description={t('totalAdditionsDesc')}
        icon={IconArrowUp}
      />

      {/* 3. Total Deductions */}
      <StatsCard
        title={t('totalDeductions')}
        value={formatCurrency(deductions)}
        description={t('totalDeductionsDesc')}
        icon={IconArrowDown}
      />

      {/* 4. Total Net Payroll */}
      <StatsCard
        title={t('totalNet')}
        value={formatCurrency(net)}
        description={t('paidOfNet', {
          paid: formatCurrency(paid),
          percent: net > 0 ? Math.round((paid / net) * 100) : 0,
        })}
        icon={IconWallet}
        badge={
          payroll?.isClosed
            ? t('badgeClosed')
            : paid >= net && net > 0
              ? t('badgePaidAll')
              : t('badgePending')
        }
      />
    </div>
  )
}
