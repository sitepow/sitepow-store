'use client'

import React, { useMemo, useState } from 'react'
import toast from 'react-hot-toast'

import { useTranslations } from 'next-intl'

import { useAnalyticsOverview } from '@/actions/hooks/analytics'
import {
  useCloseMonthlySettlement,
  useMonthlySettlement,
  useProfitPartners,
  useSaveMonthlySettlement,
} from '@/actions/hooks/profit-sharing'
import { useMerchantCurrency } from '@/hooks/use-merchant-currency'
import {
  MonthlySettlementRecord,
  PartnerRole,
  PayoutStatus,
  ProfitPayoutItem,
  ShareType,
} from '@/types/profit-sharing'
import {
  IconBuildingBank,
  IconCheck,
  IconClock,
  IconCoins,
  IconFileCheck,
  IconInfoCircle,
  IconLock,
  IconLockOpen,
  IconPhoto,
  IconPrinter,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { PayoutSlipDialog } from './PayoutSlipDialog'
import { SettlementPrintStatement } from './SettlementPrintStatement'
import { SettlementSummaryCards } from './SettlementSummaryCards'

interface MonthlySettlementViewProps {
  storeId: string
  storeName?: string
}

const MONTH_NAMES = [
  'มกราคม',
  'กุมภาพันธ์',
  'มีนาคม',
  'เมษายน',
  'พฤษภาคม',
  'มิถุนายน',
  'กรกฎาคม',
  'สิงหาคม',
  'กันยายน',
  'ตุลาคม',
  'พฤศจิกายน',
  'ธันวาคม',
]

export function MonthlySettlementView({
  storeId,
  storeName,
}: MonthlySettlementViewProps) {
  const t = useTranslations('merchant.profitSharing')
  const { format } = useMerchantCurrency()

  const currentYear = new Date().getFullYear()
  const periodOptions = useMemo(() => {
    const list = []
    for (let y = currentYear; y >= currentYear - 1; y--) {
      for (let m = 12; m >= 1; m--) {
        const monthStr = m.toString().padStart(2, '0')
        const periodKey = `${y}-${monthStr}`
        const thaiYear = y + 543
        list.push({
          value: periodKey,
          label: `${MONTH_NAMES[m - 1]} ${thaiYear}`,
          year: y,
          month: m,
        })
      }
    }
    return list
  }, [currentYear])

  const [selectedPeriod, setSelectedPeriod] = useState<string>(() => {
    const now = new Date()
    return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`
  })

  const { startDate, endDate, periodLabel } = useMemo(() => {
    const opt = periodOptions.find((p) => p.value === selectedPeriod)
    const [yStr, mStr] = selectedPeriod.split('-')
    const y = parseInt(yStr, 10)
    const m = parseInt(mStr, 10)
    const start = `${y}-${mStr}-01`
    const lastDay = new Date(y, m, 0).getDate()
    const end = `${y}-${mStr}-${lastDay.toString().padStart(2, '0')}`
    return {
      startDate: start,
      endDate: end,
      periodLabel: opt?.label || selectedPeriod,
    }
  }, [selectedPeriod, periodOptions])

  // DB queries
  const { data: existingRecord, isLoading: isSettlementLoading } =
    useMonthlySettlement(storeId, selectedPeriod)
  const { data: partners = [], isLoading: isPartnersLoading } =
    useProfitPartners(storeId)

  // Real store financial numbers
  const {
    data: analyticsData,
    isLoading: isAnalyticsLoading,
    refetch: refetchAnalytics,
  } = useAnalyticsOverview(storeId, undefined, startDate, endDate)

  const { mutate: saveSettlement, isPending: isSaving } =
    useSaveMonthlySettlement()
  const { mutate: closeSettlement, isPending: isClosing } =
    useCloseMonthlySettlement()

  const liveRevenue =
    analyticsData?.financialTrend.reduce(
      (acc, curr) => acc + curr.revenue,
      0,
    ) ?? 0
  const liveCogs =
    analyticsData?.financialTrend.reduce((acc, curr) => acc + curr.cogs, 0) ?? 0
  const liveExpense =
    analyticsData?.financialTrend.reduce(
      (acc, curr) => acc + curr.expense,
      0,
    ) ?? 0
  const liveNetProfit = liveRevenue - liveCogs - liveExpense

  const activePartners = partners.filter((p) => p.isActive)

  // Current record (from DB or dynamically calculated)
  const currentSettlementRecord: MonthlySettlementRecord = useMemo(() => {
    if (existingRecord) {
      return existingRecord
    }

    const payouts: ProfitPayoutItem[] = activePartners.map((partner) => {
      let amount = 0
      const shareVal = Number(partner.shareValue)
      if (partner.shareType === ShareType.NET_PROFIT_PERCENT) {
        const base = Math.max(0, liveNetProfit)
        amount = Math.round((base * shareVal) / 100)
      } else if (partner.shareType === ShareType.REVENUE_PERCENT) {
        amount = Math.round((liveRevenue * shareVal) / 100)
      } else if (partner.shareType === ShareType.FIXED_MONTHLY) {
        amount = shareVal
      }

      return {
        id: `draft-${partner.id}`,
        settlementId: '',
        partnerId: partner.id,
        partnerName: partner.name,
        role: partner.role,
        shareType: partner.shareType,
        shareValue: shareVal,
        calculatedAmount: amount,
        status: PayoutStatus.PENDING,
        bankName: partner.bankName,
        bankAccount: partner.bankAccount,
        bankAccountName: partner.bankAccountName,
        promptPay: partner.promptPay,
        paidAt: null,
        slipImage: null,
        paymentNote: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    })

    const totalAllocated = payouts.reduce(
      (sum, p) => sum + Number(p.calculatedAmount),
      0,
    )
    const retainedEarnings = Math.max(0, liveNetProfit - totalAllocated)

    return {
      id: '',
      storeId,
      period: selectedPeriod,
      periodLabel,
      startDate,
      endDate,
      totalRevenue: liveRevenue,
      totalCogs: liveCogs,
      totalExpense: liveExpense,
      netProfit: liveNetProfit,
      totalAllocated,
      retainedEarnings,
      payouts,
      isClosed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  }, [
    existingRecord,
    storeId,
    selectedPeriod,
    periodLabel,
    startDate,
    endDate,
    activePartners,
    liveRevenue,
    liveCogs,
    liveExpense,
    liveNetProfit,
  ])

  // Dialog states
  const [selectedPayout, setSelectedPayout] = useState<ProfitPayoutItem | null>(
    null,
  )
  const [slipDialogOpen, setSlipDialogOpen] = useState(false)
  const [printDialogOpen, setPrintDialogOpen] = useState(false)

  const handleSaveOrUpdateSettlement = (onDone?: () => void) => {
    saveSettlement(
      {
        storeId,
        period: selectedPeriod,
        periodLabel,
        startDate,
        endDate,
        totalRevenue: Number(currentSettlementRecord.totalRevenue),
        totalCogs: Number(currentSettlementRecord.totalCogs),
        totalExpense: Number(currentSettlementRecord.totalExpense),
        netProfit: Number(currentSettlementRecord.netProfit),
        totalAllocated: Number(currentSettlementRecord.totalAllocated),
        retainedEarnings: Number(currentSettlementRecord.retainedEarnings),
        isClosed: currentSettlementRecord.isClosed,
        payouts: currentSettlementRecord.payouts.map((p) => ({
          partnerId: p.partnerId,
          partnerName: p.partnerName,
          role: p.role,
          shareType: p.shareType,
          shareValue: Number(p.shareValue),
          calculatedAmount: Number(p.calculatedAmount),
          status: p.status,
          bankName: p.bankName,
          bankAccount: p.bankAccount,
          bankAccountName: p.bankAccountName,
          promptPay: p.promptPay,
          paidAt: p.paidAt ? new Date(p.paidAt).toISOString() : null,
          slipImage: p.slipImage,
          paymentNote: p.paymentNote,
        })),
      },
      {
        onSuccess: (res) => {
          if (res.success) {
            toast.success('บันทึกข้อมูลการตัดรอบลงฐานข้อมูลเรียบร้อยแล้ว')
            onDone?.()
          } else {
            toast.error(res.message || 'ไม่สามารถบันทึกข้อมูลได้')
          }
        },
      },
    )
  }

  const handleOpenSlip = (payout: ProfitPayoutItem) => {
    if (!existingRecord) {
      handleSaveOrUpdateSettlement(() => {
        setSelectedPayout(payout)
        setSlipDialogOpen(true)
      })
    } else {
      setSelectedPayout(payout)
      setSlipDialogOpen(true)
    }
  }

  const handleCloseCycle = () => {
    if (
      window.confirm(
        `ยืนยันการปิดรอบบัญชี "${periodLabel}"? หลังจากปิดแล้วจะคงตัวเลขนี้ไว้เป็นประวัติ`,
      )
    ) {
      if (existingRecord?.id) {
        closeSettlement(
          {
            settlementId: existingRecord.id,
            storeId,
            isClosed: true,
          },
          {
            onSuccess: (res: any) => {
              if (res?.success) {
                toast.success(`ปิดรอบบัญชี ${periodLabel} เรียบร้อยแล้ว`)
              } else {
                toast.error(res?.message || 'ไม่สามารถปิดรอบบัญชีได้')
              }
            },
          },
        )
      } else {
        // Save first with isClosed true
        saveSettlement(
          {
            storeId,
            period: selectedPeriod,
            periodLabel,
            startDate,
            endDate,
            totalRevenue: Number(currentSettlementRecord.totalRevenue),
            totalCogs: Number(currentSettlementRecord.totalCogs),
            totalExpense: Number(currentSettlementRecord.totalExpense),
            netProfit: Number(currentSettlementRecord.netProfit),
            totalAllocated: Number(currentSettlementRecord.totalAllocated),
            retainedEarnings: Number(currentSettlementRecord.retainedEarnings),
            isClosed: true,
            payouts: currentSettlementRecord.payouts.map((p) => ({
              partnerId: p.partnerId,
              partnerName: p.partnerName,
              role: p.role,
              shareType: p.shareType,
              shareValue: Number(p.shareValue),
              calculatedAmount: Number(p.calculatedAmount),
              status: p.status,
              bankName: p.bankName,
              bankAccount: p.bankAccount,
              bankAccountName: p.bankAccountName,
              promptPay: p.promptPay,
              paidAt: p.paidAt ? new Date(p.paidAt).toISOString() : null,
              slipImage: p.slipImage,
              paymentNote: p.paymentNote,
            })),
          },
          {
            onSuccess: (res: any) => {
              if (res?.success) {
                toast.success(`ปิดรอบบัญชี ${periodLabel} เรียบร้อยแล้ว`)
              }
            },
          },
        )
      }
    }
  }

  const handleReopenCycle = () => {
    if (existingRecord?.id) {
      closeSettlement(
        {
          settlementId: existingRecord.id,
          storeId,
          isClosed: false,
        },
        {
          onSuccess: (res: any) => {
            if (res?.success) {
              toast.success('เปิดรอบแก้ไขเรียบร้อยแล้ว')
            }
          },
        },
      )
    }
  }

  const isClosed = currentSettlementRecord.isClosed

  return (
    <div className="space-y-6">
      {/* Control Bar */}
      <div className="bg-muted/40 flex flex-col gap-3 rounded-xl border p-3.5 sm:flex-row sm:items-center sm:justify-between sm:p-4">
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:gap-3">
          <div className="flex items-center gap-2">
            <span className="text-foreground text-sm font-medium whitespace-nowrap">
              {t('settlement.selectPeriod')}:
            </span>
            <Select
              value={selectedPeriod}
              onValueChange={(val) => setSelectedPeriod(val)}
            >
              <SelectTrigger className="bg-background w-full sm:w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {periodOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            {isClosed ? (
              <Badge
                variant="outline"
                className="inline-flex items-center gap-1 border-emerald-500/30 bg-emerald-500/10 text-emerald-600"
              >
                <IconLock className="size-3" />
                {t('settlement.settlementClosed')} (DB)
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="inline-flex items-center gap-1 border-amber-500/30 bg-amber-500/10 text-amber-600"
              >
                <IconLockOpen className="size-3" />
                {existingRecord
                  ? 'บันทึกใน DB แล้ว (ยังไม่ปิดรอบ)'
                  : 'ฉบับร่างคำนวณอัตโนมัติ'}
              </Badge>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetchAnalytics()}
            title="รีเฟรชข้อมูลยอดขายและค่าใช้จ่ายล่าสุด"
            className="text-xs"
          >
            <IconRefresh className="mr-1 size-3.5" />
            ดึงยอดล่าสุด
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setPrintDialogOpen(true)}
            className="text-xs"
          >
            <IconPrinter className="mr-1 size-3.5" />
            <span className="hidden sm:inline">
              {t('settlement.printStatement')}
            </span>
            <span className="sm:hidden">พิมพ์ใบสรุป</span>
          </Button>

          {!isClosed ? (
            <Button
              size="sm"
              onClick={handleCloseCycle}
              disabled={isSaving || isClosing}
              className="col-span-2 text-xs sm:col-span-1"
            >
              <IconLock className="mr-1 size-3.5" />
              {t('settlement.closeSettlement')}
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={handleReopenCycle}
              disabled={isSaving || isClosing}
              className="col-span-2 text-xs sm:col-span-1"
            >
              <IconLockOpen className="mr-1 size-3.5" />
              เปิดรอบแก้ไข
            </Button>
          )}
        </div>
      </div>

      {/* Info notice */}
      <div className="border-primary/20 bg-primary/5 text-muted-foreground flex items-center gap-2 rounded-lg border px-3.5 py-2.5 text-xs">
        <IconInfoCircle className="text-primary size-4 shrink-0" />
        <span>{t('settlement.autoCalculatedNotice')}</span>
      </div>

      {/* 4 Stats Cards */}
      <SettlementSummaryCards
        revenue={Number(currentSettlementRecord.totalRevenue)}
        cogs={Number(currentSettlementRecord.totalCogs)}
        expense={Number(currentSettlementRecord.totalExpense)}
        netProfit={Number(currentSettlementRecord.netProfit)}
        totalAllocated={Number(currentSettlementRecord.totalAllocated)}
        retainedEarnings={Number(currentSettlementRecord.retainedEarnings)}
      />

      {/* Payout Distribution Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <IconCoins className="text-primary size-5" />
                {t('settlement.partnerPayoutList')} ({periodLabel})
              </CardTitle>
              <CardDescription>
                แจกแจงยอดเงินที่แต่ละหุ้นส่วนหรือระบบจะได้รับ
                พร้อมแนบหลักฐานการโอน
              </CardDescription>
            </div>
            {!isClosed && (
              <Button
                variant={existingRecord ? 'outline' : 'default'}
                size="sm"
                onClick={() => handleSaveOrUpdateSettlement()}
                disabled={isSaving}
              >
                {isSaving
                  ? 'กำลังบันทึก...'
                  : existingRecord
                    ? 'อัปเดตยอดใน DB'
                    : 'บันทึกยอดรอบนี้ลง DB'}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* Mobile Card View */}
          <div className="divide-y md:hidden">
            {isSettlementLoading || isPartnersLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-3 p-4">
                  <div className="flex items-start justify-between">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                  <Skeleton className="h-10 w-full rounded-lg" />
                  <Skeleton className="h-4 w-40" />
                </div>
              ))
            ) : currentSettlementRecord.payouts.length === 0 ? (
              <div className="text-muted-foreground flex flex-col items-center justify-center space-y-2 p-8 text-center">
                <IconInfoCircle className="size-8 opacity-40" />
                <p className="text-sm">{t('settlement.emptyPartners')}</p>
              </div>
            ) : (
              currentSettlementRecord.payouts.map((payout) => {
                const isPaid = payout.status === PayoutStatus.PAID
                return (
                  <div key={payout.partnerId} className="space-y-3 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-foreground font-semibold">
                          {payout.partnerName}
                        </div>
                        <Badge variant="outline" className="mt-1 text-[11px]">
                          {t(`roles.${payout.role}` as any)}
                        </Badge>
                      </div>
                      <Badge
                        variant={isPaid ? 'default' : 'secondary'}
                        className={
                          isPaid
                            ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : 'border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                        }
                      >
                        {isPaid ? (
                          <span className="flex items-center gap-1">
                            <IconCheck className="size-3" /> {t('status.PAID')}
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <IconClock className="size-3" />{' '}
                            {t('status.PENDING')}
                          </span>
                        )}
                      </Badge>
                    </div>

                    {/* Calculated Amount Box */}
                    <div className="bg-muted/40 flex items-baseline justify-between rounded-lg p-2.5">
                      <div className="text-muted-foreground text-xs">
                        {payout.shareType === ShareType.FIXED_MONTHLY ? (
                          <span>
                            ยอดคงที่ ฿
                            {Number(payout.shareValue).toLocaleString()}
                          </span>
                        ) : (
                          <span>
                            สัดส่วน {Number(payout.shareValue)}% (
                            {t(`shareTypes.${payout.shareType}` as any)})
                          </span>
                        )}
                      </div>
                      <div className="text-foreground text-lg font-bold">
                        {format(Number(payout.calculatedAmount))}
                      </div>
                    </div>

                    {/* Bank / PromptPay */}
                    {(payout.bankAccount || payout.promptPay) && (
                      <div className="text-muted-foreground space-y-0.5 text-xs">
                        {payout.bankName && (
                          <div className="text-foreground flex items-center gap-1 font-medium">
                            <IconBuildingBank className="text-muted-foreground size-3.5" />
                            {payout.bankName}
                          </div>
                        )}
                        {payout.bankAccount && (
                          <div className="font-mono">
                            {payout.bankAccount}{' '}
                            {payout.bankAccountName
                              ? `(${payout.bankAccountName})`
                              : ''}
                          </div>
                        )}
                        {payout.promptPay && (
                          <div className="text-primary text-[11px]">
                            PromptPay: {payout.promptPay}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="border-border/40 flex items-center justify-end gap-2 border-t pt-2">
                      {payout.slipImage && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-primary flex items-center gap-1 text-xs"
                          onClick={() => handleOpenSlip(payout)}
                        >
                          <IconPhoto className="size-3.5" />
                          {t('settlement.viewSlip')}
                        </Button>
                      )}
                      <Button
                        variant={isPaid ? 'outline' : 'default'}
                        size="sm"
                        className="flex-1 text-xs sm:flex-none"
                        onClick={() => handleOpenSlip(payout)}
                      >
                        <IconFileCheck className="mr-1 size-3.5" />
                        {isPaid ? 'ดูสลิป / แก้ไข' : t('settlement.markPaid')}
                      </Button>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ผู้รับส่วนแบ่ง / บทบาท</TableHead>
                  <TableHead>เงื่อนไขส่วนแบ่ง</TableHead>
                  <TableHead className="text-right">
                    {t('settlement.calculatedPayout')}
                  </TableHead>
                  <TableHead>ช่องทางรับเงิน</TableHead>
                  <TableHead className="text-center">สถานะการจ่าย</TableHead>
                  <TableHead className="text-right">การดำเนินการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isSettlementLoading || isPartnersLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <Skeleton className="h-5 w-32" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-24" />
                      </TableCell>
                      <TableCell className="text-right">
                        <Skeleton className="ml-auto h-5 w-16" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-36" />
                      </TableCell>
                      <TableCell className="text-center">
                        <Skeleton className="mx-auto h-5 w-16" />
                      </TableCell>
                      <TableCell className="text-right">
                        <Skeleton className="ml-auto h-5 w-20" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : currentSettlementRecord.payouts.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-muted-foreground h-32 text-center"
                    >
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <IconInfoCircle className="size-8 opacity-40" />
                        <p>{t('settlement.emptyPartners')}</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  currentSettlementRecord.payouts.map((payout) => {
                    const isPaid = payout.status === PayoutStatus.PAID
                    return (
                      <TableRow key={payout.partnerId}>
                        {/* Name & Role */}
                        <TableCell>
                          <div className="text-foreground font-semibold">
                            {payout.partnerName}
                          </div>
                          <Badge
                            variant="outline"
                            className="mt-0.5 text-[11px]"
                          >
                            {t(`roles.${payout.role}` as any)}
                          </Badge>
                        </TableCell>

                        {/* Share Type & Value */}
                        <TableCell>
                          <div className="text-sm font-medium">
                            {payout.shareType === ShareType.FIXED_MONTHLY ? (
                              <span>
                                คงที่ ฿
                                {Number(payout.shareValue).toLocaleString()}
                              </span>
                            ) : (
                              <span>{Number(payout.shareValue)}%</span>
                            )}
                          </div>
                          <div className="text-muted-foreground text-xs">
                            {t(`shareTypes.${payout.shareType}` as any)}
                          </div>
                        </TableCell>

                        {/* Calculated Amount */}
                        <TableCell className="text-foreground text-right text-base font-bold">
                          {format(Number(payout.calculatedAmount))}
                        </TableCell>

                        {/* Bank / Account */}
                        <TableCell>
                          {payout.bankAccount || payout.promptPay ? (
                            <div className="space-y-0.5 text-xs">
                              {payout.bankName && (
                                <div className="text-foreground flex items-center gap-1 font-medium">
                                  <IconBuildingBank className="text-muted-foreground size-3" />
                                  {payout.bankName}
                                </div>
                              )}
                              {payout.bankAccount && (
                                <div className="text-muted-foreground">
                                  {payout.bankAccount}
                                </div>
                              )}
                              {payout.promptPay && (
                                <div className="text-primary text-[11px]">
                                  PromptPay: {payout.promptPay}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-xs italic">
                              -
                            </span>
                          )}
                        </TableCell>

                        {/* Status */}
                        <TableCell className="text-center">
                          <Badge
                            variant={isPaid ? 'default' : 'secondary'}
                            className={
                              isPaid
                                ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                : 'border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                            }
                          >
                            {isPaid ? (
                              <span className="flex items-center gap-1">
                                <IconCheck className="size-3" />{' '}
                                {t('status.PAID')}
                              </span>
                            ) : (
                              <span className="flex items-center gap-1">
                                <IconClock className="size-3" />{' '}
                                {t('status.PENDING')}
                              </span>
                            )}
                          </Badge>
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {payout.slipImage && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-primary flex items-center gap-1 text-xs"
                                onClick={() => handleOpenSlip(payout)}
                              >
                                <IconPhoto className="size-3.5" />
                                {t('settlement.viewSlip')}
                              </Button>
                            )}
                            <Button
                              variant={isPaid ? 'outline' : 'default'}
                              size="sm"
                              className="text-xs"
                              onClick={() => handleOpenSlip(payout)}
                            >
                              <IconFileCheck className="mr-1 size-3.5" />
                              {isPaid
                                ? 'ดูสลิป/แก้ไข'
                                : t('settlement.markPaid')}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Slip Dialog */}
      <PayoutSlipDialog
        open={slipDialogOpen}
        setOpen={setSlipDialogOpen}
        storeId={storeId}
        period={selectedPeriod}
        settlementId={currentSettlementRecord.id}
        payout={selectedPayout}
      />

      {/* Print Statement Dialog */}
      <SettlementPrintStatement
        open={printDialogOpen}
        setOpen={setPrintDialogOpen}
        settlement={currentSettlementRecord}
        storeName={storeName}
      />
    </div>
  )
}
