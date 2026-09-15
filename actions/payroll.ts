'use server'

import { Prisma } from '@/generated/prisma/client'
import {
  ExpenseCategory,
  PayoutStatus,
  SalaryType,
} from '@/generated/prisma/enums'
import {
  EmployeeSalaryConfigItem,
  MonthlyPayrollItemRecord,
  MonthlyPayrollRecord,
} from '@/types/payroll'
import { PermissionKey } from '@/types/permission'
import { serializeDecimal } from '@/utils/decimal'

import { getCurrentUser } from '@/lib/auth-server'
import { verifyEmployeePermission } from '@/lib/permission'
import { prisma } from '@/lib/prisma'

const DEFAULT_EMPLOYEES = [
  {
    employeeName: 'สมศักดิ์ ขยันยิ่ง',
    employeeCode: 'EMP-001',
    department: 'ฝ่ายขาย & หน้าร้าน',
    position: 'หัวหน้างานขาย (Sales Supervisor)',
    salaryType: SalaryType.MONTHLY,
    baseSalary: new Prisma.Decimal(25000),
    bankName: 'ธนาคารกสิกรไทย (KBANK)',
    bankAccountNumber: '045-2-88991-0',
    bankAccountName: 'สมศักดิ์ ขยันยิ่ง',
    promptpayNumber: '0811122334',
    socialSecurity: true,
    taxPercent: new Prisma.Decimal(3),
    note: 'พนักงานประจำ ดูแลยอดขายหน้าร้านและบริการลูกค้า',
    isActive: true,
  },
  {
    employeeName: 'วิภาดา มุ่งมั่น',
    employeeCode: 'EMP-002',
    department: 'การตลาดออนไลน์',
    position: 'เจ้าหน้าที่การตลาด (Marketing Officer)',
    salaryType: SalaryType.MONTHLY,
    baseSalary: new Prisma.Decimal(22000),
    bankName: 'ธนาคารไทยพาณิชย์ (SCB)',
    bankAccountNumber: '168-4-55672-9',
    bankAccountName: 'วิภาดา มุ่งมั่น',
    promptpayNumber: '0899988776',
    socialSecurity: true,
    taxPercent: new Prisma.Decimal(3),
    note: 'พนักงานประจำ จัดการแคมเปญโฆษณาและสื่อโซเชียล',
    isActive: true,
  },
  {
    employeeName: 'ธนวัฒน์ ว่องไว',
    employeeCode: 'EMP-003',
    department: 'คลังสินค้าและจัดส่ง',
    position: 'เจ้าหน้าที่แพ็คของ & จัดส่ง (Fulfillment)',
    salaryType: SalaryType.MONTHLY,
    baseSalary: new Prisma.Decimal(18000),
    bankName: 'ธนาคารกรุงเทพ (BBL)',
    bankAccountNumber: '901-0-23456-7',
    bankAccountName: 'ธนวัฒน์ ว่องไว',
    promptpayNumber: '0865544332',
    socialSecurity: true,
    taxPercent: new Prisma.Decimal(0),
    note: 'พนักงานประจำ ตรวจเช็คสต็อก แพ็คพัสดุ และส่งสินค้า',
    isActive: true,
  },
]

const MONTH_NAMES_TH = [
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

function getPeriodDates(period: string): {
  startDate: Date
  endDate: Date
  label: string
} {
  const [yearStr, monthStr] = period.split('-')
  const year = parseInt(yearStr, 10)
  const month = parseInt(monthStr, 10)

  const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0))
  const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999))
  const label = `${MONTH_NAMES_TH[month - 1]} ${year}`

  return { startDate, endDate, label }
}

async function checkAccess(
  storeId: string,
  permission: PermissionKey = 'canViewPayroll',
) {
  const user = await getCurrentUser()
  if (!user) {
    return { isAuthorized: false, message: 'กรุณาเข้าสู่ระบบ' }
  }

  const authCheck = await verifyEmployeePermission({
    userId: user.id,
    storeId,
    permission,
  })

  if (!authCheck.isAuthorized) {
    return {
      isAuthorized: false,
      message:
        authCheck.messageTH ||
        'คุณไม่มีสิทธิ์เข้าถึงข้อมูลเงินเดือนของร้านค้านี้',
    }
  }

  return { isAuthorized: true, userId: user.id }
}

