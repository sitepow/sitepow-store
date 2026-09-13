'use client'

import React from 'react'

import { StatsCard } from '@/app/sites/[domain]/_components/StatsCard'
import { useMerchantCurrency } from '@/hooks/use-merchant-currency'
import { MonthlyPayrollRecord } from '@/types/payroll'
import {
  IconArrowDown,
  IconArrowUp,
  IconCash,
  IconWallet,
} from '@tabler/icons-react'

interface PayrollSummaryCardsProps {
  payroll?: MonthlyPayrollRecord
  isLoading?: boolean
}

export function PayrollSummaryCards({
  payroll,
  isLoading = false,
}: PayrollSummaryCardsProps) {
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
        title="ฐานเงินเดือนรวม"
        value={formatCurrency(base)}
        description="ยอดเงินเดือน/ค่าจ้างตั้งต้นของพนักงาน"
        icon={IconCash}
        badge={`${payroll?.items?.length ?? 0} คน`}
      />

      {/* 2. Total Additions */}
      <StatsCard
        title="เงินเพิ่มรวม (OT/โบนัส/คอม)"
        value={formatCurrency(additions)}
        description="ค่าล่วงเวลาและผลตอบแทนพิเศษ"
        icon={IconArrowUp}
      />

      {/* 3. Total Deductions */}
      <StatsCard
        title="ยอดหักรวม"
        value={formatCurrency(deductions)}
        description="ขาด ลา มาสาย หักภาษี ประกันสังคม"
        icon={IconArrowDown}
      />

      {/* 4. Total Net Payroll */}
      <StatsCard
        title="ยอดจ่ายสุทธิรวม"
        value={formatCurrency(net)}
        description={`จ่ายแล้ว ${formatCurrency(paid)} (${net > 0 ? Math.round((paid / net) * 100) : 0}%)`}
        icon={IconWallet}
        badge={
          payroll?.isClosed
            ? 'ปิดรอบแล้ว'
            : paid >= net && net > 0
              ? 'จ่ายครบแล้ว'
              : 'รอดำเนินการ'
        }
      />
    </div>
  )
}
