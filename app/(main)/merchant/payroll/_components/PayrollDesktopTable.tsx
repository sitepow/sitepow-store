'use client'

import { useTranslations } from 'next-intl'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { MonthlyPayrollItemRecord } from '@/types/payroll'
import { IconCheck, IconPrinter, IconReceipt } from '@tabler/icons-react'

interface PayrollDesktopTableProps {
  items: MonthlyPayrollItemRecord[]
  isClosed: boolean
  formatCurrency: (val: number) => string
  onItemChange: (
    index: number,
    field:
      | 'overtimeAmount'
      | 'bonusAmount'
      | 'commissionAmount'
      | 'deductionAmount',
    val: number,
  ) => void
  onOpenSlip: (item: MonthlyPayrollItemRecord) => void
  onOpenPrint: (item: MonthlyPayrollItemRecord) => void
}

export function PayrollDesktopTable({
  items,
  isClosed,
  formatCurrency,
  onItemChange,
  onOpenSlip,
  onOpenPrint,
}: PayrollDesktopTableProps) {
  const t = useTranslations('merchant.payroll')

  return (
    <div className="hidden overflow-x-auto md:block">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('settlement.thColEmployee')}</TableHead>
            <TableHead className="text-right">
              {t('settlement.thColBaseSalary')}
            </TableHead>
            <TableHead className="w-28 text-right">
              {t('settlement.thColOvertime')}
            </TableHead>
            <TableHead className="w-28 text-right">
              {t('settlement.thColBonus')}
            </TableHead>
            <TableHead className="w-28 text-right">
              {t('settlement.thColCommission')}
            </TableHead>
            <TableHead className="w-28 text-right">
              {t('settlement.thColDeductions')}
            </TableHead>
            <TableHead className="text-right">
              {t('settlement.thColNet')}
            </TableHead>
            <TableHead className="text-center">
              {t('settlement.thColStatus')}
            </TableHead>
            <TableHead className="text-right">
              {t('settlement.thColActions')}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item, idx) => (
            <TableRow key={item.id || idx}>
              <TableCell>
                <div className="text-foreground font-medium">
                  {item.employeeName}
                </div>
                <div className="text-muted-foreground text-xs">
                  {item.position || '-'}
                  {item.department ? ` • ${item.department}` : ''}
                </div>
              </TableCell>

              <TableCell className="text-right font-medium">
                {formatCurrency(item.baseSalary)}
              </TableCell>

              <TableCell className="text-right">
                <Input
                  type="number"
                  min="0"
                  disabled={isClosed}
                  className="h-8 w-24 text-right text-xs"
                  value={item.overtimeAmount || ''}
                  placeholder="0"
                  onChange={(e) =>
                    onItemChange(
                      idx,
                      'overtimeAmount',
                      Number(e.target.value) || 0,
                    )
                  }
                />
              </TableCell>

              <TableCell className="text-right">
                <Input
                  type="number"
                  min="0"
                  disabled={isClosed}
                  className="h-8 w-24 text-right text-xs"
                  value={item.bonusAmount || ''}
                  placeholder="0"
                  onChange={(e) =>
                    onItemChange(idx, 'bonusAmount', Number(e.target.value) || 0)
                  }
                />
              </TableCell>

              <TableCell className="text-right">
                <Input
                  type="number"
                  min="0"
                  disabled={isClosed}
                  className="h-8 w-24 text-right text-xs"
                  value={item.commissionAmount || ''}
                  placeholder="0"
                  onChange={(e) =>
                    onItemChange(
                      idx,
                      'commissionAmount',
                      Number(e.target.value) || 0,
                    )
                  }
                />
              </TableCell>

              <TableCell className="text-right">
                <Input
                  type="number"
                  min="0"
                  disabled={isClosed}
                  className="h-8 w-24 text-right text-xs font-medium text-rose-600"
                  value={item.deductionAmount || ''}
                  placeholder="0"
                  onChange={(e) =>
                    onItemChange(
                      idx,
                      'deductionAmount',
                      Number(e.target.value) || 0,
                    )
                  }
                />
              </TableCell>

              <TableCell className="text-primary text-right font-bold">
                {formatCurrency(item.netSalary)}
              </TableCell>

              <TableCell className="text-center">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2"
                  onClick={() => onOpenSlip(item)}
                >
                  {item.status === 'PAID' ? (
                    <Badge className="border-emerald-200 bg-emerald-500/10 text-emerald-600">
                      <IconCheck className="mr-1 size-3" />
                      {t('status.PAID')}
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="border-amber-300 text-amber-600"
                    >
                      {t('status.PENDING')}
                    </Badge>
                  )}
                </Button>
              </TableCell>

              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="outline"
                    size="icon-lg"
                    title={t('settlement.viewSlip')}
                    onClick={() => onOpenSlip(item)}
                  >
                    <IconReceipt className="text-muted-foreground size-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon-lg"
                    title={t('settlement.printPayslip')}
                    onClick={() => onOpenPrint(item)}
                  >
                    <IconPrinter className="text-muted-foreground size-4" />
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