// -------------------------------------------------------------
// 1. Employee Salary Configs (การตั้งค่าฐานเงินเดือนพนักงาน)
// -------------------------------------------------------------

export async function getEmployeeSalaryConfigs(storeId: string): Promise<{
  success: boolean
  data?: EmployeeSalaryConfigItem[]
  message?: string
}> {
  try {
    const auth = await checkAccess(storeId)
    if (!auth.isAuthorized) {
      return { success: false, message: auth.message }
    }

    let configs = await prisma.employeeSalaryConfig.findMany({
      where: { storeId },
      orderBy: { createdAt: 'asc' },
    })

    if (configs.length === 0) {
      // Check if store already has real employees in EmployeeStore
      const existingStoreEmployees = await prisma.employeeStore.findMany({
        where: { storeId },
        include: {
          employee: true,
          branches: {
            include: {
              role: true,
              branch: true,
            },
          },
        },
      })

      if (existingStoreEmployees.length > 0) {
        await prisma.employeeSalaryConfig.createMany({
          data: existingStoreEmployees.map((es, idx) => ({
            storeId,
            employeeId: es.employee.id,
            employeeName: es.employee.name,
            employeeCode: `EMP-${String(idx + 1).padStart(3, '0')}`,
            department: es.branches[0]?.branch?.name || 'สำนักงานใหญ่',
            position: es.branches[0]?.role?.name || 'พนักงาน',
            salaryType: SalaryType.MONTHLY,
            baseSalary: new Prisma.Decimal(15000),
            bankName: 'ธนาคารกสิกรไทย (KBANK)',
            bankAccountName: es.employee.name,
            isActive: true,
          })),
        })
      } else {
        // Auto seed default demo employees for ease of onboarding
        await prisma.employeeSalaryConfig.createMany({
          data: DEFAULT_EMPLOYEES.map((emp) => ({
            ...emp,
            storeId,
          })),
        })
      }

      configs = await prisma.employeeSalaryConfig.findMany({
        where: { storeId },
        orderBy: { createdAt: 'asc' },
      })
    }

    const items: EmployeeSalaryConfigItem[] = configs.map((c) => ({
      id: c.id,
      storeId: c.storeId,
      employeeId: c.employeeId,
      employeeName: c.employeeName,
      employeeCode: c.employeeCode,
      department: c.department,
      position: c.position,
      salaryType: c.salaryType,
      baseSalary: serializeDecimal(c.baseSalary),
      bankName: c.bankName,
      bankAccountNumber: c.bankAccountNumber,
      bankAccountName: c.bankAccountName,
      promptpayNumber: c.promptpayNumber,
      socialSecurity: c.socialSecurity,
      taxPercent: c.taxPercent ? serializeDecimal(c.taxPercent) : 0,
      isActive: c.isActive,
      note: c.note,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
    }))

    return { success: true, data: items }
  } catch (error) {
    console.error('getEmployeeSalaryConfigs error:', error)
    return { success: false, message: 'ไม่สามารถดึงข้อมูลพนักงานได้' }
  }
}

export interface UpsertEmployeeSalaryConfigInput {
  id?: string
  storeId: string
  employeeName: string
  employeeCode?: string
  department?: string
  position?: string
  salaryType: SalaryType
  baseSalary: number
  bankName?: string
  bankAccountNumber?: string
  bankAccountName?: string
  promptpayNumber?: string
  socialSecurity?: boolean
  taxPercent?: number
  note?: string
  isActive?: boolean
}

