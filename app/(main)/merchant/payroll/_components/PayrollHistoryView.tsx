'use client'

import React from 'react'

import { useMonthlyPayrollHistory } from '@/actions/hooks/payroll'
import { StatsCard } from '@/app/sites/[domain]/_components/StatsCard'
import { useMerchantCurrency } from '@/hooks/use-merchant-currency'
import { MonthlyPayrollRecord } from '@/types/payroll'
import {
  IconArrowRight,
  IconCalendarEvent,
  IconCheck,
  IconClock,
  IconHistory,
  IconLock,
  IconReceipt,
  IconUsers,
  IconWallet,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface PayrollHistoryViewProps {
  storeId: string
  onSelectPeriod: (period: string) => void
}

export function PayrollHistoryView({
  storeId,
  onSelectPeriod,
}: PayrollHistoryViewProps) {
  const { formatCurrency } = useMerchantCurrency()
  const { data: res, isLoading } = useMonthlyPayrollHistory(storeId)

  const historyList = res?.data || []

  const totalCumulativePaid = historyList.reduce(
    (acc, cur) => acc + cur.totalPaid,
    0,
  )
  const totalPeriods = historyList.length
  const closedPeriods = historyList.filter((h) => h.isClosed).length

  return (
    <div className="space-y-6">
      {/* 1. Summary Cards with StatsCard */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatsCard
          title="งวดเงินเดือนทั้งหมด"
          value={`${totalPeriods} งวด`}
          description={`ปิดรอบแล้ว ${closedPeriods} งวด`}
          icon={IconCalendarEvent}
        />
        <StatsCard
          title="ยอดจ่ายเงินเดือนสะสมทั้งหมด"
          value={formatCurrency(totalCumulativePaid)}
          description="ยอดเงินที่โอนจ่ายพนักงานจริงทุกงวด"
          icon={IconWallet}
          valueClassName="text-primary font-bold"
        />
        <StatsCard
          title="เชื่อมโยงค่าใช้จ่ายร้านค้า"
          value={`${historyList.filter((h) => !!h.expenseId).length} / ${totalPeriods} งวด`}
          description="บันทึกเข้าตาราง Expenses แล้ว"
          icon={IconReceipt}
        />
      </div>

      {/* 2. History Table / Card */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <IconHistory className="text-primary size-5" />
            ประวัติการตัดรอบและจ่ายเงินเดือนย้อนหลัง
          </CardTitle>
          <CardDescription>
            บันทึกประวัติการจ่ายเงินเดือนพนักงานและการเชื่อมโยงค่าใช้จ่ายในแต่ละรอบ
          </CardDescription>
        </CardHeader>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="text-muted-foreground animate-pulse p-8 text-center text-sm">
              กำลังโหลดประวัติงวดเงินเดือน...
            </div>
          ) : historyList.length === 0 ? (
            <div className="text-muted-foreground p-8 text-center text-sm">
              ยังไม่มีประวัติการตัดรอบเงินเดือนที่บันทึกในระบบ
            </div>
          ) : (
            <>
              {/* DESKTOP TABLE VIEW */}
              <div className="hidden overflow-x-auto md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>งวดประจำเดือน</TableHead>
                      <TableHead className="text-center">
                        จำนวนพนักงาน
                      </TableHead>
                      <TableHead className="text-right">
                        ฐานเงินเดือนรวม
                      </TableHead>
                      <TableHead className="text-right">ยอดสุทธิรวม</TableHead>
                      <TableHead className="text-right">
                        ยอดที่โอนแล้ว
                      </TableHead>
                      <TableHead className="text-center">สถานะรอบ</TableHead>
                      <TableHead className="text-center">
                        ค่าใช้จ่ายร้านค้า
                      </TableHead>
                      <TableHead className="text-right">การจัดการ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {historyList.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>
                          <div className="text-foreground font-semibold">
                            {record.periodLabel}
                          </div>
                          <div className="text-muted-foreground text-xs">
                            {record.period}
                          </div>
                        </TableCell>

                        <TableCell className="text-center">
                          <Badge variant="outline">
                            {record.items.length} คน
                          </Badge>
                        </TableCell>

                        <TableCell className="text-muted-foreground text-right">
                          {formatCurrency(record.totalBaseSalary)}
                        </TableCell>

                        <TableCell className="text-foreground text-right font-bold">
                          {formatCurrency(record.totalNetSalary)}
                        </TableCell>

                        <TableCell className="text-right font-semibold text-emerald-600">
                          {formatCurrency(record.totalPaid)}
                        </TableCell>

                        <TableCell className="text-center">
                          {record.isClosed ? (
                            <Badge className="border-emerald-200 bg-emerald-500/10 text-emerald-600">
                              <IconLock className="mr-1 size-3" />
                              ปิดรอบแล้ว
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="border-amber-300 text-amber-600"
                            >
                              <IconClock className="mr-1 size-3" />
                              กำลังดำเนินการ
                            </Badge>
                          )}
                        </TableCell>

                        <TableCell className="text-center">
                          {record.expenseId ? (
                            <Badge className="border-blue-200 bg-blue-500/10 text-xs text-blue-600">
                              <IconCheck className="mr-1 size-3" />
                              บันทึกแล้ว
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-xs">
                              -
                            </span>
                          )}
                        </TableCell>

                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs"
                            onClick={() => onSelectPeriod(record.period)}
                          >
                            เปิดดูงวดนี้
                            <IconArrowRight className="ml-1 size-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* MOBILE CARD VIEW */}
              <div className="divide-border/60 space-y-3 divide-y p-3 md:hidden">
                {historyList.map((record) => (
                  <div
                    key={record.id}
                    className="border-border/70 bg-card space-y-3 rounded-xl border p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-foreground text-base font-semibold">
                          {record.periodLabel}
                        </div>
                        <div className="text-muted-foreground text-xs">
                          {record.items.length} พนักงาน • งวด {record.period}
                        </div>
                      </div>
                      <Badge
                        className={
                          record.isClosed
                            ? 'border-emerald-200 bg-emerald-500/10 text-emerald-600'
                            : 'border-amber-200 bg-amber-500/10 text-amber-600'
                        }
                      >
                        {record.isClosed ? 'ปิดรอบแล้ว' : 'กำลังดำเนินการ'}
                      </Badge>
                    </div>

                    <div className="bg-muted/20 grid grid-cols-2 gap-2 rounded-lg p-2.5 text-xs">
                      <div>
                        <span className="text-muted-foreground">
                          ยอดสุทธิรวม:
                        </span>
                        <div className="text-foreground font-bold">
                          {formatCurrency(record.totalNetSalary)}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">จ่ายแล้ว:</span>
                        <div className="font-bold text-emerald-600">
                          {formatCurrency(record.totalPaid)}
                        </div>
                      </div>
                    </div>

                    <div className="border-border/50 flex items-center justify-between border-t pt-1 text-xs">
                      <div>
                        {record.expenseId ? (
                          <span className="flex items-center gap-1 font-medium text-blue-600">
                            <IconCheck className="size-3" />{' '}
                            เชื่อมโยงค่าใช้จ่ายแล้ว
                          </span>
                        ) : (
                          <span className="text-muted-foreground">
                            ยังไม่ส่งค่าใช้จ่าย
                          </span>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => onSelectPeriod(record.period)}
                      >
                        เปิดดูงวดนี้
                        <IconArrowRight className="ml-1 size-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
