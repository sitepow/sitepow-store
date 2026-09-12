'use server'

import {
  SERVER_ERROR_MESSAGE_EN,
  SERVER_ERROR_MESSAGE_TH,
} from '@/constants/system'
import {
  AffiliateCommissionStatus,
  PayoutStatus,
  Prisma,
} from '@/generated/prisma/client'
import { serializeDecimal } from '@/utils/decimal'

import { getCurrentUser } from '@/lib/auth-server'
import { prisma } from '@/lib/prisma'

export interface UpdateStoreAffiliateSettingInput {
  isEnabled: boolean
  defaultCommissionRate: number
  minWithdrawalAmount: number
  cookieDurationDays?: number
}

export async function getStoreAffiliateSetting(storeId: string) {
  try {
    const userSession = await getCurrentUser()
    if (!userSession?.id) {
      return {
        success: false,
        messageTH: 'กรุณาเข้าสู่ระบบก่อนทำรายการ',
        messageEN: 'Please sign in to proceed',
        message: 'กรุณาเข้าสู่ระบบก่อนทำรายการ',
      }
    }

    let setting = await prisma.storeAffiliateSetting.findUnique({
      where: { storeId },
    })

    if (!setting) {
      setting = await prisma.storeAffiliateSetting.create({
        data: {
          storeId,
          isEnabled: false,
          defaultCommissionRate: 5.0,
          minWithdrawalAmount: 100.0,
          cookieDurationDays: 30,
        },
      })
    }

    return {
      success: true,
      data: serializeDecimal(setting),
    }
  } catch (error) {
    console.error('getStoreAffiliateSetting error:', error)
    return {
      success: false,
      messageTH: SERVER_ERROR_MESSAGE_TH,
      messageEN: SERVER_ERROR_MESSAGE_EN,
      message: SERVER_ERROR_MESSAGE_TH,
    }
  }
}

export async function updateStoreAffiliateSetting(
  storeId: string,
  input: UpdateStoreAffiliateSettingInput,
) {
  try {
    const userSession = await getCurrentUser()
    if (!userSession?.id) {
      return {
        success: false,
        messageTH: 'กรุณาเข้าสู่ระบบก่อนทำรายการ',
        messageEN: 'Please sign in to proceed',
        message: 'กรุณาเข้าสู่ระบบก่อนทำรายการ',
      }
    }

    const setting = await prisma.storeAffiliateSetting.upsert({
      where: { storeId },
      update: {
        isEnabled: input.isEnabled,
        defaultCommissionRate: input.defaultCommissionRate,
        minWithdrawalAmount: input.minWithdrawalAmount,
        cookieDurationDays: input.cookieDurationDays ?? 30,
      },
      create: {
        storeId,
        isEnabled: input.isEnabled,
        defaultCommissionRate: input.defaultCommissionRate,
        minWithdrawalAmount: input.minWithdrawalAmount,
        cookieDurationDays: input.cookieDurationDays ?? 30,
      },
    })

    return {
      success: true,
      data: serializeDecimal(setting),
      messageTH: 'บันทึกการตั้งค่าระบบนายหน้าเรียบร้อยแล้ว',
      messageEN: 'Affiliate program settings updated successfully',
      message: 'บันทึกการตั้งค่าระบบนายหน้าเรียบร้อยแล้ว',
    }
  } catch (error) {
    console.error('updateStoreAffiliateSetting error:', error)
    return {
      success: false,
      messageTH: 'เกิดข้อผิดพลาดในการบันทึกการตั้งค่า',
      messageEN: 'Failed to update affiliate settings',
      message: 'เกิดข้อผิดพลาดในการบันทึกการตั้งค่า',
    }
  }
}