export async function upsertEmployeeSalaryConfig(
  input: UpsertEmployeeSalaryConfigInput,
): Promise<{
  success: boolean
  data?: EmployeeSalaryConfigItem
  message?: string
}> {
  try {
    const auth = await checkAccess(input.storeId, 'canUpdatePayroll')
    if (!auth.isAuthorized) {
      return { success: false, message: auth.message }
    }

    const dataPayload = {
      storeId: input.storeId,
      employeeName: input.employeeName,
      employeeCode: input.employeeCode,
      department: input.department,
      position: input.position,
      salaryType: input.salaryType,
      baseSalary: new Prisma.Decimal(input.baseSalary),
      bankName: input.bankName || null,
      bankAccountNumber: input.bankAccountNumber || null,
      bankAccountName: input.bankAccountName || null,
      promptpayNumber: input.promptpayNumber || null,
      socialSecurity: input.socialSecurity ?? false,
      taxPercent:
        input.taxPercent !== undefined
          ? new Prisma.Decimal(input.taxPercent)
          : null,
      note: input.note || null,
      isActive: input.isActive ?? true,
    }

    let record
    if (input.id) {
      record = await prisma.employeeSalaryConfig.update({
        where: { id: input.id, storeId: input.storeId },
        data: dataPayload,
      })
    } else {
      record = await prisma.employeeSalaryConfig.create({
        data: dataPayload,
      })
    }

    return {
      success: true,
      data: {
        id: record.id,
        storeId: record.storeId,
        employeeId: record.employeeId,
        employeeName: record.employeeName,
        employeeCode: record.employeeCode,
        department: record.department,
        position: record.position,
        salaryType: record.salaryType,
        baseSalary: serializeDecimal(record.baseSalary),
        bankName: record.bankName,
        bankAccountNumber: record.bankAccountNumber,
        bankAccountName: record.bankAccountName,
        promptpayNumber: record.promptpayNumber,
        socialSecurity: record.socialSecurity,
        taxPercent: record.taxPercent
          ? serializeDecimal(record.taxPercent)
          : null,
        note: record.note,
        isActive: record.isActive,
        createdAt: record.createdAt.toISOString(),
        updatedAt: record.updatedAt.toISOString(),
      },
    }
  } catch (error) {
    console.error('upsertEmployeeSalaryConfig error:', error)
    return { success: false, message: 'ไม่สามารถบันทึกข้อมูลพนักงานได้' }
  }
}

export async function deleteEmployeeSalaryConfig(
  id: string,
  storeId: string,
): Promise<{ success: boolean; message?: string }> {
  try {
    const auth = await checkAccess(storeId, 'canDeletePayroll')
    if (!auth.isAuthorized) {
      return { success: false, message: auth.message }
    }

    await prisma.employeeSalaryConfig.delete({
      where: { id, storeId },
    })

    return { success: true }
  } catch (error) {
    console.error('deleteEmployeeSalaryConfig error:', error)
    return { success: false, message: 'ไม่สามารถลบข้อมูลพนักงานได้' }
  }
}

export async function toggleEmployeeSalaryConfigStatus(
  id: string,
  storeId: string,
): Promise<{
  success: boolean
  data?: { isActive: boolean }
  message?: string
}> {
  try {
    const auth = await checkAccess(storeId, 'canUpdatePayroll')
    if (!auth.isAuthorized) {
      return { success: false, message: auth.message }
    }

    const current = await prisma.employeeSalaryConfig.findUnique({
      where: { id, storeId },
      select: { isActive: true },
    })

    if (!current) {
      return { success: false, message: 'ไม่พบข้อมูลพนักงาน' }
    }

    const updated = await prisma.employeeSalaryConfig.update({
      where: { id, storeId },
      data: { isActive: !current.isActive },
      select: { isActive: true },
    })

    return { success: true, data: { isActive: updated.isActive } }
  } catch (error) {
    console.error('toggleEmployeeSalaryConfigStatus error:', error)
    return { success: false, message: 'ไม่สามารถเปลี่ยนสถานะได้' }
  }
}

