'use client'

import { useTranslations } from 'next-intl'

import { MonthlyPayrollItemRecord } from '@/types/payroll'
import { IconPrinter, IconReceipt } from '@tabler/icons-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface PayrollMobileCardsProps {
  items: MonthlyPayrollItemRecord[]
  isClosed: boolean
  formatCurrency: (val: number) => string
  onItemChange: (
    index: number,
    field:
      'overtimeAmount' | 'bonusAmount' | 'commissionAmount' | 'deductionAmount',
    val: number,
  ) => void
  onOpenSlip: (item: MonthlyPayrollItemRecord) => void
  onOpenPrint: (item: MonthlyPayrollItemRecord) => void
}

export function PayrollMobileCards({
  items,
  isClosed,
  formatCurrency,
  onItemChange,
  onOpenSlip,
  onOpenPrint,
}: PayrollMobileCardsProps) {
  const t = useTranslations('merchant.payroll')

  return (
    <div className="divide-border/60 space-y-4 divide-y p-3 md:hidden">
      {items.map((item, idx) => (
        <div
          key={item.id || idx}
          className="border-border/70 bg-card space-y-3 rounded-xl border p-4"
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="text-foreground text-base font-semibold">
                {item.employeeName}
              </div>
              <div className="text-muted-foreground text-xs">
                {item.position || '-'}
                {item.department ? ` • ${item.department}` : ''}
              </div>
            </div>
            <Badge
              className={
                item.status === 'PAID'
                  ? 'border-emerald-200 bg-emerald-500/10 text-emerald-600'
                  : 'border-amber-200 bg-amber-500/10 text-amber-600'
              }
            >
              {item.status === 'PAID' ? t('status.PAID') : t('status.PENDING')}
            </Badge>
          </div>

          <div className="bg-muted/20 grid grid-cols-2 gap-2 rounded-lg p-2.5 text-xs">
            <div>
              <span className="text-muted-foreground">
                {t('settlement.thColBaseSalary')}:
              </span>{' '}
              <span className="font-medium">
                {formatCurrency(item.baseSalary)}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">
                {t('settlement.thColNet')}:
              </span>{' '}
              <span className="text-primary font-bold">
                {formatCurrency(item.netSalary)}
              </span>
            </div>
          </div>

          {!isClosed && (
            <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
              <div>
                <label className="text-muted-foreground text-[11px]">
                  {t('settlement.thColOvertime')}:
                </label>
                <Input
                  type="number"
                  min="0"
                  className="mt-0.5 h-8 text-xs"
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
              </div>
              <div>
                <label className="text-muted-foreground text-[11px]">
                  {t('settlement.thColBonus')}:
                </label>
                <Input
                  type="number"
                  min="0"
                  className="mt-0.5 h-8 text-xs"
                  value={item.bonusAmount || ''}
                  placeholder="0"
                  onChange={(e) =>
                    onItemChange(
                      idx,
                      'bonusAmount',
                      Number(e.target.value) || 0,
                    )
                  }
                />
              </div>
              <div>
                <label className="text-muted-foreground text-[11px]">
                  {t('settlement.thColCommission')}:
                </label>
                <Input
                  type="number"
                  min="0"
                  className="mt-0.5 h-8 text-xs"
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
              </div>
              <div>
                <label className="text-[11px] text-rose-500">
                  {t('settlement.thColDeductions')}:
                </label>
                <Input
                  type="number"
                  min="0"
                  className="mt-0.5 h-8 text-xs font-medium text-rose-600"
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
              </div>
            </div>
          )}

          <div className="border-border/50 flex items-center gap-2 border-t pt-1">
            <Button
              variant="outline"
              size="icon-lg"
              onClick={() => onOpenSlip(item)}
            >
              <IconReceipt className="size-3.5" />
            </Button>
            <Button
              variant="outline"
              size="icon-lg"
              onClick={() => onOpenPrint(item)}
            >
              <IconPrinter className="size-3.5" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
