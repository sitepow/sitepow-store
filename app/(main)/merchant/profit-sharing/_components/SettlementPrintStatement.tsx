'use client'

import React from 'react'

import { useMerchantCurrency } from '@/hooks/use-merchant-currency'
import { MonthlySettlementRecord } from '@/types/profit-sharing'
import { IconPrinter, IconX } from '@tabler/icons-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface SettlementPrintStatementProps {
  open: boolean
  setOpen: (open: boolean) => void
  settlement: MonthlySettlementRecord | null
  storeName?: string
}

export function SettlementPrintStatement({
  open,
  setOpen,
  settlement,
  storeName = 'ร้านค้า',
}: SettlementPrintStatementProps) {
  const { format } = useMerchantCurrency()

  if (!settlement) return null

  const handlePrint = () => {
    window.print()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-3xl print:border-none print:p-0 print:shadow-none">
        <DialogHeader className="print:hidden">
          <div className="flex items-center justify-between">
            <DialogTitle>
              ใบสำคัญสรุปการแบ่งกำไรและค่าใช้จ่ายระบบ (Statement)
            </DialogTitle>
            <Button size="sm" onClick={handlePrint}>
              <IconPrinter className="mr-1.5 size-4" />
              พิมพ์เอกสาร (Print / PDF)
            </Button>
          </div>
        </DialogHeader>

        {/* Printable Paper Canvas */}
        <div
          id="print-statement-content"
          className="space-y-6 rounded border bg-white p-6 text-black print:border-none print:p-0"
        >
          {/* Header */}
          <div className="border-b pb-4">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-xl font-bold tracking-tight text-gray-900">
                  ใบสรุปรายการส่วนแบ่งกำไรและผลตอบแทนหุ้นส่วน
                </h1>
                <p className="mt-0.5 text-sm font-medium text-gray-600">
                  MONTHLY PROFIT SHARING & SETTLEMENT STATEMENT
                </p>
                <div className="mt-2 space-y-0.5 text-xs text-gray-500">
                  <div>
                    <span className="font-semibold">ร้านค้า:</span> {storeName}
                  </div>
                  <div>
                    <span className="font-semibold">ประจำงวด:</span>{' '}
                    {settlement.periodLabel} (
                    {new Date(settlement.startDate).toLocaleDateString('th-TH')}{' '}
                    ถึง{' '}
                    {new Date(settlement.endDate).toLocaleDateString('th-TH')})
                  </div>
                </div>
              </div>
              <div className="space-y-0.5 text-right text-xs text-gray-500">
                <div>
                  <span className="font-semibold">เลขที่เอกสาร:</span> PS-
                  {settlement.period.replace('-', '')}
                </div>
                <div>
                  <span className="font-semibold">วันที่พิมพ์:</span>{' '}
                  {new Date().toLocaleDateString('th-TH')}
                </div>
                <div>
                  <span className="mt-1 inline-block rounded border bg-gray-100 px-2 py-0.5 text-[11px] font-bold text-gray-800">
                    {settlement.isClosed
                      ? 'ปิดรอบแล้ว (CLOSED)'
                      : 'ฉบับร่าง (DRAFT)'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Financial Breakdown Table */}
          <div className="space-y-2">
            <h2 className="text-xs font-bold tracking-wider text-gray-700 uppercase">
              1. สรุปผลประกอบการประจำรอบ (Operating Results)
            </h2>
            <table className="w-full border-collapse border border-gray-300 text-xs">
              <tbody>
                <tr className="border-b border-gray-300 bg-gray-50">
                  <td className="p-2 font-medium">
                    ยอดขายรวมสุทธิ (Gross Revenue)
                  </td>
                  <td className="p-2 text-right font-bold text-gray-900">
                    {format(Number(settlement.totalRevenue))}
                  </td>
                </tr>
                <tr className="border-b border-gray-300">
                  <td className="p-2 text-gray-600">
                    หัก: ต้นทุนสินค้าขาย (Cost of Goods Sold - COGS)
                  </td>
                  <td className="p-2 text-right text-gray-700">
                    - {format(Number(settlement.totalCogs))}
                  </td>
                </tr>
                <tr className="border-b border-gray-300">
                  <td className="p-2 text-gray-600">
                    หัก: ค่าใช้จ่ายดำเนินงานร้านค้า (Operating Expenses)
                  </td>
                  <td className="p-2 text-right text-gray-700">
                    - {format(Number(settlement.totalExpense))}
                  </td>
                </tr>
                <tr className="border-b border-gray-300 bg-blue-50 font-bold">
                  <td className="p-2 text-blue-900">
                    กำไรสุทธิสำหรับจัดสรร (Net Profit for Distribution)
                  </td>
                  <td className="p-2 text-right text-blue-900">
                    {format(Number(settlement.netProfit))}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Partner Payout Table */}
          <div className="space-y-2">
            <h2 className="text-xs font-bold tracking-wider text-gray-700 uppercase">
              2. รายการจัดสรรส่วนแบ่งและค่าตอบแทน (Distribution Schedule)
            </h2>
            <table className="w-full border-collapse border border-gray-300 text-xs">
              <thead>
                <tr className="border-b border-gray-300 bg-gray-100">
                  <th className="p-2 text-left">ลำดับ</th>
                  <th className="p-2 text-left">ผู้รับส่วนแบ่ง / บทบาท</th>
                  <th className="p-2 text-center">ประเภทส่วนแบ่ง</th>
                  <th className="p-2 text-center">สัดส่วน</th>
                  <th className="p-2 text-right">ยอดเงินจัดสรร</th>
                  <th className="p-2 text-center">สถานะ</th>
                </tr>
              </thead>
              <tbody>
                {settlement.payouts.map((p, idx) => (
                  <tr key={p.partnerId} className="border-b border-gray-200">
                    <td className="p-2 text-center">{idx + 1}</td>
                    <td className="p-2">
                      <div className="font-semibold text-gray-900">
                        {p.partnerName}
                      </div>
                      <div className="text-[11px] text-gray-500">
                        {p.bankName
                          ? `${p.bankName} ${p.bankAccount || ''}`
                          : p.promptPay
                            ? `PromptPay: ${p.promptPay}`
                            : ''}
                      </div>
                    </td>
                    <td className="p-2 text-center text-gray-600">
                      {p.shareType === 'NET_PROFIT_PERCENT'
                        ? '% กำไรสุทธิ'
                        : p.shareType === 'REVENUE_PERCENT'
                          ? '% ยอดขาย'
                          : 'ยอดคงที่'}
                    </td>
                    <td className="p-2 text-center font-medium">
                      {p.shareType === 'FIXED_MONTHLY'
                        ? `฿${Number(p.shareValue).toLocaleString()}`
                        : `${Number(p.shareValue)}%`}
                    </td>
                    <td className="p-2 text-right font-bold text-gray-900">
                      {format(Number(p.calculatedAmount))}
                    </td>
                    <td className="p-2 text-center">
                      <span
                        className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-bold ${
                          p.status === 'PAID'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {p.status === 'PAID' ? 'โอนแล้ว' : 'รอโอน'}
                      </span>
                    </td>
                  </tr>
                ))}
                {/* Total row */}
                <tr className="border-t-2 border-gray-400 bg-gray-50 font-bold">
                  <td colSpan={4} className="p-2 text-right text-gray-800">
                    รวมยอดส่วนแบ่งที่จัดสรรทั้งหมด:
                  </td>
                  <td className="p-2 text-right text-emerald-700">
                    {format(Number(settlement.totalAllocated))}
                  </td>
                  <td></td>
                </tr>
                <tr className="bg-gray-100 font-bold">
                  <td colSpan={4} className="p-2 text-right text-gray-700">
                    เงินสำรองสะสมคงเหลือในร้านค้า (Retained Earnings):
                  </td>
                  <td className="p-2 text-right text-blue-800">
                    {format(Number(settlement.retainedEarnings))}
                  </td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Signatures */}
          <div className="border-t border-gray-200 pt-8">
            <div className="grid grid-cols-3 gap-6 text-center text-xs text-gray-600">
              <div className="space-y-12">
                <div className="h-10"></div>
                <div className="border-t border-gray-400 pt-1.5">
                  <p className="font-semibold">ผู้จัดทำรายงาน / ฝ่ายบัญชี</p>
                  <p className="text-[10px] text-gray-400">
                    วันที่: ____ / ____ / ________
                  </p>
                </div>
              </div>
              <div className="space-y-12">
                <div className="h-10"></div>
                <div className="border-t border-gray-400 pt-1.5">
                  <p className="font-semibold">ผู้มีอำนาจอนุมัติ / กรรมการ</p>
                  <p className="text-[10px] text-gray-400">
                    วันที่: ____ / ____ / ________
                  </p>
                </div>
              </div>
              <div className="space-y-12">
                <div className="h-10"></div>
                <div className="border-t border-gray-400 pt-1.5">
                  <p className="font-semibold">ตัวแทนหุ้นส่วนผู้รับมอบ</p>
                  <p className="text-[10px] text-gray-400">
                    วันที่: ____ / ____ / ________
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="print:hidden">
          <Button variant="outline" onClick={() => setOpen(false)}>
            ปิด
          </Button>
          <Button onClick={handlePrint}>
            <IconPrinter className="mr-1.5 size-4" />
            พิมพ์เอกสาร
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