export async function syncEmployeesFromStore(
  storeId: string,
): Promise<{ success: boolean; count?: number; message?: string }> {
  try {
    const auth = await checkAccess(storeId, 'canUpdatePayroll')
    if (!auth.isAuthorized) {
      return { success: false, message: auth.message }
    }

    const storeEmployees = await prisma.employeeStore.findMany({
      where: { storeId },
      include: {
        employee: true,
        branches: {
          include: {
            role: true,
            branch: true,
          },
        },
      },
    })

    if (storeEmployees.length === 0) {
      return {
        success: false,
        message: 'ไม่พบพนักงานในระบบจัดการพนักงานของร้านค้านี้',
      }
    }

    const existingConfigs = await prisma.employeeSalaryConfig.findMany({
      where: { storeId },
      select: { employeeId: true, employeeName: true },
    })

    const existingEmployeeIds = new Set(
      existingConfigs.map((c) => c.employeeId).filter(Boolean),
    )
    const existingNames = new Set(existingConfigs.map((c) => c.employeeName))

    const toCreate = storeEmployees.filter(
      (es) =>
        !existingEmployeeIds.has(es.employee.id) &&
        !existingNames.has(es.employee.name),
    )

    if (toCreate.length === 0) {
      return {
        success: true,
        count: 0,
        message: 'รายชื่อพนักงานทั้งหมดมีอยู่ในระบบเงินเดือนเรียบร้อยแล้ว',
      }
    }

    await prisma.employeeSalaryConfig.createMany({
      data: toCreate.map((es, idx) => ({
        storeId,
        employeeId: es.employee.id,
        employeeName: es.employee.name,
        employeeCode: `EMP-${String(existingConfigs.length + idx + 1).padStart(3, '0')}`,
        department: es.branches[0]?.branch?.name || 'สำนักงานใหญ่',
        position: es.branches[0]?.role?.name || 'พนักงาน',
        salaryType: SalaryType.MONTHLY,
        baseSalary: new Prisma.Decimal(15000),
        bankName: 'ธนาคารกสิกรไทย (KBANK)',
        bankAccountName: es.employee.name,
        isActive: true,
      })),
    })

    return {
      success: true,
      count: toCreate.length,
      message: `ดึงข้อมูลพนักงานใหม่เข้ามาสำเร็จ ${toCreate.length} คน`,
    }
  } catch (error) {
    console.error('syncEmployeesFromStore error:', error)
    return { success: false, message: 'ไม่สามารถดึงข้อมูลพนักงานได้' }
  }
}

// -------------------------------------------------------------
// 2. Monthly Payroll (งวดการตัดรอบและจ่ายเงินเดือน)
// -------------------------------------------------------------

