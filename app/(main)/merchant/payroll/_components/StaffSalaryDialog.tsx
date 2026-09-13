'use client'

import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

import { useUpsertEmployeeSalaryConfig } from '@/actions/hooks/payroll'
import { SalaryType } from '@/generated/prisma/enums'
import { EmployeeSalaryConfigItem } from '@/types/payroll'
import {
  IconBuildingBank,
  IconCoins,
  IconDeviceFloppy,
  IconUserPlus,
} from '@tabler/icons-react'

import { DialogHeaderIcon } from '@/components/DialogHeaderIcon'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from '@/components/ui/dialog'
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'

interface StaffSalaryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  storeId: string
  editingStaff?: EmployeeSalaryConfigItem | null
}

const THAI_BANKS = [
  'ธนาคารกสิกรไทย (KBANK)',
  'ธนาคารไทยพาณิชย์ (SCB)',
  'ธนาคารกรุงเทพ (BBL)',
  'ธนาคารกรุงไทย (KTB)',
  'ธนาคารกรุงศรีอยุธยา (BAY)',
  'ธนาคารทหารไทยธนชาต (TTB)',
  'ธนาคารออมสิน (GSB)',
  'ธนาคารเพื่อการเกษตรและสหกรณ์การเกษตร (ธ.ก.ส.)',
  'เงินสด / อื่นๆ',
]

