'use client'

import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

import { useTranslations } from 'next-intl'

import {
  useStoreAvailableEmployees,
  useUpsertEmployeeSalaryConfig,
} from '@/actions/hooks/payroll'
import { SalaryType } from '@/generated/prisma/enums'
import { EmployeeSalaryConfigItem } from '@/types/payroll'
import {
  IconBuildingBank,
  IconCoins,
  IconDeviceFloppy,
  IconUser,
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
  const tStaff = useTranslations('merchant.payroll.staff')
  const tDialog = useTranslations('merchant.payroll.staff.dialog')
  const tTypes = useTranslations('merchant.payroll.salaryTypes')
  const upsertMutation = useUpsertEmployeeSalaryConfig()
  const { data: storeStaffRes } = useStoreAvailableEmployees(storeId)
  const storeStaffList = storeStaffRes?.data || []

  const [selectedEmpStoreId, setSelectedEmpStoreId] = useState<string>('custom')
  const [employeeId, setEmployeeId] = useState<string | null>(null)
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
      setSelectedEmpStoreId(editingStaff.employeeId || 'custom')
      setEmployeeId(editingStaff.employeeId || null)
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
      setSelectedEmpStoreId('custom')
      setEmployeeId(null)
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

  const handleSelectStoreStaff = (val: string) => {
    setSelectedEmpStoreId(val)
    if (val === 'custom') {
      setEmployeeId(null)
      return
    }

    const emp = storeStaffList.find((e) => e.employeeId === val)
    if (!emp) return

    setEmployeeId(emp.employeeId)
    setEmployeeName(emp.name)
    setDepartment(emp.department || '')
    setPosition(emp.position || '')
    setBankAccountName(emp.name)
    if (emp.phone) {
      setPromptpayNumber(emp.phone)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!employeeName.trim()) {
      toast.error(tStaff('name'))
      return
    }

    try {
      const res = await upsertMutation.mutateAsync({
        id: editingStaff?.id,
        storeId,
        employeeId: employeeId || undefined,
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
        toast.success(tStaff('saveSuccess'))
        onOpenChange(false)
      } else {
        toast.error(res.message || tStaff('saveFailed'))
      }
    } catch {
      toast.error(tStaff('saveFailed'))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogHeaderIcon
            icon={editingStaff ? IconCoins : IconUserPlus}
            title={editingStaff ? tDialog('editTitle') : tDialog('addTitle')}
            description={tDialog('desc')}
          />
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!editingStaff && storeStaffList.length > 0 && (
            <Field>
              <FieldLabel className="text-foreground font-medium">
                {tDialog('selectFromStore')}
              </FieldLabel>
              <Select
                value={selectedEmpStoreId}
                onValueChange={handleSelectStoreStaff}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={tDialog('selectFromStorePlaceholder')}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="custom">
                    {tDialog('customStaff')}
                  </SelectItem>
                  {storeStaffList.map((emp) => (
                    <SelectItem key={emp.employeeId} value={emp.employeeId}>
                      {emp.name}
                      {emp.position ? ` (${emp.position})` : ''}
                      {emp.department ? ` • ${emp.department}` : ''}
                      {emp.alreadyConfigured
                        ? ` ${tDialog('alreadyConfigured')}`
                        : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field className="sm:col-span-2">
              <FieldLabel>{tDialog('fullName')} *</FieldLabel>
              <Input
                placeholder={tDialog('fullNamePlaceholder')}
                value={employeeName}
                onChange={(e) => {
                  setEmployeeName(e.target.value)
                  setSelectedEmpStoreId('custom')
                }}
                required
              />
            </Field>

            <Field>
              <FieldLabel>{tDialog('empCode')}</FieldLabel>
              <Input
                placeholder={tDialog('empCodePlaceholder')}
                value={employeeCode}
                onChange={(e) => setEmployeeCode(e.target.value)}
              />
            </Field>

            <Field>
              <FieldLabel>{tDialog('department')}</FieldLabel>
              <Input
                placeholder={tDialog('departmentPlaceholder')}
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              />
            </Field>

            <Field className="sm:col-span-2">
              <FieldLabel>{tDialog('position')}</FieldLabel>
              <Input
                placeholder={tDialog('positionPlaceholder')}
                value={position}
                onChange={(e) => setPosition(e.target.value)}
              />
            </Field>
          </div>

          <div className="border-border/70 bg-muted/20 space-y-4 rounded-xl border p-4">
            <h4 className="text-foreground flex items-center gap-1.5 text-sm font-semibold">
              <IconCoins className="text-primary size-4" />
              {tStaff('salaryType')}
            </h4>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel>{tDialog('salaryType')}</FieldLabel>
                <Select
                  value={salaryType}
                  onValueChange={(val) => setSalaryType(val as SalaryType)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={tDialog('salaryType')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={SalaryType.MONTHLY}>
                      {tTypes('MONTHLY')}
                    </SelectItem>
                    <SelectItem value={SalaryType.DAILY}>
                      {tTypes('DAILY')}
                    </SelectItem>
                    <SelectItem value={SalaryType.HOURLY}>
                      {tTypes('HOURLY')}
                    </SelectItem>
                    <SelectItem value={SalaryType.COMMISSION}>
                      {tTypes('COMMISSION')}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <FieldLabel>{tDialog('baseSalary')} *</FieldLabel>
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
                <FieldLabel>{tDialog('taxPercent')}</FieldLabel>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  placeholder={tDialog('taxPercentPlaceholder')}
                  value={taxPercent}
                  onChange={(e) => setTaxPercent(Number(e.target.value))}
                />
              </Field>

              <div className="bg-background flex items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <div className="text-xs font-medium">
                    {tStaff('socialSecurity')}
                  </div>
                  <div className="text-muted-foreground text-[11px]">
                    {tDialog('socialSecurityDesc')}
                  </div>
                </div>
                <Switch
                  checked={socialSecurity}
                  onCheckedChange={setSocialSecurity}
                />
              </div>
            </div>
          </div>

          <div className="border-border/70 bg-muted/20 space-y-4 rounded-xl border p-4">
            <h4 className="text-foreground flex items-center gap-1.5 text-sm font-semibold">
              <IconBuildingBank className="text-primary size-4" />
              {tStaff('bankInfo')}
            </h4>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field className="sm:col-span-2">
                <FieldLabel>{tDialog('bankName')}</FieldLabel>
                <Select value={bankName} onValueChange={setBankName}>
                  <SelectTrigger>
                    <SelectValue placeholder={tDialog('bankName')} />
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
                <FieldLabel>{tDialog('bankAccountNumber')}</FieldLabel>
                <Input
                  placeholder={tDialog('bankAccountPlaceholder')}
                  value={bankAccountNumber}
                  onChange={(e) => setBankAccountNumber(e.target.value)}
                />
              </Field>

              <Field>
                <FieldLabel>{tDialog('bankAccountName')}</FieldLabel>
                <Input
                  placeholder={tDialog('bankAccountNamePlaceholder')}
                  value={bankAccountName}
                  onChange={(e) => setBankAccountName(e.target.value)}
                />
              </Field>

              <Field className="sm:col-span-2">
                <FieldLabel>{tDialog('promptpayNumber')}</FieldLabel>
                <Input
                  placeholder={tDialog('promptpayPlaceholder')}
                  value={promptpayNumber}
                  onChange={(e) => setPromptpayNumber(e.target.value)}
                />
              </Field>
            </div>
          </div>

          <Field>
            <FieldLabel>{tDialog('note')}</FieldLabel>
            <Textarea
              rows={2}
              placeholder={tDialog('notePlaceholder')}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </Field>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <div className="text-sm font-medium">
                {tDialog('employmentStatus')}
              </div>
              <div className="text-muted-foreground text-xs">
                {tStaff('status')}
              </div>
            </div>
            <Switch checked={isActive} onCheckedChange={setIsActive} />
          </div>

          <DialogFooter className="gap-2 pt-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {tDialog('cancel')}
            </Button>
            <Button type="submit" disabled={upsertMutation.isPending}>
              <IconDeviceFloppy className="mr-1 size-4" />
              {upsertMutation.isPending ? tDialog('saving') : tDialog('save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