export async function getMonthlyPayroll(
  storeId: string,
  period: string, // e.g. "2026-09"
): Promise<{
  success: boolean
  data?: MonthlyPayrollRecord
  message?: string
}> {
  try {
    const auth = await checkAccess(storeId)
    if (!auth.isAuthorized) {
      return { success: false, message: auth.message }
    }

    const { startDate, endDate, label } = getPeriodDates(period)

    // Check if payroll record exists in DB
    const existing = await prisma.monthlyPayroll.findUnique({
      where: {
        storeId_period: { storeId, period },
      },
      include: {
        items: {
          orderBy: { createdAt: 'asc' },
        },
        expense: {
          select: {
            id: true,
            amount: true,
            title: true,
            category: true,
            expenseDate: true,
          },
        },
      },
    })

    if (existing) {
      const record: MonthlyPayrollRecord = {
        id: existing.id,
        storeId: existing.storeId,
        period: existing.period,
        periodLabel: existing.periodLabel,
        startDate: existing.startDate.toISOString(),
        endDate: existing.endDate.toISOString(),
        totalBaseSalary: serializeDecimal(existing.totalBaseSalary),
        totalOvertime: serializeDecimal(existing.totalOvertime),
        totalBonus: serializeDecimal(existing.totalBonus),
        totalCommission: serializeDecimal(existing.totalCommission),
        totalDeductions: serializeDecimal(existing.totalDeductions),
        totalNetSalary: serializeDecimal(existing.totalNetSalary),
        totalPaid: serializeDecimal(existing.totalPaid),
        isClosed: existing.isClosed,
        closedAt: existing.closedAt?.toISOString() || null,
        expenseId: existing.expenseId,
        note: existing.note,
        isDraft: false,
        items: existing.items.map((it) => ({
          id: it.id,
          monthlyPayrollId: it.monthlyPayrollId,
          employeeConfigId: it.employeeConfigId,
          employeeName: it.employeeName,
          employeeCode: it.employeeCode,
          department: it.department,
          position: it.position,
          salaryType: it.salaryType,
          baseSalary: serializeDecimal(it.baseSalary),
          overtimeAmount: serializeDecimal(it.overtimeAmount),
          bonusAmount: serializeDecimal(it.bonusAmount),
          commissionAmount: serializeDecimal(it.commissionAmount),
          deductionAmount: serializeDecimal(it.deductionAmount),
          netSalary: serializeDecimal(it.netSalary),
          status: it.status,
          paidAt: it.paidAt?.toISOString() || null,
          slipImage: it.slipImage,
          paymentNote: it.paymentNote,
          bankName: it.bankName,
          bankAccount: it.bankAccount,
          bankAccountName: it.bankAccountName,
          promptPay: it.promptPay,
          createdAt: it.createdAt.toISOString(),
          updatedAt: it.updatedAt.toISOString(),
        })),
        expense: existing.expense
          ? {
              id: existing.expense.id,
              amount: serializeDecimal(existing.expense.amount),
              title: existing.expense.title,
              category: existing.expense.category,
              expenseDate: existing.expense.expenseDate.toISOString(),
            }
          : null,
      }

      return { success: true, data: record }
    }

    // If not found, draft payroll from active EmployeeSalaryConfig
    const configs = await prisma.employeeSalaryConfig.findMany({
      where: { storeId, isActive: true },
      orderBy: { createdAt: 'asc' },
    })

    const draftItems: MonthlyPayrollItemRecord[] = configs.map((c) => {
      const base = serializeDecimal(c.baseSalary)
      return {
        id: `draft-${c.id}`,
        employeeConfigId: c.id,
        employeeName: c.employeeName,
        employeeCode: c.employeeCode,
        department: c.department,
        position: c.position,
        salaryType: c.salaryType,
        baseSalary: base,
        overtimeAmount: 0,
        bonusAmount: 0,
        commissionAmount: 0,
        deductionAmount: 0,
        netSalary: base,
        status: PayoutStatus.PENDING,
        bankName: c.bankName,
        bankAccount: c.bankAccountNumber,
        bankAccountName: c.bankAccountName,
        promptPay: c.promptpayNumber,
      }
    })

    const totalBase = draftItems.reduce((acc, curr) => acc + curr.baseSalary, 0)

    const draftRecord: MonthlyPayrollRecord = {
      id: `draft-${period}`,
      storeId,
      period,
      periodLabel: label,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      totalBaseSalary: totalBase,
      totalOvertime: 0,
      totalBonus: 0,
      totalCommission: 0,
      totalDeductions: 0,
      totalNetSalary: totalBase,
      totalPaid: 0,
      isClosed: false,
      isDraft: true,
      items: draftItems,
    }

    return { success: true, data: draftRecord }
  } catch (error) {
    console.error('getMonthlyPayroll error:', error)
    return { success: false, message: 'ไม่สามารถดึงข้อมูลงวดเงินเดือนได้' }
  }
}

export interface SaveMonthlyPayrollItemInput {
  id?: string
  employeeConfigId?: string | null
  employeeName: string
  employeeCode?: string | null
  department?: string | null
  position?: string | null
  salaryType?: SalaryType
  baseSalary: number
  overtimeAmount?: number
  bonusAmount?: number
  commissionAmount?: number
  deductionAmount?: number
  netSalary?: number
  status?: PayoutStatus
  bankName?: string | null
  bankAccount?: string | null
  bankAccountName?: string | null
  promptPay?: string | null
  slipImage?: string | null
  paymentNote?: string | null
}

export interface SaveMonthlyPayrollInput {
  storeId: string
  period: string
  note?: string
  items: SaveMonthlyPayrollItemInput[]
}

