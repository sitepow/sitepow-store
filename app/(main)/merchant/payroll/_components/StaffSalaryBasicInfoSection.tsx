'use client'

import React from 'react'

import { useTranslations } from 'next-intl'

import { StoreAvailableEmployee } from '@/types/payroll'

import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface StaffSalaryBasicInfoSectionProps {
  isEditing: boolean
  storeStaffList: StoreAvailableEmployee[]
  selectedEmpStoreId: string
  onSelectStoreStaff: (val: string) => void
  employeeName: string
  onEmployeeNameChange: (val: string) => void
  employeeCode: string
  setEmployeeCode: (val: string) => void
  department: string
  setDepartment: (val: string) => void
  position: string
  setPosition: (val: string) => void
}

export function StaffSalaryBasicInfoSection({
  isEditing,
  storeStaffList,
  selectedEmpStoreId,
  onSelectStoreStaff,
  employeeName,
  onEmployeeNameChange,
  employeeCode,
  setEmployeeCode,
  department,
  setDepartment,
  position,
  setPosition,
}: StaffSalaryBasicInfoSectionProps) {
  const tDialog = useTranslations('merchant.payroll.staff.dialog')

  return (
    <>
      {!isEditing && storeStaffList.length > 0 && (
        <Field>
          <FieldLabel className="text-foreground font-medium">
            {tDialog('selectFromStore')}
          </FieldLabel>
          <Select value={selectedEmpStoreId} onValueChange={onSelectStoreStaff}>
            <SelectTrigger>
              <SelectValue
                placeholder={tDialog('selectFromStorePlaceholder')}
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="custom">{tDialog('customStaff')}</SelectItem>
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
            onChange={(e) => onEmployeeNameChange(e.target.value)}
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
    </>
  )
}
