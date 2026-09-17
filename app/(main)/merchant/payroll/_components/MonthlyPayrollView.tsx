'use client'

import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

import { useLocale, useTranslations } from 'next-intl'

import {
  useCloseMonthlyPayroll,
  useMonthlyPayroll,
  useSaveMonthlyPayroll,
  useSyncPayrollToExpense,
} from '@/actions/hooks/payroll'
import { useMerchantCurrency } from '@/hooks/use-merchant-currency'
import { MonthlyPayrollItemRecord } from '@/types/payroll'
import {
  IconArrowRight,
  IconCheck,
  IconDeviceFloppy,
  IconFileCheck,
  IconLock,
  IconLockOpen,
  IconPrinter,
  IconReceipt,
  IconReceipt2,
  IconReceiptTax,
  IconRefresh,
} from '@tabler/icons-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { PayrollPrintPayslip } from './PayrollPrintPayslip'
import { PayrollSlipDialog } from './PayrollSlipDialog'
import { PayrollSummaryCards } from './PayrollSummaryCards'

interface MonthlyPayrollViewProps {
  storeId: string
  storeName?: string
}

export function MonthlyPayrollView({
  storeId,
  storeName: propStoreName,
}: MonthlyPayrollViewProps) {
  const t = useTranslations('merchant.payroll')
  const storeName = propStoreName || t('settlement.payslip.storeFallback')
  const locale = useLocale()
  const { formatCurrency } = useMerchantCurrency()

  // Generate recent 12 months for period select
  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth() + 1
  const defaultPeriod = `${currentYear}-${String(currentMonth).padStart(2, '0')}`

  const [period, setPeriod] = useState<string>(defaultPeriod)

  const { data: res, isLoading, refetch } = useMonthlyPayroll(storeId, period)
  const saveMutation = useSaveMonthlyPayroll()
  const syncExpenseMutation = useSyncPayrollToExpense()
  const closeMutation = useCloseMonthlyPayroll()

  const payroll = res?.data

  // Editable items state
  const [items, setItems] = useState<MonthlyPayrollItemRecord[]>([])
  const [selectedSlipItem, setSelectedSlipItem] =
    useState<MonthlyPayrollItemRecord | null>(null)
  const [slipDialogOpen, setSlipDialogOpen] = useState(false)
  const [printItem, setPrintItem] = useState<MonthlyPayrollItemRecord | null>(
    null,
  )
  const [printDialogOpen, setPrintDialogOpen] = useState(false)

  useEffect(() => {
    if (payroll?.items) {
      setItems(payroll.items)
    } else {
      setItems([])
    }
  }, [payroll])

  // Handle item number change
  const handleItemChange = (
    index: number,
    field:
      'overtimeAmount' | 'bonusAmount' | 'commissionAmount' | 'deductionAmount',
    val: number,
  ) => {
    const updated = [...items]
    const item = { ...updated[index], [field]: val }
    const base = item.baseSalary || 0
    const ot = item.overtimeAmount || 0
    const bonus = item.bonusAmount || 0
    const comm = item.commissionAmount || 0
    const deduct = item.deductionAmount || 0
    item.netSalary = Math.max(0, base + ot + bonus + comm - deduct)
    updated[index] = item
    setItems(updated)
  }

  const handleSave = async () => {
    try {
      const result = await saveMutation.mutateAsync({
        storeId,
        period,
        items: items.map((it) => ({
          id: it.id,
          employeeConfigId: it.employeeConfigId,
          employeeName: it.employeeName,
          employeeCode: it.employeeCode,
          department: it.department,
          position: it.position,
          salaryType: it.salaryType,
          baseSalary: it.baseSalary,
          overtimeAmount: it.overtimeAmount,
          bonusAmount: it.bonusAmount,
          commissionAmount: it.commissionAmount,
          deductionAmount: it.deductionAmount,
          netSalary: it.netSalary,
          status: it.status,
          bankName: it.bankName,
          bankAccount: it.bankAccount,
          bankAccountName: it.bankAccountName,
          promptPay: it.promptPay,
          slipImage: it.slipImage,
          paymentNote: it.paymentNote,
        })),
      })

      if (result.success) {
        toast.success(t('settlement.saveSuccess'))
      } else {
        toast.error(result.message || t('settlement.saveFailed'))
      }
    } catch {
      toast.error(t('settlement.saveFailed'))
    }
  }

  const handleSyncToExpense = async () => {
    if (!payroll?.id || payroll.isDraft) {
      toast.error(t('settlement.saveChanges'))
      return
    }

    try {
      const res = await syncExpenseMutation.mutateAsync({
        payrollId: payroll.id,
        storeId,
        period,
      })

      if (res.success) {
        toast.success(t('settlement.syncSuccess'))
      } else {
        toast.error(res.message || t('settlement.saveFailed'))
      }
    } catch {
      toast.error(t('settlement.saveFailed'))
    }
  }

  const handleToggleClose = async () => {
    if (!payroll?.id || payroll.isDraft) {
      toast.error(t('settlement.saveChanges'))
      return
    }

    const willClose = !payroll.isClosed
    if (willClose && !confirm(t('settlement.closePayroll'))) {
      return
    }

    try {
      const res = await closeMutation.mutateAsync({
        payrollId: payroll.id,
        storeId,
        isClosed: willClose,
        autoRecordExpense: true,
        period,
      })

      if (res.success) {
        toast.success(
          willClose
            ? t('settlement.closeSuccess')
            : t('settlement.reopenSuccess'),
        )
      } else {
        toast.error(
          res.message ||
            (willClose
              ? t('settlement.closeFailed')
              : t('settlement.reopenFailed')),
        )
      }
    } catch {
      toast.error(
        willClose ? t('settlement.closeFailed') : t('settlement.reopenFailed'),
      )
    }
  }

  const openSlipModal = (item: MonthlyPayrollItemRecord) => {
    setSelectedSlipItem(item)
    setSlipDialogOpen(true)
  }

  const openPrintModal = (item: MonthlyPayrollItemRecord) => {
    setPrintItem(item)
    setPrintDialogOpen(true)
  }

  const isClosed = payroll?.isClosed ?? false

  return (
    <div className="space-y-6">
      {/* 1. Period Selector & Action Bar */}
      <div className="border-border/70 bg-card flex flex-col gap-4 rounded-xl border p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <div className="text-foreground flex items-center gap-1.5 text-sm font-semibold">
            <IconReceiptTax className="text-primary size-5" />
            {t('settlement.selectPeriod')}:
          </div>
          <Select value={period} onValueChange={(val) => setPeriod(val)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t('settlement.selectPeriod')} />
            </SelectTrigger>
            <SelectContent>
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((offset) => {
                const d = new Date()
                d.setMonth(d.getMonth() - offset)
                const y = d.getFullYear()
                const m = String(d.getMonth() + 1).padStart(2, '0')
                const val = `${y}-${m}`
                const label = d.toLocaleDateString(
                  locale === 'th' ? 'th-TH' : 'en-US',
                  {
                    month: 'long',
                    year: 'numeric',
                  },
                )
                return (
                  <SelectItem key={val} value={val}>
                    {label}
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>

          {isClosed ? (
            <Badge className="border-emerald-200 bg-emerald-500/10 text-emerald-600">
              <IconLock className="mr-1 size-3" />
              {t('settlement.closed')}
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="inline-flex items-center gap-1 border-amber-500/30 bg-amber-500/10 text-amber-600"
            >
              <IconLockOpen className="mr-1 size-3" />
              {t('settlement.open')}
            </Badge>
          )}

          {payroll?.expenseId && (
            <Badge className="border-blue-200 bg-blue-500/10 text-blue-600">
              <IconReceipt className="mr-1 size-3" />
              {t('settlement.expenseLinked')}
            </Badge>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {!isClosed && (
            <Button
              variant="outline"
              size="sm"
              disabled={saveMutation.isPending}
              onClick={handleSave}
            >
              <IconDeviceFloppy className="mr-1 size-4" />
              {saveMutation.isPending
                ? t('settlement.saving')
                : t('settlement.saveChanges')}
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            disabled={syncExpenseMutation.isPending || !payroll?.id}
            onClick={handleSyncToExpense}
            className="text-primary hover:text-primary"
          >
            <IconReceipt className="mr-1 size-4" />
            {syncExpenseMutation.isPending
              ? t('settlement.saving')
              : t('settlement.syncExpense')}
          </Button>

          <Button
            size="sm"
            variant={isClosed ? 'outline' : 'default'}
            disabled={closeMutation.isPending || !payroll?.id}
            onClick={handleToggleClose}
          >
            {isClosed ? (
              <>
                <IconLockOpen className="mr-1 size-4" />
                {t('settlement.reopenPayroll')}
              </>
            ) : (
              <>
                <IconLock className="mr-1 size-4" />
                {t('settlement.closePayroll')}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* 2. Summary Cards with StatsCard */}
      <PayrollSummaryCards payroll={payroll} isLoading={isLoading} />

      {/* 3. Payroll Calculation Table / Card */}
      <Card>
        <CardHeader className="flex flex-col gap-2 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <IconReceipt2 className="text-primary size-5" />
              {t('settlement.employeeList')} ({payroll?.periodLabel || period})
            </CardTitle>
            <CardDescription>{t('description')}</CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            className="text-muted-foreground text-xs"
          >
            <IconRefresh className="mr-1 size-3.5" />
            {t('tabs.settlementShort')}
          </Button>
        </CardHeader>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="text-muted-foreground animate-pulse p-8 text-center text-sm">
              {t('settlement.saving')}
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center space-y-3 p-10 text-center">
              <IconReceiptTax className="text-muted-foreground/40 size-10" />
              <div className="space-y-1">
                <p className="text-foreground text-sm font-medium">
                  ยังไม่มีรายการพนักงานสำหรับคำนวณเงินเดือนในรอบนี้
                </p>
                <p className="text-muted-foreground max-w-md text-xs">
                  กรุณาไปที่แท็บ &quot;รายชื่อ & กำหนดฐานเงินเดือน&quot;
                  เพื่อซิงค์หรือเพิ่มพนักงานและกำหนดฐานเงินเดือนก่อนเริ่มคำนวณงวดเงินเดือน
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* DESKTOP TABLE VIEW */}
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

                        {/* OT Input */}
                        <TableCell className="text-right">
                          <Input
                            type="number"
                            min="0"
                            disabled={isClosed}
                            className="h-8 w-24 text-right text-xs"
                            value={item.overtimeAmount || ''}
                            placeholder="0"
                            onChange={(e) =>
                              handleItemChange(
                                idx,
                                'overtimeAmount',
                                Number(e.target.value) || 0,
                              )
                            }
                          />
                        </TableCell>

                        {/* Bonus Input */}
                        <TableCell className="text-right">
                          <Input
                            type="number"
                            min="0"
                            disabled={isClosed}
                            className="h-8 w-24 text-right text-xs"
                            value={item.bonusAmount || ''}
                            placeholder="0"
                            onChange={(e) =>
                              handleItemChange(
                                idx,
                                'bonusAmount',
                                Number(e.target.value) || 0,
                              )
                            }
                          />
                        </TableCell>

                        {/* Commission Input */}
                        <TableCell className="text-right">
                          <Input
                            type="number"
                            min="0"
                            disabled={isClosed}
                            className="h-8 w-24 text-right text-xs"
                            value={item.commissionAmount || ''}
                            placeholder="0"
                            onChange={(e) =>
                              handleItemChange(
                                idx,
                                'commissionAmount',
                                Number(e.target.value) || 0,
                              )
                            }
                          />
                        </TableCell>

                        {/* Deduction Input */}
                        <TableCell className="text-right">
                          <Input
                            type="number"
                            min="0"
                            disabled={isClosed}
                            className="h-8 w-24 text-right text-xs font-medium text-rose-600"
                            value={item.deductionAmount || ''}
                            placeholder="0"
                            onChange={(e) =>
                              handleItemChange(
                                idx,
                                'deductionAmount',
                                Number(e.target.value) || 0,
                              )
                            }
                          />
                        </TableCell>

                        {/* Net Salary */}
                        <TableCell className="text-primary text-right font-bold">
                          {formatCurrency(item.netSalary)}
                        </TableCell>

                        {/* Payout Status */}
                        <TableCell className="text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2"
                            onClick={() => openSlipModal(item)}
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

                        {/* Actions */}
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="outline"
                              size="icon-lg"
                              title={t('settlement.viewSlip')}
                              onClick={() => openSlipModal(item)}
                            >
                              <IconReceipt className="text-muted-foreground size-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon-lg"
                              title={t('settlement.printPayslip')}
                              onClick={() => openPrintModal(item)}
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

              {/* MOBILE CARD VIEW */}
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
                        {item.status === 'PAID'
                          ? t('status.PAID')
                          : t('status.PENDING')}
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
                              handleItemChange(
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
                              handleItemChange(
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
                              handleItemChange(
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
                              handleItemChange(
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
                        onClick={() => openSlipModal(item)}
                      >
                        <IconReceipt className="size-3.5" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon-lg"
                        onClick={() => openPrintModal(item)}
                      >
                        <IconPrinter className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Slip Dialog */}
      <PayrollSlipDialog
        open={slipDialogOpen}
        onOpenChange={setSlipDialogOpen}
        storeId={storeId}
        period={period}
        item={selectedSlipItem}
      />

      {/* Print Dialog */}
      {payroll && (
        <PayrollPrintPayslip
          open={printDialogOpen}
          onOpenChange={setPrintDialogOpen}
          payroll={payroll}
          item={printItem}
          storeName={storeName}
        />
      )}
    </div>
  )
}