export async function saveMonthlyPayroll(
  input: SaveMonthlyPayrollInput,
): Promise<{
  success: boolean
  data?: MonthlyPayrollRecord
  message?: string
}> {
  try {
    const auth = await checkAccess(input.storeId, 'canUpdatePayroll')
    if (!auth.isAuthorized) {
      return { success: false, message: auth.message }
    }

    const { startDate, endDate, label } = getPeriodDates(input.period)

    let totalBase = 0
    let totalOT = 0
    let totalBonus = 0
    let totalComm = 0
    let totalDeduct = 0
    let totalNet = 0
    let totalPaid = 0

    const preparedItems = input.items.map((it) => {
      const base = Number(it.baseSalary || 0)
      const ot = Number(it.overtimeAmount || 0)
      const bonus = Number(it.bonusAmount || 0)
      const comm = Number(it.commissionAmount || 0)
      const deduct = Number(it.deductionAmount || 0)
      const net = Math.max(0, base + ot + bonus + comm - deduct)

      totalBase += base
      totalOT += ot
      totalBonus += bonus
      totalComm += comm
      totalDeduct += deduct
      totalNet += net
      if (it.status === PayoutStatus.PAID) {
        totalPaid += net
      }

      return {
        id: it.id && !it.id.startsWith('draft-') ? it.id : undefined,
        employeeConfigId: it.employeeConfigId || null,
        employeeName: it.employeeName,
        employeeCode: it.employeeCode || null,
        department: it.department || null,
        position: it.position || null,
        salaryType: it.salaryType || SalaryType.MONTHLY,
        baseSalary: new Prisma.Decimal(base),
        overtimeAmount: new Prisma.Decimal(ot),
        bonusAmount: new Prisma.Decimal(bonus),
        commissionAmount: new Prisma.Decimal(comm),
        deductionAmount: new Prisma.Decimal(deduct),
        netSalary: new Prisma.Decimal(net),
        status: it.status || PayoutStatus.PENDING,
        bankName: it.bankName || null,
        bankAccount: it.bankAccount || null,
        bankAccountName: it.bankAccountName || null,
        promptPay: it.promptPay || null,
        slipImage: it.slipImage || null,
        paymentNote: it.paymentNote || null,
      }
    })

    // Upsert MonthlyPayroll
    const payroll = await prisma.monthlyPayroll.upsert({
      where: {
        storeId_period: {
          storeId: input.storeId,
          period: input.period,
        },
      },
      update: {
        totalBaseSalary: new Prisma.Decimal(totalBase),
        totalOvertime: new Prisma.Decimal(totalOT),
        totalBonus: new Prisma.Decimal(totalBonus),
        totalCommission: new Prisma.Decimal(totalComm),
        totalDeductions: new Prisma.Decimal(totalDeduct),
        totalNetSalary: new Prisma.Decimal(totalNet),
        totalPaid: new Prisma.Decimal(totalPaid),
        note: input.note || null,
      },
      create: {
        storeId: input.storeId,
        period: input.period,
        periodLabel: label,
        startDate,
        endDate,
        totalBaseSalary: new Prisma.Decimal(totalBase),
        totalOvertime: new Prisma.Decimal(totalOT),
        totalBonus: new Prisma.Decimal(totalBonus),
        totalCommission: new Prisma.Decimal(totalComm),
        totalDeductions: new Prisma.Decimal(totalDeduct),
        totalNetSalary: new Prisma.Decimal(totalNet),
        totalPaid: new Prisma.Decimal(totalPaid),
        note: input.note || null,
      },
    })

    // Remove old items and re-create for clean state
    await prisma.monthlyPayrollItem.deleteMany({
      where: { monthlyPayrollId: payroll.id },
    })

    await prisma.monthlyPayrollItem.createMany({
      data: preparedItems.map((it) => ({
        ...it,
        monthlyPayrollId: payroll.id,
      })),
    })

    // If already linked to an expense, sync updated amount
    if (payroll.expenseId) {
      await prisma.expense.update({
        where: { id: payroll.expenseId },
        data: {
          amount: new Prisma.Decimal(totalNet),
          title: `ค่าจ้าง/เงินเดือนพนักงาน ประจำงวด ${payroll.periodLabel}`,
        },
      })
    }

    return await getMonthlyPayroll(input.storeId, input.period)
  } catch (error) {
    console.error('saveMonthlyPayroll error:', error)
    return { success: false, message: 'ไม่สามารถบันทึกงวดเงินเดือนได้' }
  }
}

