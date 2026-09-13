'use server'

import { Prisma } from '@/generated/prisma/client'
import { PartnerRole, PayoutStatus, ShareType } from '@/generated/prisma/enums'
import {
  MonthlySettlementRecord,
  ProfitPartnerItem,
  ProfitPayoutItem,
} from '@/types/profit-sharing'
import { serializeDecimal } from '@/utils/decimal'

import { getCurrentUser } from '@/lib/auth-server'
import { verifyEmployeePermission } from '@/lib/permission'
import { prisma } from '@/lib/prisma'

const DEFAULT_PARTNERS = [
  {
    name: 'คุณณัฐพล (หุ้นส่วนผู้ก่อตั้ง)',
    role: PartnerRole.SHAREHOLDER,
    shareType: ShareType.NET_PROFIT_PERCENT,
    shareValue: new Prisma.Decimal(40),
    bankName: 'ธนาคารกสิกรไทย (KBANK)',
    bankAccount: '098-2-34567-8',
    bankAccountName: 'ณัฐพล วงศ์สวัสดิ์',
    promptPay: '0812345678',
    note: 'หุ้นส่วนหลัก รับส่วนแบ่ง 40% ของกำไรสุทธิหลังหักค่าใช้จ่าย',
    isActive: true,
  },
  {
    name: 'คุณกิตติศักดิ์ (หุ้นส่วนฝ่ายบริหาร)',
    role: PartnerRole.SHAREHOLDER,
    shareType: ShareType.NET_PROFIT_PERCENT,
    shareValue: new Prisma.Decimal(30),
    bankName: 'ธนาคารไทยพาณิชย์ (SCB)',
    bankAccount: '405-1-89234-1',
    bankAccountName: 'กิตติศักดิ์ รัตนชัย',
    promptPay: '0898765432',
    note: 'หุ้นส่วนฝ่ายบริหาร รับส่วนแบ่ง 30% ของกำไรสุทธิ',
    isActive: true,
  },
  {
    name: 'ทีมเดฟ / ค่าพัฒนาระบบซอฟต์แวร์',
    role: PartnerRole.DEVELOPER,
    shareType: ShareType.NET_PROFIT_PERCENT,
    shareValue: new Prisma.Decimal(10),
    bankName: 'ธนาคารกรุงเทพ (BBL)',
    bankAccount: '123-4-56789-0',
    bankAccountName: 'บจก. ดิจิทัล โซลูชั่นส์',
    promptPay: '0105561234567',
    note: 'ค่าเดฟพัฒนาระบบและฟีเจอร์ คิด 10% ของกำไรสุทธิประจำเดือน',
    isActive: true,
  },
  {
    name: 'ค่าเซิร์ฟเวอร์ & คลาวด์แพลตฟอร์ม',
    role: PartnerRole.SYSTEM,
    shareType: ShareType.FIXED_MONTHLY,
    shareValue: new Prisma.Decimal(2500),
    bankName: 'ธนาคารกสิกรไทย (KBANK)',
    bankAccount: '789-0-12345-6',
    bankAccountName: 'คลาวด์ แอนด์ โฮสติ้ง เซอร์วิส',
    promptPay: '',
    note: 'ค่าบำรุงรักษา Server, Database, CDN รายเดือนคงที่ 2,500 บาท',
    isActive: true,
  },
]

export async function getProfitPartners(
  storeId: string,
): Promise<ProfitPartnerItem[]> {
  if (!storeId || storeId === 'all') return []

  const user = await getCurrentUser()
  if (!user?.id) return []

  const auth = await verifyEmployeePermission({
    userId: user.id,
    storeId,
    permission: 'canViewFinance',
  })
  if (!auth.isAuthorized) return []

  let partners = await prisma.profitPartner.findMany({
    where: { storeId },
    orderBy: { createdAt: 'asc' },
  })

  // Auto seed default templates for this store if empty
  if (partners.length === 0) {
    await prisma.profitPartner.createMany({
      data: DEFAULT_PARTNERS.map((p) => ({
        ...p,
        storeId,
      })),
    })

    partners = await prisma.profitPartner.findMany({
      where: { storeId },
      orderBy: { createdAt: 'asc' },
    })
  }

  return serializeDecimal(partners) as unknown as ProfitPartnerItem[]
}

