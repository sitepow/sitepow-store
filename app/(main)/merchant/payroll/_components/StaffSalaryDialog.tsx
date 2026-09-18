'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import { IconCoins, IconDeviceFloppy, IconUserPlus } from '@tabler/icons-react'

import { EmployeeSalaryConfigItem } from '@/types/payroll'
import { DialogHeaderIcon } from '@/components/DialogHeaderIcon'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from '@/components/ui/dialog'
import { Field, FieldLabel } from '@/components/ui/field'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'

import { useStaffSalaryForm } from '../_hooks/use-staff-salary-form'
import { StaffSalaryBankSection } from './StaffSalaryBankSection'
import { StaffSalaryBasicInfoSection } from './StaffSalaryBasicInfoSection'
import { StaffSalaryCompensationSection } from './StaffSalaryCompensationSection'

interface StaffSalaryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  storeId: string
  editingStaff?: EmployeeSalaryConfigItem | null
}

export function StaffSalaryDialog({
  open,
  onOpenChange,
  storeId,
  editingStaff,
}: StaffSalaryDialogProps) {
  const tStaff = useTranslations('merchant.payroll.staff')
  const tDialog = useTranslations('merchant.payroll.staff.dialog')

  const {
    storeStaffList,
    selectedEmpStoreId,
    setSelectedEmpStoreId,
    employeeName,
    setEmployeeName,
    employeeCode,
    setEmployeeCode,
    department,
    setDepartment,
    position,
    setPosition,
    salaryType,
    setSalaryType,
    baseSalary,
    setBaseSalary,
    bankName,
    setBankName,
    bankAccountNumber,
    setBankAccountNumber,
    bankAccountName,
    setBankAccountName,
    promptpayNumber,
    setPromptpayNumber,
    socialSecurity,
    setSocialSecurity,
    taxPercent,
    setTaxPercent,
    note,
    setNote,
    isActive,
    setIsActive,
    isPending,
    handleSelectStoreStaff,
    handleSubmit,
  } = useStaffSalaryForm({
    storeId,
    editingStaff,
    open,
    onOpenChange,
  })

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
          <StaffSalaryBasicInfoSection
            isEditing={!!editingStaff}
            storeStaffList={storeStaffList}
            selectedEmpStoreId={selectedEmpStoreId}
            onSelectStoreStaff={handleSelectStoreStaff}
            employeeName={employeeName}
            onEmployeeNameChange={(val) => {
              setEmployeeName(val)
              setSelectedEmpStoreId('custom')
            }}
            employeeCode={employeeCode}
            setEmployeeCode={setEmployeeCode}
            department={department}
            setDepartment={setDepartment}
            position={position}
            setPosition={setPosition}
          />

          <StaffSalaryCompensationSection
            salaryType={salaryType}
            setSalaryType={setSalaryType}
            baseSalary={baseSalary}
            setBaseSalary={setBaseSalary}
            taxPercent={taxPercent}
            setTaxPercent={setTaxPercent}
            socialSecurity={socialSecurity}
            setSocialSecurity={setSocialSecurity}
          />

          <StaffSalaryBankSection
            bankName={bankName}
            setBankName={setBankName}
            bankAccountNumber={bankAccountNumber}
            setBankAccountNumber={setBankAccountNumber}
            bankAccountName={bankAccountName}
            setBankAccountName={setBankAccountName}
            promptpayNumber={promptpayNumber}
            setPromptpayNumber={setPromptpayNumber}
          />

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
            <Button type="submit" disabled={isPending}>
              <IconDeviceFloppy className="mr-1 size-4" />
              {isPending ? tDialog('saving') : tDialog('save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
