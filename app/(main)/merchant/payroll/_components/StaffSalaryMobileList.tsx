'use client'

import React from 'react'

import { useTranslations } from 'next-intl'

import { SalaryType } from '@/generated/prisma/enums'
import { useMerchantCurrency } from '@/hooks/use-merchant-currency'
import { EmployeeSalaryConfigItem } from '@/types/payroll'
import {
  IconBuildingBank,
  IconEdit,
  IconPower,
  IconTrash,
} from '@tabler/icons-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface StaffSalaryMobileListProps {
  staffList: EmployeeSalaryConfigItem[]
  onOpenEdit: (staff: EmployeeSalaryConfigItem) => void
  onToggle: (staff: EmployeeSalaryConfigItem) => void
  onDelete: (staff: EmployeeSalaryConfigItem) => void
}

function SalaryTypeBadge({ type }: { type: SalaryType }) {
  const tTypes = useTranslations('merchant.payroll.salaryTypes')
  switch (type) {
    case SalaryType.MONTHLY:
      return (
        <Badge variant="outline" className="border-blue-200 text-blue-600">
          {tTypes('MONTHLY')}
        </Badge>
      )
    case SalaryType.DAILY:
      return (
        <Badge variant="outline" className="border-amber-200 text-amber-600">
          {tTypes('DAILY')}
        </Badge>
      )
    case SalaryType.HOURLY:
      return (
        <Badge
          variant="outline"
          className="border-emerald-200 text-emerald-600"
        >
          {tTypes('HOURLY')}
        </Badge>
      )
    case SalaryType.COMMISSION:
      return (
        <Badge variant="outline" className="border-purple-200 text-purple-600">
          {tTypes('COMMISSION')}
        </Badge>
      )
  }
}

export function StaffSalaryMobileList({
  staffList,
  onOpenEdit,
  onToggle,
  onDelete,
}: StaffSalaryMobileListProps) {
  const tStaff = useTranslations('merchant.payroll.staff')
  const { formatCurrency } = useMerchantCurrency()

  return (
    <div className="divide-border/60 space-y-3 divide-y p-3 md:hidden">
      {staffList.map((staff) => (
        <div
          key={staff.id}
          className={`border-border/60 bg-card space-y-3 rounded-xl border p-4 ${
            !staff.isActive ? 'bg-muted/20 opacity-70' : ''
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="text-foreground text-base font-semibold">
                {staff.employeeName}
              </div>
              <div className="text-muted-foreground text-xs">
                {staff.employeeCode ? `${staff.employeeCode} • ` : ''}
                {staff.position || '-'}
                {staff.department ? ` (${staff.department})` : ''}
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              {staff.isActive ? (
                <Badge className="border-emerald-200 bg-emerald-500/10 text-xs text-emerald-600">
                  {tStaff('active')}
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="text-muted-foreground text-xs"
                >
                  {tStaff('inactive')}
                </Badge>
              )}
              <SalaryTypeBadge type={staff.salaryType} />
            </div>
          </div>

          <div className="bg-muted/30 flex items-center justify-between rounded-lg p-2.5 text-sm">
            <span className="text-muted-foreground text-xs">
              {tStaff('baseSalary')}:
            </span>
            <span className="text-primary font-semibold">
              {formatCurrency(staff.baseSalary)}
            </span>
          </div>

          {(staff.bankName ||
            staff.bankAccountNumber ||
            staff.promptpayNumber) && (
            <div className="bg-muted/10 border-border/40 space-y-1 rounded border p-2 text-xs">
              {staff.bankName && (
                <div className="text-foreground flex items-center gap-1 font-medium">
                  <IconBuildingBank className="text-muted-foreground size-3.5" />
                  {staff.bankName}
                </div>
              )}
              {staff.bankAccountNumber && (
                <div className="text-muted-foreground">
                  {tStaff('dialog.bankAccountNumber')}:{' '}
                  {staff.bankAccountNumber}
                </div>
              )}
              {staff.promptpayNumber && (
                <div className="text-primary text-[11px]">
                  {tStaff('accountPromptPay')}: {staff.promptpayNumber}
                </div>
              )}
            </div>
          )}

          <div className="border-border/40 flex items-center gap-2 border-t pt-1">
            <Button
              variant="outline"
              size="icon-lg"
              onClick={() => onOpenEdit(staff)}
            >
              <IconEdit className="size-3.5" />
            </Button>
            <Button
              variant="outline"
              size="icon-lg"
              onClick={() => onToggle(staff)}
            >
              <IconPower className="size-3.5" />
            </Button>
            <Button
              variant="outline"
              size="icon-lg"
              onClick={() => onDelete(staff)}
            >
              <IconTrash className="size-3.5" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