export interface UpsertPartnerInput {
  id?: string
  storeId: string
  name: string
  role: PartnerRole
  shareType: ShareType
  shareValue: number
  bankName?: string | null
  bankAccount?: string | null
  bankAccountName?: string | null
  promptPay?: string | null
  note?: string | null
  isActive?: boolean
}

export async function upsertProfitPartner(
  input: UpsertPartnerInput,
): Promise<{ success: boolean; data?: ProfitPartnerItem; message?: string }> {
  const user = await getCurrentUser()
  if (!user?.id) return { success: false, message: 'Unauthorized' }

  const auth = await verifyEmployeePermission({
    userId: user.id,
    storeId: input.storeId,
    permission: 'canViewFinance',
  })
  if (!auth.isAuthorized) return { success: false, message: 'Forbidden' }

  try {
    if (input.id) {
      const updated = await prisma.profitPartner.update({
        where: { id: input.id, storeId: input.storeId },
        data: {
          name: input.name,
          role: input.role,
          shareType: input.shareType,
          shareValue: new Prisma.Decimal(input.shareValue),
          bankName: input.bankName,
          bankAccount: input.bankAccount,
          bankAccountName: input.bankAccountName,
          promptPay: input.promptPay,
          note: input.note,
          isActive: input.isActive ?? true,
        },
      })
      return {
        success: true,
        data: serializeDecimal(updated) as unknown as ProfitPartnerItem,
      }
    } else {
      const created = await prisma.profitPartner.create({
        data: {
          storeId: input.storeId,
          name: input.name,
          role: input.role,
          shareType: input.shareType,
          shareValue: new Prisma.Decimal(input.shareValue),
          bankName: input.bankName,
          bankAccount: input.bankAccount,
          bankAccountName: input.bankAccountName,
          promptPay: input.promptPay,
          note: input.note,
          isActive: input.isActive ?? true,
        },
      })
      return {
        success: true,
        data: serializeDecimal(created) as unknown as ProfitPartnerItem,
      }
    }
  } catch (err: any) {
    return { success: false, message: err?.message || 'Failed to save partner' }
  }
}

export async function deleteProfitPartner(
  id: string,
  storeId: string,
): Promise<{ success: boolean; message?: string }> {
  const user = await getCurrentUser()
  if (!user?.id) return { success: false, message: 'Unauthorized' }

  const auth = await verifyEmployeePermission({
    userId: user.id,
    storeId,
    permission: 'canViewFinance',
  })
  if (!auth.isAuthorized) return { success: false, message: 'Forbidden' }

  try {
    await prisma.profitPartner.delete({
      where: { id, storeId },
    })
    return { success: true }
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || 'Failed to delete partner',
    }
  }
}

export async function toggleProfitPartnerStatus(
  id: string,
  storeId: string,
): Promise<{ success: boolean; isActive?: boolean; message?: string }> {
  const user = await getCurrentUser()
  if (!user?.id) return { success: false, message: 'Unauthorized' }

  const auth = await verifyEmployeePermission({
    userId: user.id,
    storeId,
    permission: 'canViewFinance',
  })
  if (!auth.isAuthorized) return { success: false, message: 'Forbidden' }

  try {
    const partner = await prisma.profitPartner.findUnique({
      where: { id, storeId },
      select: { isActive: true },
    })
    if (!partner) return { success: false, message: 'Partner not found' }

    const updated = await prisma.profitPartner.update({
      where: { id, storeId },
      data: { isActive: !partner.isActive },
      select: { isActive: true },
    })
    return { success: true, isActive: updated.isActive }
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || 'Failed to toggle status',
    }
  }
}

export async function getMonthlySettlement(
  storeId: string,
  period: string,
): Promise<MonthlySettlementRecord | null> {
  if (!storeId || storeId === 'all' || !period) return null

  const user = await getCurrentUser()
  if (!user?.id) return null

  const auth = await verifyEmployeePermission({
    userId: user.id,
    storeId,
    permission: 'canViewFinance',
  })
  if (!auth.isAuthorized) return null

  const settlement = await prisma.monthlySettlement.findUnique({
    where: {
      storeId_period: { storeId, period },
    },
    include: {
      payouts: {
        orderBy: { createdAt: 'asc' },
      },
    },
  })

  if (!settlement) return null
  return serializeDecimal(settlement) as unknown as MonthlySettlementRecord
}