export interface UpdatePayrollItemPayoutInput {
  itemId: string
  storeId: string
  period: string
  status: PayoutStatus
  paidAt?: Date | null
  slipImage?: string | null
  paymentNote?: string | null
}

export async function updatePayrollItemPayout(
  input: UpdatePayrollItemPayoutInput,
): Promise<{ success: boolean; message?: string }> {
  try {
    const auth = await checkAccess(input.storeId, 'canUpdatePayroll')
    if (!auth.isAuthorized) {
      return { success: false, message: auth.message }
    }

    const item = await prisma.monthlyPayrollItem.update({
      where: { id: input.itemId },
      data: {
        status: input.status,
        paidAt:
          input.status === PayoutStatus.PAID
            ? input.paidAt || new Date()
            : null,
        slipImage: input.slipImage,
        paymentNote: input.paymentNote,
      },
    })

    // Recalculate totalPaid in MonthlyPayroll
    const paidItems = await prisma.monthlyPayrollItem.findMany({
      where: {
        monthlyPayrollId: item.monthlyPayrollId,
        status: PayoutStatus.PAID,
      },
      select: { netSalary: true },
    })

    const totalPaid = paidItems.reduce(
      (acc, curr) => acc + serializeDecimal(curr.netSalary),
      0,
    )

    await prisma.monthlyPayroll.update({
      where: { id: item.monthlyPayrollId },
      data: {
        totalPaid: new Prisma.Decimal(totalPaid),
      },
    })

    return { success: true }
  } catch (error) {
    console.error('updatePayrollItemPayout error:', error)
    return { success: false, message: 'ไม่สามารถอัปเดตสถานะโอนเงินได้' }
  }
}

// -------------------------------------------------------------
// 3. Expense Synchronization (เชื่อมโยงกับระบบค่าใช้จ่ายร้านค้า)
// -------------------------------------------------------------

export async function syncPayrollToExpense(
  payrollId: string,
  storeId: string,
): Promise<{ success: boolean; expenseId?: string; message?: string }> {
  try {
    const auth = await checkAccess(storeId, 'canUpdatePayroll')
    if (!auth.isAuthorized) {
      return { success: false, message: auth.message }
    }

    const payroll = await prisma.monthlyPayroll.findUnique({
      where: { id: payrollId, storeId },
      include: { items: true },
    })

    if (!payroll) {
      return { success: false, message: 'ไม่พบข้อมูลงวดเงินเดือน' }
    }

    const title = `ค่าจ้าง/เงินเดือนพนักงาน ประจำงวด ${payroll.periodLabel}`
    const note = `ตัดยอดเงินเดือนพนักงาน ${payroll.items.length} คน (งวด ${payroll.periodLabel}) ยอดสุทธิ ฿${serializeDecimal(payroll.totalNetSalary).toLocaleString()}`

    let expenseId = payroll.expenseId

    if (expenseId) {
      // Update existing expense
      await prisma.expense.update({
        where: { id: expenseId },
        data: {
          title,
          amount: payroll.totalNetSalary,
          note,
          expenseDate: payroll.endDate,
        },
      })
    } else {
      // Create new expense under SALARY category
      const expense = await prisma.expense.create({
        data: {
          storeId,
          title,
          amount: payroll.totalNetSalary,
          category: ExpenseCategory.SALARY,
          expenseDate: payroll.endDate,
          note,
        },
      })

      expenseId = expense.id

      await prisma.monthlyPayroll.update({
        where: { id: payrollId },
        data: { expenseId },
      })
    }

    return { success: true, expenseId }
  } catch (error) {
    console.error('syncPayrollToExpense error:', error)
    return { success: false, message: 'ไม่สามารถบันทึกค่าใช้จ่ายได้' }
  }
}

