'use client'

import React from 'react'

import { useMerchantCurrency } from '@/hooks/use-merchant-currency'
import { MonthlyPayrollItemRecord, MonthlyPayrollRecord } from '@/types/payroll'
import { IconPrinter, IconReceipt } from '@tabler/icons-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface PayrollPrintPayslipProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  payroll: MonthlyPayrollRecord
  item: MonthlyPayrollItemRecord | null
  storeName?: string
}

export function PayrollPrintPayslip({
  open,
  onOpenChange,
  payroll,
  item,
  storeName = 'ร้านค้า',
}: PayrollPrintPayslipProps) {
  const { formatCurrency } = useMerchantCurrency()

  if (!item) return null

  const handlePrint = () => {
    window.print()
  }

  const additions = item.overtimeAmount + item.bonusAmount + item.commissionAmount

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl print:m-0 print:max-w-none print:p-0 print:border-none">
        <DialogHeader className="print:hidden">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <IconReceipt className="size-5 text-primary" />
              ใบเสร็จเงินเดือน (Payslip)
            </DialogTitle>
            <Button size="sm" onClick={handlePrint}>
              <IconPrinter className="size-4 mr-1" />
              พิมพ์สลิป
            </Button>
          </div>
        </DialogHeader>

        {/* PRINTABLE SLIP CONTENT */}
        <div id="printable-payslip" className="p-6 border rounded-xl bg-card text-foreground space-y-5 print:border-none print:p-8">
          {/* Header */}
          <div className="text-center border-b pb-4 space-y-1">
            <h2 className="text-xl font-bold tracking-tight">{storeName}</h2>
            <p className="text-sm font-medium text-muted-foreground">
              ใบจ่ายเงินเดือนและค่าตอบแทนพนักงาน (Payslip)
            </p>
            <p className="text-xs text-primary font-semibold">
              ประจำงวด: {payroll.periodLabel}
            </p>
          </div>

          {/* Employee Info Box */}
          <div className="grid grid-cols-2 gap-3 text-xs bg-muted/30 p-3.5 rounded-lg border border-border/50">
            <div>
              <span className="text-muted-foreground">ชื่อพนักงาน: </span>
              <span className="font-semibold text-foreground">{item.employeeName}</span>
            </div>
            <div>
              <span className="text-muted-foreground">รหัสพนักงาน: </span>
              <span className="font-semibold text-foreground">{item.employeeCode || '-'}</span>
            </div>
            <div>
              <span className="text-muted-foreground">ตำแหน่ง: </span>
              <span className="font-medium text-foreground">{item.position || '-'}</span>
            </div>
            <div>
              <span className="text-muted-foreground">แผนก/ฝ่าย: </span>
              <span className="font-medium text-foreground">{item.department || '-'}</span>
            </div>
          </div>

          {/* Breakdown Table */}
          <div className="space-y-3">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              รายการเงินได้และรายการหัก (Earnings & Deductions)
            </div>

            <div className="rounded-lg border divide-y text-xs">
              <div className="flex justify-between py-2 px-3 bg-muted/10">
                <span className="text-foreground">1. ฐานเงินเดือน/ค่าจ้างประจำ</span>
                <span className="font-medium">{formatCurrency(item.baseSalary)}</span>
              </div>
              {item.overtimeAmount > 0 && (
                <div className="flex justify-between py-2 px-3 text-emerald-600">
                  <span>2. ค่าล่วงเวลา (OT)</span>
                  <span className="font-medium">+{formatCurrency(item.overtimeAmount)}</span>
                </div>
              )}
              {item.bonusAmount > 0 && (
                <div className="flex justify-between py-2 px-3 text-emerald-600">
                  <span>3. โบนัส / เบี้ยขยัน</span>
                  <span className="font-medium">+{formatCurrency(item.bonusAmount)}</span>
                </div>
              )}
              {item.commissionAmount > 0 && (
                <div className="flex justify-between py-2 px-3 text-emerald-600">
                  <span>4. คอมมิชชั่น / ค่าผลงาน</span>
                  <span className="font-medium">+{formatCurrency(item.commissionAmount)}</span>
                </div>
              )}
              {item.deductionAmount > 0 && (
                <div className="flex justify-between py-2 px-3 text-rose-600">
                  <span>5. หักขาด ลา มาสาย / ประกันสังคม / ภาษี</span>
                  <span className="font-medium">-{formatCurrency(item.deductionAmount)}</span>
                </div>
              )}
            </div>

            {/* Total Net Box */}
            <div className="rounded-lg bg-primary/10 border border-primary/20 p-3.5 flex justify-between items-center">
              <div>
                <div className="font-bold text-sm text-foreground">ยอดเงินเดือนสุทธิ (Net Pay)</div>
                <div className="text-[11px] text-muted-foreground">
                  (เงินเพิ่มรวม {formatCurrency(additions)} | หักรวม {formatCurrency(item.deductionAmount)})
                </div>
              </div>
              <div className="text-xl font-bold text-primary">
                {formatCurrency(item.netSalary)}
              </div>
            </div>
          </div>

          {/* Payment & Bank Info */}
          <div className="rounded-lg border bg-muted/20 p-3 text-xs space-y-1 text-muted-foreground">
            <div className="font-semibold text-foreground">ช่องทางการรับเงิน:</div>
            {item.bankName && <div>ธนาคาร: {item.bankName}</div>}
            {item.bankAccount && <div>เลขบัญชี: {item.bankAccount} ({item.bankAccountName || item.employeeName})</div>}
            {item.promptPay && <div>พร้อมเพย์: {item.promptPay}</div>}
            <div className="pt-1 text-[11px]">
              สถานะ: {item.status === 'PAID' ? 'โอนเงินเรียบร้อยแล้ว' : 'รอดำเนินการโอนเงิน'}
              {item.paidAt && ` (เมื่อ ${new Date(item.paidAt).toLocaleDateString('th-TH')})`}
            </div>
          </div>

          {/* Signatures */}
          <div className="pt-8 grid grid-cols-2 gap-8 text-center text-xs">
            <div className="space-y-8">
              <div className="border-b border-dashed border-muted-foreground/50 w-3/4 mx-auto" />
              <p className="text-muted-foreground">ลายมือชื่อผู้จ่ายเงิน / ผู้มีอำนาจ</p>
            </div>
            <div className="space-y-8">
              <div className="border-b border-dashed border-muted-foreground/50 w-3/4 mx-auto" />
              <p className="text-muted-foreground">ลายมือชื่อพนักงานผู้รับเงิน</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