export async function getMonthlySettlementHistory(
  storeId: string,
): Promise<MonthlySettlementRecord[]> {
  if (!storeId || storeId === 'all') return []

  const user = await getCurrentUser()
  if (!user?.id) return []

  const auth = await verifyEmployeePermission({
    userId: user.id,
    storeId,
    permission: 'canViewFinance',
  })
  if (!auth.isAuthorized) return []

  const settlements = await prisma.monthlySettlement.findMany({
    where: { storeId },
    include: {
      payouts: {
        orderBy: { createdAt: 'asc' },
      },
    },
    orderBy: { period: 'desc' },
  })

  return serializeDecimal(settlements) as unknown as MonthlySettlementRecord[]
}

export interface SaveSettlementInput {
  storeId: string
  period: string
  periodLabel: string
  startDate: string
  endDate: string
  totalRevenue: number
  totalCogs: number
  totalExpense: number
  netProfit: number
  totalAllocated: number
  retainedEarnings: number
  isClosed?: boolean
  payouts: Array<{
    partnerId: string
    partnerName: string
    role: PartnerRole
    shareType: ShareType
    shareValue: number
    calculatedAmount: number
    status?: PayoutStatus
    bankName?: string | null
    bankAccount?: string | null
    bankAccountName?: string | null
    promptPay?: string | null
    paidAt?: string | null
    slipImage?: string | null
    paymentNote?: string | null
  }>
}

export async function saveMonthlySettlement(
  input: SaveSettlementInput,
): Promise<{
  success: boolean
  data?: MonthlySettlementRecord
  message?: string
}> {
  const user = await getCurrentUser()
  if (!user?.id) return { success: false, message: 'Unauthorized' }

  const auth = await verifyEmployeePermission({
    userId: user.id,
    storeId: input.storeId,
    permission: 'canViewFinance',
  })
  if (!auth.isAuthorized) return { success: false, message: 'Forbidden' }

  try {
    const existing = await prisma.monthlySettlement.findUnique({
      where: {
        storeId_period: {
          storeId: input.storeId,
          period: input.period,
        },
      },
      include: { payouts: true },
    })

    const settlement = await prisma.$transaction(async (tx) => {
      let settlementRecord

      if (existing) {
        settlementRecord = await tx.monthlySettlement.update({
          where: { id: existing.id },
          data: {
            periodLabel: input.periodLabel,
            startDate: new Date(input.startDate),
            endDate: new Date(input.endDate),
            totalRevenue: new Prisma.Decimal(input.totalRevenue),
            totalCogs: new Prisma.Decimal(input.totalCogs),
            totalExpense: new Prisma.Decimal(input.totalExpense),
            netProfit: new Prisma.Decimal(input.netProfit),
            totalAllocated: new Prisma.Decimal(input.totalAllocated),
            retainedEarnings: new Prisma.Decimal(input.retainedEarnings),
            isClosed: input.isClosed ?? existing.isClosed,
          },
        })

        // Upsert each payout item while preserving existing slip or paid status if not overwritten
        for (const p of input.payouts) {
          const existingPayout = existing.payouts.find(
            (ep) => ep.partnerId === p.partnerId,
          )

          if (existingPayout) {
            await tx.profitPayout.update({
              where: { id: existingPayout.id },
              data: {
                partnerName: p.partnerName,
                role: p.role,
                shareType: p.shareType,
                shareValue: new Prisma.Decimal(p.shareValue),
                calculatedAmount: new Prisma.Decimal(p.calculatedAmount),
                status: p.status ?? existingPayout.status,
                bankName: p.bankName ?? existingPayout.bankName,
                bankAccount: p.bankAccount ?? existingPayout.bankAccount,
                bankAccountName:
                  p.bankAccountName ?? existingPayout.bankAccountName,
                promptPay: p.promptPay ?? existingPayout.promptPay,
                paidAt: p.paidAt ? new Date(p.paidAt) : existingPayout.paidAt,
                slipImage: p.slipImage ?? existingPayout.slipImage,
                paymentNote: p.paymentNote ?? existingPayout.paymentNote,
              },
            })
          } else {
            await tx.profitPayout.create({
              data: {
                settlementId: settlementRecord.id,
                partnerId: p.partnerId,
                partnerName: p.partnerName,
                role: p.role,
                shareType: p.shareType,
                shareValue: new Prisma.Decimal(p.shareValue),
                calculatedAmount: new Prisma.Decimal(p.calculatedAmount),
                status: p.status ?? PayoutStatus.PENDING,
                bankName: p.bankName,
                bankAccount: p.bankAccount,
                bankAccountName: p.bankAccountName,
                promptPay: p.promptPay,
                paidAt: p.paidAt ? new Date(p.paidAt) : null,
                slipImage: p.slipImage,
                paymentNote: p.paymentNote,
              },
            })
          }
        }
      } else {
        settlementRecord = await tx.monthlySettlement.create({
          data: {
            storeId: input.storeId,
            period: input.period,
            periodLabel: input.periodLabel,
            startDate: new Date(input.startDate),
            endDate: new Date(input.endDate),
            totalRevenue: new Prisma.Decimal(input.totalRevenue),
            totalCogs: new Prisma.Decimal(input.totalCogs),
            totalExpense: new Prisma.Decimal(input.totalExpense),
            netProfit: new Prisma.Decimal(input.netProfit),
            totalAllocated: new Prisma.Decimal(input.totalAllocated),
            retainedEarnings: new Prisma.Decimal(input.retainedEarnings),
            isClosed: input.isClosed ?? false,
            payouts: {
              create: input.payouts.map((p) => ({
                partnerId: p.partnerId,
                partnerName: p.partnerName,
                role: p.role,
                shareType: p.shareType,
                shareValue: new Prisma.Decimal(p.shareValue),
                calculatedAmount: new Prisma.Decimal(p.calculatedAmount),
                status: p.status ?? PayoutStatus.PENDING,
                bankName: p.bankName,
                bankAccount: p.bankAccount,
                bankAccountName: p.bankAccountName,
                promptPay: p.promptPay,
                paidAt: p.paidAt ? new Date(p.paidAt) : null,
                slipImage: p.slipImage,
                paymentNote: p.paymentNote,
              })),
            },
          },
        })
      }

      return tx.monthlySettlement.findUnique({
        where: { id: settlementRecord.id },
        include: {
          payouts: {
            orderBy: { createdAt: 'asc' },
          },
        },
      })
    })

    return {
      success: true,
      data: serializeDecimal(settlement) as unknown as MonthlySettlementRecord,
    }
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || 'Failed to save settlement',
    }
  }
}