export function StaffSalaryDialog({
  open,
  onOpenChange,
  storeId,
  editingStaff,
}: StaffSalaryDialogProps) {
  const upsertMutation = useUpsertEmployeeSalaryConfig()

  const [employeeName, setEmployeeName] = useState('')
  const [employeeCode, setEmployeeCode] = useState('')
  const [department, setDepartment] = useState('')
  const [position, setPosition] = useState('')
  const [salaryType, setSalaryType] = useState<SalaryType>(SalaryType.MONTHLY)
  const [baseSalary, setBaseSalary] = useState<number>(15000)
  const [bankName, setBankName] = useState<string>(THAI_BANKS[0])
  const [bankAccountNumber, setBankAccountNumber] = useState('')
  const [bankAccountName, setBankAccountName] = useState('')
  const [promptpayNumber, setPromptpayNumber] = useState('')
  const [socialSecurity, setSocialSecurity] = useState(false)
  const [taxPercent, setTaxPercent] = useState<number>(0)
  const [note, setNote] = useState('')
  const [isActive, setIsActive] = useState(true)

  useEffect(() => {
    if (editingStaff) {
      setEmployeeName(editingStaff.employeeName || '')
      setEmployeeCode(editingStaff.employeeCode || '')
      setDepartment(editingStaff.department || '')
      setPosition(editingStaff.position || '')
      setSalaryType(editingStaff.salaryType || SalaryType.MONTHLY)
      setBaseSalary(editingStaff.baseSalary || 0)
      setBankName(editingStaff.bankName || THAI_BANKS[0])
      setBankAccountNumber(editingStaff.bankAccountNumber || '')
      setBankAccountName(editingStaff.bankAccountName || '')
      setPromptpayNumber(editingStaff.promptpayNumber || '')
      setSocialSecurity(editingStaff.socialSecurity ?? false)
      setTaxPercent(editingStaff.taxPercent || 0)
      setNote(editingStaff.note || '')
      setIsActive(editingStaff.isActive ?? true)
    } else {
      setEmployeeName('')
      setEmployeeCode('')
      setDepartment('')
      setPosition('')
      setSalaryType(SalaryType.MONTHLY)
      setBaseSalary(15000)
      setBankName(THAI_BANKS[0])
      setBankAccountNumber('')
      setBankAccountName('')
      setPromptpayNumber('')
      setSocialSecurity(false)
      setTaxPercent(0)
      setNote('')
      setIsActive(true)
    }
  }, [editingStaff, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!employeeName.trim()) {
      toast.error('กรุณาระบุชื่อ-นามสกุลพนักงาน')
      return
    }

    try {
      const res = await upsertMutation.mutateAsync({
        id: editingStaff?.id,
        storeId,
        employeeName: employeeName.trim(),
        employeeCode: employeeCode.trim() || undefined,
        department: department.trim() || undefined,
        position: position.trim() || undefined,
        salaryType,
        baseSalary: Number(baseSalary) || 0,
        bankName,
        bankAccountNumber: bankAccountNumber.trim() || undefined,
        bankAccountName: bankAccountName.trim() || employeeName.trim(),
        promptpayNumber: promptpayNumber.trim() || undefined,
        socialSecurity,
        taxPercent: Number(taxPercent) || 0,
        note: note.trim() || undefined,
        isActive,
      })

      if (res.success) {
        toast.success(
          editingStaff
            ? 'แก้ไขข้อมูลพนักงานเรียบร้อยแล้ว'
            : 'เพิ่มพนักงานและกำหนดฐานเงินเดือนเรียบร้อยแล้ว',
        )
        onOpenChange(false)
      } else {
        toast.error(res.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล')
      }
    } catch {
      toast.error('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogHeaderIcon
            icon={editingStaff ? IconCoins : IconUserPlus}
            title={editingStaff ? 'แก้ไขข้อมูลพนักงาน' : 'เพิ่มพนักงานและฐานเงินเดือน'}
            description="กำหนดฐานเงินเดือน ตำแหน่ง และบัญชีรับโอนเงินของพนักงาน"
          />
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field className="sm:col-span-2">
              <FieldLabel>ชื่อ-นามสกุลพนักงาน *</FieldLabel>
              <Input
                placeholder="เช่น สมศักดิ์ ขยันยิ่ง"
                value={employeeName}
                onChange={(e) => setEmployeeName(e.target.value)}
                required
              />
            </Field>

            <Field>
              <FieldLabel>รหัสพนักงาน</FieldLabel>
              <Input
                placeholder="เช่น EMP-001"
                value={employeeCode}
                onChange={(e) => setEmployeeCode(e.target.value)}
              />
            </Field>

            <Field>
              <FieldLabel>แผนก / ฝ่าย</FieldLabel>
              <Input
                placeholder="เช่น หน้าร้าน, คลังสินค้า"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              />
            </Field>

            <Field className="sm:col-span-2">
              <FieldLabel>ตำแหน่งงาน</FieldLabel>
              <Input
                placeholder="เช่น พนักงานขาย, ผู้จัดการสาขา"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
              />
            </Field>
          </div>

          <div className="rounded-xl border border-border/70 bg-muted/20 p-4 space-y-4">
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
              <IconCoins className="size-4 text-primary" />
              การจ้างงานและค่าตอบแทน
            </h4>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel>ประเภทการจ้าง</FieldLabel>
                <Select
                  value={salaryType}
                  onValueChange={(val) => setSalaryType(val as SalaryType)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกประเภท" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={SalaryType.MONTHLY}>
                      เงินเดือนประจำ (Monthly)
                    </SelectItem>
                    <SelectItem value={SalaryType.DAILY}>
                      รายวัน (Daily)
                    </SelectItem>
                    <SelectItem value={SalaryType.HOURLY}>
                      รายชั่วโมง (Hourly)
                    </SelectItem>
                    <SelectItem value={SalaryType.COMMISSION}>
                      คอมมิชชั่นล้วน (Commission)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <FieldLabel>ฐานเงินเดือน/ค่าจ้าง (บาท) *</FieldLabel>
                <Input
                  type="number"
                  min="0"
                  step="100"
                  value={baseSalary}
                  onChange={(e) => setBaseSalary(Number(e.target.value))}
                  required
                />
              </Field>

              <Field>
                <FieldLabel>หักภาษี ณ ที่จ่าย (%)</FieldLabel>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  placeholder="0 หรือ 3"
                  value={taxPercent}
                  onChange={(e) => setTaxPercent(Number(e.target.value))}
                />
              </Field>

              <div className="flex items-center justify-between rounded-lg border bg-background p-3">
                <div className="space-y-0.5">
                  <div className="text-xs font-medium">หักประกันสังคม</div>
                  <div className="text-[11px] text-muted-foreground">คำนวณหัก 5% (สูงสุด 750 บ.)</div>
                </div>
                <Switch
                  checked={socialSecurity}
                  onCheckedChange={setSocialSecurity}
                />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border/70 bg-muted/20 p-4 space-y-4">
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
              <IconBuildingBank className="size-4 text-primary" />
              บัญชีธนาคารและพร้อมเพย์
            </h4>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field className="sm:col-span-2">
                <FieldLabel>ธนาคาร</FieldLabel>
                <Select value={bankName} onValueChange={setBankName}>
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกธนาคาร" />
                  </SelectTrigger>
                  <SelectContent>
                    {THAI_BANKS.map((b) => (
                      <SelectItem key={b} value={b}>
                        {b}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <FieldLabel>เลขที่บัญชี</FieldLabel>
                <Input
                  placeholder="เช่น 045-2-88991-0"
                  value={bankAccountNumber}
                  onChange={(e) => setBankAccountNumber(e.target.value)}
                />
              </Field>

              <Field>
                <FieldLabel>ชื่อบัญชี</FieldLabel>
                <Input
                  placeholder="เช่น สมศักดิ์ ขยันยิ่ง"
                  value={bankAccountName}
                  onChange={(e) => setBankAccountName(e.target.value)}
                />
              </Field>

              <Field className="sm:col-span-2">
                <FieldLabel>พร้อมเพย์ (PromptPay)</FieldLabel>
                <Input
                  placeholder="เบอร์โทรศัพท์ 10 หลัก หรือ เลขประจำตัวประชาชน"
                  value={promptpayNumber}
                  onChange={(e) => setPromptpayNumber(e.target.value)}
                />
              </Field>
            </div>
          </div>

          <Field>
            <FieldLabel>หมายเหตุเพิ่มเติม</FieldLabel>
            <Textarea
              rows={2}
              placeholder="เช่น พนักงานทดลองงาน วันที่เริ่มงาน หรือสิทธิประโยชน์อื่นๆ"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </Field>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <div className="text-sm font-medium">เปิดใช้งานพนักงานนี้</div>
              <div className="text-xs text-muted-foreground">
                พนักงานที่เปิดใช้งานจะถูกรวมในรอบตัดเงินเดือนอัตโนมัติ
              </div>
            </div>
            <Switch checked={isActive} onCheckedChange={setIsActive} />
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              ยกเลิก
            </Button>
            <Button type="submit" disabled={upsertMutation.isPending}>
              <IconDeviceFloppy className="size-4 mr-1" />
              {upsertMutation.isPending ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