export async function getMerchantAffiliateStats(storeId: string) {
  try {
    const userSession = await getCurrentUser()
    if (!userSession?.id) {
      return {
        success: false,
        messageTH: 'กรุณาเข้าสู่ระบบก่อนทำรายการ',
        messageEN: 'Please sign in to proceed',
        message: 'กรุณาเข้าสู่ระบบก่อนทำรายการ',
      }
    }

    const [totalAffiliates, referrals, pendingPayouts, paidPayouts] =
      await Promise.all([
        prisma.affiliateAccount.count({
          where: { storeId },
        }),
        prisma.affiliateReferral.findMany({
          where: {
            affiliateAccount: { storeId },
            status: {
              in: [
                AffiliateCommissionStatus.APPROVED,
                AffiliateCommissionStatus.PAID,
              ],
            },
          },
          select: {
            orderAmount: true,
            commissionAmount: true,
          },
        }),
        prisma.affiliatePayout.aggregate({
          where: {
            affiliateAccount: { storeId },
            status: PayoutStatus.PENDING,
          },
          _sum: { amount: true },
          _count: { id: true },
        }),
        prisma.affiliatePayout.aggregate({
          where: {
            affiliateAccount: { storeId },
            status: PayoutStatus.PAID,
          },
          _sum: { amount: true },
        }),
      ])

    const totalSales = referrals.reduce(
      (sum, r) => sum + Number(r.orderAmount),
      0,
    )
    const totalCommissionApproved = referrals.reduce(
      (sum, r) => sum + Number(r.commissionAmount),
      0,
    )

    return {
      success: true,
      data: {
        totalAffiliates,
        totalSales,
        totalCommissionApproved,
        pendingPayoutAmount: Number(pendingPayouts._sum.amount ?? 0),
        pendingPayoutCount: pendingPayouts._count.id,
        totalCommissionPaid: Number(paidPayouts._sum.amount ?? 0),
      },
    }
  } catch (error) {
    console.error('getMerchantAffiliateStats error:', error)
    return {
      success: false,
      messageTH: 'เกิดข้อผิดพลาดในการโหลดสถิติ',
      messageEN: 'Failed to load affiliate statistics',
      message: 'เกิดข้อผิดพลาดในการโหลดสถิติ',
    }
  }
}