export async function closeMonthlyPayroll(
  payrollId: string,
  storeId: string,
  isClosed: boolean,
  autoRecordExpense: boolean = true,
): Promise<{ success: boolean; message?: string }> {
  try {
    const auth = await checkAccess(storeId, 'canUpdatePayroll')
    if (!auth.isAuthorized) {
      return { success: false, message: auth.message }
    }

    await prisma.monthlyPayroll.update({
      where: { id: payrollId, storeId },
      data: {
        isClosed,
        closedAt: isClosed ? new Date() : null,
      },
    })

    // If closing and autoRecordExpense requested, sync to Expense
    if (isClosed && autoRecordExpense) {
      await syncPayrollToExpense(payrollId, storeId)
    }

    return { success: true }
  } catch (error) {
    console.error('closeMonthlyPayroll error:', error)
    return { success: false, message: 'ไม่สามารถบันทึกการปิดรอบได้' }
  }
}

export async function getMonthlyPayrollHistory(storeId: string): Promise<{
  success: boolean
  data?: MonthlyPayrollRecord[]
  message?: string
}> {
  try {
    const auth = await checkAccess(storeId)
    if (!auth.isAuthorized) {
      return { success: false, message: auth.message }
    }

    const records = await prisma.monthlyPayroll.findMany({
      where: { storeId },
      orderBy: { period: 'desc' },
      include: {
        items: {
          orderBy: { createdAt: 'asc' },
        },
        expense: {
          select: {
            id: true,
            amount: true,
            title: true,
            category: true,
            expenseDate: true,
          },
        },
      },
    })

    const items: MonthlyPayrollRecord[] = records.map((r) => ({
      id: r.id,
      storeId: r.storeId,
      period: r.period,
      periodLabel: r.periodLabel,
      startDate: r.startDate.toISOString(),
      endDate: r.endDate.toISOString(),
      totalBaseSalary: serializeDecimal(r.totalBaseSalary),
      totalOvertime: serializeDecimal(r.totalOvertime),
      totalBonus: serializeDecimal(r.totalBonus),
      totalCommission: serializeDecimal(r.totalCommission),
      totalDeductions: serializeDecimal(r.totalDeductions),
      totalNetSalary: serializeDecimal(r.totalNetSalary),
      totalPaid: serializeDecimal(r.totalPaid),
      isClosed: r.isClosed,
      closedAt: r.closedAt?.toISOString() || null,
      expenseId: r.expenseId,
      note: r.note,
      isDraft: false,
      items: r.items.map((it) => ({
        id: it.id,
        monthlyPayrollId: it.monthlyPayrollId,
        employeeConfigId: it.employeeConfigId,
        employeeName: it.employeeName,
        employeeCode: it.employeeCode,
        department: it.department,
        position: it.position,
        salaryType: it.salaryType,
        baseSalary: serializeDecimal(it.baseSalary),
        overtimeAmount: serializeDecimal(it.overtimeAmount),
        bonusAmount: serializeDecimal(it.bonusAmount),
        commissionAmount: serializeDecimal(it.commissionAmount),
        deductionAmount: serializeDecimal(it.deductionAmount),
        netSalary: serializeDecimal(it.netSalary),
        status: it.status,
        paidAt: it.paidAt?.toISOString() || null,
        slipImage: it.slipImage,
        paymentNote: it.paymentNote,
        bankName: it.bankName,
        bankAccount: it.bankAccount,
        bankAccountName: it.bankAccountName,
        promptPay: it.promptPay,
        createdAt: it.createdAt.toISOString(),
        updatedAt: it.updatedAt.toISOString(),
      })),
      expense: r.expense
        ? {
            id: r.expense.id,
            amount: serializeDecimal(r.expense.amount),
            title: r.expense.title,
            category: r.expense.category,
            expenseDate: r.expense.expenseDate.toISOString(),
          }
        : null,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }))

    return { success: true, data: items }
  } catch (error) {
    console.error('getMonthlyPayrollHistory error:', error)
    return { success: false, message: 'ไม่สามารถดึงประวัติงวดเงินเดือนได้' }
  }
}
