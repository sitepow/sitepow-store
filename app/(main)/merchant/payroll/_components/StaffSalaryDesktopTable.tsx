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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface StaffSalaryDesktopTableProps {
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

export function StaffSalaryDesktopTable({
  staffList,
  onOpenEdit,
  onToggle,
  onDelete,
}: StaffSalaryDesktopTableProps) {
  const tStaff = useTranslations('merchant.payroll.staff')
  const { formatCurrency } = useMerchantCurrency()

  return (
    <div className="hidden overflow-x-auto md:block">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{tStaff('thColEmployee')}</TableHead>
            <TableHead>{tStaff('position')}</TableHead>
            <TableHead>{tStaff('thColSalaryType')}</TableHead>
            <TableHead className="text-right">
              {tStaff('thColBaseSalary')}
            </TableHead>
            <TableHead>{tStaff('thColBank')}</TableHead>
            <TableHead className="text-center">
              {tStaff('thColStatus')}
            </TableHead>
            <TableHead className="text-right">
              {tStaff('thColActions')}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {staffList.map((staff) => (
            <TableRow
              key={staff.id}
              className={!staff.isActive ? 'bg-muted/20 opacity-70' : ''}
            >
              <TableCell>
                <div className="text-foreground font-semibold">
                  {staff.employeeName}
                </div>
                <div className="text-muted-foreground text-xs">
                  {staff.employeeCode || '-'}
                </div>
              </TableCell>
              <TableCell>
                <div className="text-foreground text-sm">
                  {staff.position || '-'}
                </div>
                {staff.department && (
                  <div className="text-muted-foreground text-xs">
                    {staff.department}
                  </div>
                )}
              </TableCell>
              <TableCell>
                <SalaryTypeBadge type={staff.salaryType} />
              </TableCell>
              <TableCell className="text-right">
                <div className="text-primary font-bold">
                  {formatCurrency(staff.baseSalary)}
                </div>
              </TableCell>
              <TableCell>
                {staff.bankName ||
                staff.bankAccountNumber ||
                staff.promptpayNumber ? (
                  <div className="space-y-0.5 text-xs">
                    {staff.bankName && (
                      <div className="text-foreground flex items-center gap-1 font-medium">
                        <IconBuildingBank className="text-muted-foreground size-3.5" />
                        {staff.bankName}
                      </div>
                    )}
                    {staff.bankAccountNumber && (
                      <div className="text-muted-foreground">
                        {staff.bankAccountNumber}
                      </div>
                    )}
                    {staff.promptpayNumber && (
                      <div className="text-primary text-[11px]">
                        PromptPay: {staff.promptpayNumber}
                      </div>
                    )}
                  </div>
                ) : (
                  <span className="text-muted-foreground text-xs italic">
                    -
                  </span>
                )}
              </TableCell>
              <TableCell className="text-center">
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
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1.5">
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
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
