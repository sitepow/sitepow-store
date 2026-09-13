import { PayoutStatus, SalaryType } from '@/generated/prisma/enums'

export { PayoutStatus, SalaryType }

export interface EmployeeSalaryConfigItem {
  id: string
  storeId: string
  employeeId?: string | null
  employeeName: string
  employeeCode?: string | null
  department?: string | null
  position?: string | null
  salaryType: SalaryType
  baseSalary: number
  bankName?: string | null
  bankAccountNumber?: string | null
  bankAccountName?: string | null
  promptpayNumber?: string | null
  socialSecurity: boolean
  taxPercent?: number | null
  isActive: boolean
  note?: string | null
  createdAt?: string
  updatedAt?: string
}

export interface MonthlyPayrollItemRecord {
  id: string
  monthlyPayrollId?: string
  employeeConfigId?: string | null
  employeeName: string
  employeeCode?: string | null
  department?: string | null
  position?: string | null
  salaryType: SalaryType
  baseSalary: number
  overtimeAmount: number
  bonusAmount: number
  commissionAmount: number
  deductionAmount: number
  netSalary: number
  status: PayoutStatus
  paidAt?: string | null
  slipImage?: string | null
  paymentNote?: string | null
  bankName?: string | null
  bankAccount?: string | null
  bankAccountName?: string | null
  promptPay?: string | null
  createdAt?: string
  updatedAt?: string
}

export interface MonthlyPayrollRecord {
  id: string
  storeId: string
  period: string
  periodLabel: string
  startDate: string
  endDate: string
  totalBaseSalary: number
  totalOvertime: number
  totalBonus: number
  totalCommission: number
  totalDeductions: number
  totalNetSalary: number
  totalPaid: number
  isClosed: boolean
  closedAt?: string | null
  expenseId?: string | null
  note?: string | null
  isDraft?: boolean
  items: MonthlyPayrollItemRecord[]
  expense?: {
    id: string
    amount: number
    title: string
    category: string
    expenseDate: string
  } | null
  createdAt?: string
  updatedAt?: string
}