export async function getMerchantAffiliates(
  storeId: string,
  params?: { search?: string; page?: number; limit?: number },
) {
  try {
    const userSession = await getCurrentUser()
    if (!userSession?.id) {
      return {
        success: false,
        messageTH: 'กรุณาเข้าสู่ระบบก่อนทำรายการ',
        messageEN: 'Please sign in to proceed',
        message: 'กรุณาเข้าสู่ระบบก่อนทำรายการ',
      }
    }

    const page = params?.page ?? 1
    const limit = params?.limit ?? 20
    const skip = (page - 1) * limit

    const where: Prisma.AffiliateAccountWhereInput = {
      storeId,
      ...(params?.search
        ? {
            OR: [
              {
                referralCode: { contains: params.search, mode: 'insensitive' },
              },
              {
                customer: {
                  OR: [
                    {
                      firstName: {
                        contains: params.search,
                        mode: 'insensitive',
                      },
                    },
                    {
                      lastName: {
                        contains: params.search,
                        mode: 'insensitive',
                      },
                    },
                    { email: { contains: params.search, mode: 'insensitive' } },
                    { phone: { contains: params.search, mode: 'insensitive' } },
                  ],
                },
              },
            ],
          }
        : {}),
    }

    const [items, totalItems] = await Promise.all([
      prisma.affiliateAccount.findMany({
        where,
        include: {
          customer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              avatar: true,
            },
          },
          _count: {
            select: { referrals: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.affiliateAccount.count({ where }),
    ])

    return {
      success: true,
      data: serializeDecimal(items),
      meta: {
        page,
        limit,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
      },
    }
  } catch (error) {
    console.error('getMerchantAffiliates error:', error)
    return {
      success: false,
      messageTH: 'เกิดข้อผิดพลาดในการโหลดรายชื่อนายหน้า',
      messageEN: 'Failed to load affiliate accounts',
      message: 'เกิดข้อผิดพลาดในการโหลดรายชื่อนายหน้า',
    }
  }
}

export async function getMerchantAffiliateReferrals(
  storeId: string,
  params?: { status?: string; page?: number; limit?: number },
) {
  try {
    const userSession = await getCurrentUser()
    if (!userSession?.id) {
      return {
        success: false,
        messageTH: 'กรุณาเข้าสู่ระบบก่อนทำรายการ',
        messageEN: 'Please sign in to proceed',
        message: 'กรุณาเข้าสู่ระบบก่อนทำรายการ',
      }
    }

    const page = params?.page ?? 1
    const limit = params?.limit ?? 20
    const skip = (page - 1) * limit

    const where: Prisma.AffiliateReferralWhereInput = {
      affiliateAccount: { storeId },
      ...(params?.status && params.status !== 'ALL'
        ? { status: params.status as AffiliateCommissionStatus }
        : {}),
    }

    const [items, totalItems] = await Promise.all([
      prisma.affiliateReferral.findMany({
        where,
        include: {
          order: {
            select: {
              id: true,
              orderNumber: true,
              status: true,
              totalAmount: true,
              createdAt: true,
            },
          },
          affiliateAccount: {
            include: {
              customer: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true,
                  phone: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.affiliateReferral.count({ where }),
    ])

    return {
      success: true,
      data: serializeDecimal(items),
      meta: {
        page,
        limit,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
      },
    }
  } catch (error) {
    console.error('getMerchantAffiliateReferrals error:', error)
    return {
      success: false,
      messageTH: 'เกิดข้อผิดพลาดในการโหลดรายการคอมมิชชั่น',
      messageEN: 'Failed to load referral commissions',
      message: 'เกิดข้อผิดพลาดในการโหลดรายการคอมมิชชั่น',
    }
  }
}

export async function getMerchantAffiliatePayouts(
  storeId: string,
  params?: { status?: string; page?: number; limit?: number },
) {
  try {
    const userSession = await getCurrentUser()
    if (!userSession?.id) {
      return {
        success: false,
        messageTH: 'กรุณาเข้าสู่ระบบก่อนทำรายการ',
        messageEN: 'Please sign in to proceed',
        message: 'กรุณาเข้าสู่ระบบก่อนทำรายการ',
      }
    }

    const page = params?.page ?? 1
    const limit = params?.limit ?? 20
    const skip = (page - 1) * limit

    const where: Prisma.AffiliatePayoutWhereInput = {
      affiliateAccount: { storeId },
      ...(params?.status && params.status !== 'ALL'
        ? { status: params.status as PayoutStatus }
        : {}),
    }

    const [items, totalItems] = await Promise.all([
      prisma.affiliatePayout.findMany({
        where,
        include: {
          affiliateAccount: {
            include: {
              customer: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true,
                  phone: true,
                  avatar: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.affiliatePayout.count({ where }),
    ])

    return {
      success: true,
      data: serializeDecimal(items),
      meta: {
        page,
        limit,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
      },
    }
  } catch (error) {
    console.error('getMerchantAffiliatePayouts error:', error)
    return {
      success: false,
      messageTH: 'เกิดข้อผิดพลาดในการโหลดคำขอเบิกเงิน',
      messageEN: 'Failed to load payout requests',
      message: 'เกิดข้อผิดพลาดในการโหลดคำขอเบิกเงิน',
    }
  }
}

export async function processAffiliatePayout(
  payoutId: string,
  input: {
    status: 'PAID' | 'REJECTED'
    paymentProof?: string
    note?: string
  },
) {
  try {
    const userSession = await getCurrentUser()
    if (!userSession?.id) {
      return {
        success: false,
        messageTH: 'กรุณาเข้าสู่ระบบก่อนทำรายการ',
        messageEN: 'Please sign in to proceed',
        message: 'กรุณาเข้าสู่ระบบก่อนทำรายการ',
      }
    }

    const payout = await prisma.affiliatePayout.findUnique({
      where: { id: payoutId },
      include: { affiliateAccount: true },
    })

    if (!payout) {
      return {
        success: false,
        messageTH: 'ไม่พบคำขอเบิกเงินนี้',
        messageEN: 'Payout request not found',
        message: 'ไม่พบคำขอเบิกเงินนี้',
      }
    }

    if (payout.status !== PayoutStatus.PENDING) {
      return {
        success: false,
        messageTH: 'คำขอนี้ได้รับการประมวลผลไปแล้ว',
        messageEN: 'This payout request has already been processed',
        message: 'คำขอนี้ได้รับการประมวลผลไปแล้ว',
      }
    }

    await prisma.$transaction(async (tx) => {
      if (input.status === 'PAID') {
        await tx.affiliatePayout.update({
          where: { id: payoutId },
          data: {
            status: PayoutStatus.PAID,
            paidAt: new Date(),
            paymentProof: input.paymentProof,
            note: input.note,
          },
        })

        await tx.affiliateAccount.update({
          where: { id: payout.affiliateAccountId },
          data: {
            totalWithdrawn: {
              increment: payout.amount,
            },
          },
        })
      } else {
        // REJECTED - refund money back to available balance
        await tx.affiliatePayout.update({
          where: { id: payoutId },
          data: {
            status: PayoutStatus.REJECTED,
            note: input.note,
          },
        })

        await tx.affiliateAccount.update({
          where: { id: payout.affiliateAccountId },
          data: {
            balance: {
              increment: payout.amount,
            },
          },
        })
      }
    })

    const messageTH =
      input.status === 'PAID'
        ? 'อนุมัติและบันทึกการโอนเงินเรียบร้อยแล้ว'
        : 'ปฏิเสธคำขอและคืนยอดเงินเข้าบัญชีนายหน้าแล้ว'

    const messageEN =
      input.status === 'PAID'
        ? 'Payout approved and transfer recorded successfully'
        : 'Payout rejected and amount refunded to affiliate balance'

    return {
      success: true,
      messageTH,
      messageEN,
      message: messageTH,
    }
  } catch (error) {
    console.error('processAffiliatePayout error:', error)
    return {
      success: false,
      messageTH: 'เกิดข้อผิดพลาดในการประมวลผลคำขอ',
      messageEN: 'Failed to process payout request',
      message: 'เกิดข้อผิดพลาดในการประมวลผลคำขอ',
    }
  }
}

export async function updateAffiliateReferralStatus(
  referralId: string,
  status: 'APPROVED' | 'REJECTED',
) {
  try {
    const userSession = await getCurrentUser()
    if (!userSession?.id) {
      return {
        success: false,
        messageTH: 'กรุณาเข้าสู่ระบบก่อนทำรายการ',
        messageEN: 'Please sign in to proceed',
        message: 'กรุณาเข้าสู่ระบบก่อนทำรายการ',
      }
    }

    const referral = await prisma.affiliateReferral.findUnique({
      where: { id: referralId },
      include: { affiliateAccount: true },
    })

    if (!referral) {
      return {
        success: false,
        messageTH: 'ไม่พบรายการคอมมิชชั่นนี้',
        messageEN: 'Commission record not found',
        message: 'ไม่พบรายการคอมมิชชั่นนี้',
      }
    }

    if (referral.status !== AffiliateCommissionStatus.PENDING) {
      return {
        success: false,
        messageTH: 'รายการนี้ได้รับการอนุมัติหรือปฏิเสธไปแล้ว',
        messageEN: 'This commission has already been processed',
        message: 'รายการนี้ได้รับการอนุมัติหรือปฏิเสธไปแล้ว',
      }
    }

    await prisma.$transaction(async (tx) => {
      if (status === 'APPROVED') {
        await tx.affiliateReferral.update({
          where: { id: referralId },
          data: {
            status: AffiliateCommissionStatus.APPROVED,
            approvedAt: new Date(),
          },
        })

        await tx.affiliateAccount.update({
          where: { id: referral.affiliateAccountId },
          data: {
            balance: { increment: referral.commissionAmount },
            totalEarned: { increment: referral.commissionAmount },
          },
        })
      } else {
        await tx.affiliateReferral.update({
          where: { id: referralId },
          data: {
            status: AffiliateCommissionStatus.REJECTED,
          },
        })
      }
    })

    const messageTH =
      status === 'APPROVED'
        ? 'อนุมัติค่าคอมมิชชั่นเรียบร้อยแล้ว ยอดเงินเข้าบัญชีนายหน้าแล้ว'
        : 'ปฏิเสธค่าคอมมิชชั่นเรียบร้อยแล้ว'

    const messageEN =
      status === 'APPROVED'
        ? 'Commission approved and credited to affiliate balance'
        : 'Commission rejected successfully'

    return {
      success: true,
      messageTH,
      messageEN,
      message: messageTH,
    }
  } catch (error) {
    console.error('updateAffiliateReferralStatus error:', error)
    return {
      success: false,
      messageTH: 'เกิดข้อผิดพลาดในการอัปเดตสถานะ',
      messageEN: 'Failed to update commission status',
      message: 'เกิดข้อผิดพลาดในการอัปเดตสถานะ',
    }
  }
}