export async function updatePayoutStatus(
  payoutId: string,
  status: PayoutStatus,
  details?: {
    paidAt?: string | null
    slipImage?: string | null
    paymentNote?: string | null
  },
): Promise<{ success: boolean; data?: ProfitPayoutItem; message?: string }> {
  const user = await getCurrentUser()
  if (!user?.id) return { success: false, message: 'Unauthorized' }

  try {
    const updated = await prisma.profitPayout.update({
      where: { id: payoutId },
      data: {
        status,
        paidAt: details?.paidAt
          ? new Date(details.paidAt)
          : status === PayoutStatus.PAID
            ? new Date()
            : null,
        slipImage:
          details?.slipImage !== undefined ? details.slipImage : undefined,
        paymentNote:
          details?.paymentNote !== undefined ? details.paymentNote : undefined,
      },
    })
    return {
      success: true,
      data: serializeDecimal(updated) as unknown as ProfitPayoutItem,
    }
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || 'Failed to update payout',
    }
  }
}

export async function closeMonthlySettlement(
  settlementId: string,
  storeId: string,
  isClosed: boolean = true,
): Promise<{ success: boolean; message?: string }> {
  const user = await getCurrentUser()
  if (!user?.id) return { success: false, message: 'Unauthorized' }

  const auth = await verifyEmployeePermission({
    userId: user.id,
    storeId,
    permission: 'canViewFinance',
  })
  if (!auth.isAuthorized) return { success: false, message: 'Forbidden' }

  try {
    await prisma.monthlySettlement.update({
      where: { id: settlementId, storeId },
      data: { isClosed },
    })
    return { success: true }
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || 'Failed to close settlement',
    }
  }
}
