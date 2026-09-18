'use client'

import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useTranslations } from 'next-intl'

import {
  useStoreAvailableEmployees,
  useUpsertEmployeeSalaryConfig,
} from '@/actions/hooks/payroll'
import { SalaryType } from '@/generated/prisma/enums'
import { EmployeeSalaryConfigItem } from '@/types/payroll'

export const THAI_BANKS = [
  'ธนาคารกสิกรไทย (KBANK)',
  'ธนาคารไทยพาณิชย์ (SCB)',
  'ธนาคารกรุงเทพ (BBL)',
  'ธนาคารกรุงไทย (KTB)',
  'ธนาคารกรุงศรีอยุธยา (BAY)',
  'ธนาคารทหารไทยธนชาต (TTB)',
  'ธนาคารออมสิน (GSB)',
  'ธนาคารเพื่อการเกษตรและสหกรณ์การเกษตร (ธ.ก.ส.)',
  'เงินสด / อื่นๆ',
] as const

interface UseStaffSalaryFormProps {
  storeId: string
  editingStaff?: EmployeeSalaryConfigItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function useStaffSalaryForm({
  storeId,
  editingStaff,
  open,
  onOpenChange,
}: UseStaffSalaryFormProps) {
  const tStaff = useTranslations('merchant.payroll.staff')
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

  return {
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
    isPending: upsertMutation.isPending,
    handleSelectStoreStaff,
    handleSubmit,
  }
}
