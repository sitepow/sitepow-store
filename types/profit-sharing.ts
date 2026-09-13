import { PartnerRole, PayoutStatus, ShareType } from '@/generated/prisma/enums'

export { PartnerRole, PayoutStatus, ShareType }

export interface ProfitPartnerItem {
  id: string
  storeId: string
  name: string
  role: PartnerRole
  shareType: ShareType
  shareValue: number
  bankName: string | null
  bankAccount: string | null
  bankAccountName: string | null
  promptPay: string | null
  note: string | null
  isActive: boolean
  createdAt: Date | string
  updatedAt: Date | string
}

export interface ProfitPayoutItem {
  id: string
  settlementId: string
  partnerId: string
  partnerName: string
  role: PartnerRole
  shareType: ShareType
  shareValue: number
  calculatedAmount: number
  status: PayoutStatus
  paidAt: Date | string | null
  slipImage: string | null
  paymentNote: string | null
  bankName: string | null
  bankAccount: string | null
  bankAccountName: string | null
  promptPay: string | null
  createdAt: Date | string
  updatedAt: Date | string
}

export interface MonthlySettlementRecord {
  id: string
  storeId: string
  period: string // e.g. "2026-03"
  periodLabel: string // e.g. "มีนาคม 2569"
  startDate: Date | string
  endDate: Date | string
  totalRevenue: number
  totalCogs: number
  totalExpense: number
  netProfit: number
  totalAllocated: number
  retainedEarnings: number
  isClosed: boolean
  payouts: ProfitPayoutItem[]
  createdAt: Date | string
  updatedAt: Date | string
}
