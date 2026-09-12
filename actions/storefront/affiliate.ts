'use server'

import {
  SERVER_ERROR_MESSAGE_EN,
  SERVER_ERROR_MESSAGE_TH,
} from '@/constants/system'
import {
  AffiliateCommissionStatus,
  PayoutStatus,
} from '@/generated/prisma/client'
import { serializeDecimal } from '@/utils/decimal'

import { getCurrentUser } from '@/lib/auth-server'
import { prisma } from '@/lib/prisma'

function generateReferralCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = 'REF-'
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

async function getOrCreateCustomer(userSession: {
  id: string
  email?: string | null
  name?: string | null
  phone?: string | null
}) {
  if (!userSession?.id) return null
  let customer = await prisma.customer.findUnique({
    where: { userId: userSession.id },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      phone: true,
      email: true,
    },
  })

  if (!customer && userSession.email) {
    customer = await prisma.customer.findUnique({
      where: { email: userSession.email },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        phone: true,
        email: true,
      },
    })

    if (customer) {
      customer = await prisma.customer.update({
        where: { id: customer.id },
        data: { userId: userSession.id },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phone: true,
          email: true,
        },
      })
    } else {
      customer = await prisma.customer.create({
        data: {
          userId: userSession.id,
          email: userSession.email,
          firstName: userSession.name?.split(' ')[0] || '',
          lastName: userSession.name?.split(' ').slice(1).join(' ') || '',
          phone: userSession.phone ?? undefined,
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phone: true,
          email: true,
        },
      })
    }
  }
  return customer
}

export async function getOrCreateCustomerAffiliateAccount(storeSlug: string) {
  try {
    const userSession = await getCurrentUser()
    const userId = userSession?.id
    if (!userId) {
      return {
        success: false,
        messageTH: 'กรุณาเข้าสู่ระบบก่อนทำรายการ',
        messageEN: 'Please sign in to proceed',
        message: 'กรุณาเข้าสู่ระบบก่อนทำรายการ',
      }
    }

    const [customer, store] = await Promise.all([
      getOrCreateCustomer(userSession),
      prisma.store.findUnique({
        where: { slug: storeSlug },
        select: {
          id: true,
          slug: true,
          name: true,
          affiliateSetting: true,
        },
      }),
    ])

    if (!customer) {
      return {
        success: false,
        messageTH: 'ไม่พบข้อมูลลูกค้า',
        messageEN: 'Customer data not found',
        message: 'ไม่พบข้อมูลลูกค้า',
      }
    }

    if (!store) {
      return {
        success: false,
        messageTH: 'ไม่พบข้อมูลร้านค้า',
        messageEN: 'Store not found',
        message: 'ไม่พบข้อมูลร้านค้า',
      }
    }

    let account = await prisma.affiliateAccount.findUnique({
      where: {
        storeId_customerId: {
          storeId: store.id,
          customerId: customer.id,
        },
      },
    })

    if (!account) {
      let referralCode = generateReferralCode()
      let isUnique = false
      let attempts = 0
      while (!isUnique && attempts < 5) {
        const existing = await prisma.affiliateAccount.findUnique({
          where: {
            storeId_referralCode: {
              storeId: store.id,
              referralCode,
            },
          },
        })
        if (!existing) {
          isUnique = true
        } else {
          referralCode = generateReferralCode()
          attempts++
        }
      }

      account = await prisma.affiliateAccount.create({
        data: {
          storeId: store.id,
          customerId: customer.id,
          referralCode,
          balance: 0,
          totalEarned: 0,
          totalWithdrawn: 0,
          bankAccountName:
            `${customer.firstName ?? ''} ${customer.lastName ?? ''}`.trim(),
          promptPayNumber: customer.phone ?? undefined,
        },
      })
    }

    return {
      success: true,
      data: {
        account: serializeDecimal(account),
        setting: store.affiliateSetting
          ? serializeDecimal(store.affiliateSetting)
          : null,
        storeSlug: store.slug,
      },
    }
  } catch (error) {
    console.error('getOrCreateCustomerAffiliateAccount error:', error)
    return {
      success: false,
      messageTH: 'เกิดข้อผิดพลาดในการโหลดข้อมูลนายหน้า',
      messageEN: 'Failed to load affiliate account',
      message: 'เกิดข้อผิดพลาดในการโหลดข้อมูลนายหน้า',
    }
  }
}

export async function getCustomerAffiliateDashboard(storeSlug: string) {
  try {
    const store = await prisma.store.findUnique({
      where: { slug: storeSlug },
      select: {
        id: true,
        slug: true,
        name: true,
        affiliateSetting: true,
      },
    })

    if (!store) {
      return {
        success: false,
        messageTH: 'ไม่พบข้อมูลร้านค้า',
        messageEN: 'Store not found',
        message: 'ไม่พบข้อมูลร้านค้า',
      }
    }

    const isEnabled = store.affiliateSetting?.isEnabled ?? false
    if (!isEnabled) {
      return {
        success: true,
        data: {
          isEnabled: false,
          isAuthenticated: true,
          setting: store.affiliateSetting
            ? serializeDecimal(store.affiliateSetting)
            : null,
          storeSlug: store.slug,
        },
      }
    }

    const userSession = await getCurrentUser()
    if (!userSession?.id) {
      return {
        success: true,
        data: {
          isEnabled: true,
          isAuthenticated: false,
          setting: store.affiliateSetting
            ? serializeDecimal(store.affiliateSetting)
            : null,
          storeSlug: store.slug,
        },
      }
    }

    const customer = await getOrCreateCustomer(userSession)
    if (!customer) {
      return {
        success: true,
        data: {
          isEnabled: true,
          isAuthenticated: false,
          setting: store.affiliateSetting
            ? serializeDecimal(store.affiliateSetting)
            : null,
          storeSlug: store.slug,
        },
      }
    }

    let account = await prisma.affiliateAccount.findUnique({
      where: {
        storeId_customerId: {
          storeId: store.id,
          customerId: customer.id,
        },
      },
    })

    if (!account) {
      const initResult = await getOrCreateCustomerAffiliateAccount(storeSlug)
      if (!initResult.success || !initResult.data) {
        return {
          success: false,
          messageTH: 'ไม่สามารถสร้างบัญชีนายหน้าได้',
          messageEN: 'Failed to create affiliate account',
          message: 'ไม่สามารถสร้างบัญชีนายหน้าได้',
        }
      }
      account = initResult.data.account as any
    }

    const [referrals, payouts, pendingReferrals] = await Promise.all([
      prisma.affiliateReferral.findMany({
        where: { affiliateAccountId: account!.id },
        include: {
          order: {
            select: {
              id: true,
              orderNumber: true,
              status: true,
              createdAt: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
      prisma.affiliatePayout.findMany({
        where: { affiliateAccountId: account!.id },
        orderBy: { createdAt: 'desc' },
        take: 30,
      }),
      prisma.affiliateReferral.aggregate({
        where: {
          affiliateAccountId: account!.id,
          status: AffiliateCommissionStatus.PENDING,
        },
        _sum: { commissionAmount: true },
      }),
    ])

    const pendingCommission = Number(
      pendingReferrals._sum.commissionAmount ?? 0,
    )

    return {
      success: true,
      data: {
        isEnabled: true,
        isAuthenticated: true,
        account: serializeDecimal(account),
        setting: store.affiliateSetting
          ? serializeDecimal(store.affiliateSetting)
          : null,
        stats: {
          availableBalance: Number(account!.balance),
          pendingCommission,
          totalEarned: Number(account!.totalEarned),
          totalWithdrawn: Number(account!.totalWithdrawn),
          totalReferralsCount: referrals.length,
        },
        referrals: serializeDecimal(referrals),
        payouts: serializeDecimal(payouts),
      },
    }
  } catch (error) {
    console.error('getCustomerAffiliateDashboard error:', error)
    return {
      success: false,
      messageTH: SERVER_ERROR_MESSAGE_TH,
      messageEN: SERVER_ERROR_MESSAGE_EN,
      message: SERVER_ERROR_MESSAGE_TH,
    }
  }
}

export async function requestAffiliatePayout(
  storeSlug: string,
  input: {
    amount: number
    bankName?: string
    bankAccountNo?: string
    bankAccountName?: string
    promptPayNumber?: string
  },
) {
  try {
    const userSession = await getCurrentUser()
    const userId = userSession?.id
    if (!userId) {
      return {
        success: false,
        messageTH: 'กรุณาเข้าสู่ระบบก่อนทำรายการ',
        messageEN: 'Please sign in to proceed',
        message: 'กรุณาเข้าสู่ระบบก่อนทำรายการ',
      }
    }

    const [customer, store] = await Promise.all([
      getOrCreateCustomer(userSession),
      prisma.store.findUnique({
        where: { slug: storeSlug },
        select: { id: true, affiliateSetting: true },
      }),
    ])

    if (!customer || !store) {
      return {
        success: false,
        messageTH: 'ไม่พบข้อมูลลูกค้าหรือร้านค้า',
        messageEN: 'Customer or store not found',
        message: 'ไม่พบข้อมูลลูกค้าหรือร้านค้า',
      }
    }

    const minAmount = Number(store.affiliateSetting?.minWithdrawalAmount ?? 100)
    if (input.amount < minAmount) {
      return {
        success: false,
        messageTH: `ยอดถอนขั้นต่ำคือ ฿${minAmount}`,
        messageEN: `Minimum withdrawal amount is ฿${minAmount}`,
        message: `ยอดถอนขั้นต่ำคือ ฿${minAmount}`,
      }
    }

    const account = await prisma.affiliateAccount.findUnique({
      where: {
        storeId_customerId: {
          storeId: store.id,
          customerId: customer.id,
        },
      },
    })

    if (!account) {
      return {
        success: false,
        messageTH: 'ไม่พบบัญชีนายหน้าของคุณ',
        messageEN: 'Affiliate account not found',
        message: 'ไม่พบบัญชีนายหน้าของคุณ',
      }
    }

    const availableBalance = Number(account.balance)
    if (availableBalance < input.amount) {
      return {
        success: false,
        messageTH: 'ยอดเงินคงเหลือไม่เพียงพอสำหรับการถอน',
        messageEN: 'Insufficient balance for payout request',
        message: 'ยอดเงินคงเหลือไม่เพียงพอสำหรับการถอน',
      }
    }

    // Check if there is already a pending payout request
    const pendingExisting = await prisma.affiliatePayout.findFirst({
      where: {
        affiliateAccountId: account.id,
        status: PayoutStatus.PENDING,
      },
    })
    if (pendingExisting) {
      return {
        success: false,
        messageTH:
          'คุณมีคำขอถอนเงินที่รอการอนุมัติอยู่แล้ว โปรดรอร้านค้าดำเนินการ',
        messageEN:
          'You already have a pending payout request. Please wait for store approval.',
        message:
          'คุณมีคำขอถอนเงินที่รอการอนุมัติอยู่แล้ว โปรดรอร้านค้าดำเนินการ',
      }
    }

    await prisma.$transaction(async (tx) => {
      // Deduct available balance
      await tx.affiliateAccount.update({
        where: { id: account.id },
        data: {
          balance: { decrement: input.amount },
          bankName: input.bankName || account.bankName,
          bankAccountNo: input.bankAccountNo || account.bankAccountNo,
          bankAccountName: input.bankAccountName || account.bankAccountName,
          promptPayNumber: input.promptPayNumber || account.promptPayNumber,
        },
      })

      // Create payout request
      await tx.affiliatePayout.create({
        data: {
          affiliateAccountId: account.id,
          amount: input.amount,
          status: PayoutStatus.PENDING,
          bankName: input.bankName || account.bankName,
          bankAccountNo: input.bankAccountNo || account.bankAccountNo,
          bankAccountName: input.bankAccountName || account.bankAccountName,
          promptPayNumber: input.promptPayNumber || account.promptPayNumber,
        },
      })
    })

    return {
      success: true,
      messageTH:
        'ส่งคำขอเบิกเงินเรียบร้อยแล้ว ร้านค้าจะตรวจสอบและโอนเงินให้คุณ',
      messageEN:
        'Payout request submitted successfully. The store will verify and process the transfer.',
      message: 'ส่งคำขอเบิกเงินเรียบร้อยแล้ว ร้านค้าจะตรวจสอบและโอนเงินให้คุณ',
    }
  } catch (error) {
    console.error('requestAffiliatePayout error:', error)
    return {
      success: false,
      messageTH: 'เกิดข้อผิดพลาดในการยื่นคำขอเบิกเงิน',
      messageEN: 'Failed to submit payout request',
      message: 'เกิดข้อผิดพลาดในการยื่นคำขอเบิกเงิน',
    }
  }
}

export async function updateCustomerAffiliateBank(
  storeSlug: string,
  input: {
    bankName?: string
    bankAccountNo?: string
    bankAccountName?: string
    promptPayNumber?: string
  },
) {
  try {
    const userSession = await getCurrentUser()
    const userId = userSession?.id
    if (!userId) {
      return {
        success: false,
        messageTH: 'กรุณาเข้าสู่ระบบก่อนทำรายการ',
        messageEN: 'Please sign in to proceed',
        message: 'กรุณาเข้าสู่ระบบก่อนทำรายการ',
      }
    }

    const [customer, store] = await Promise.all([
      getOrCreateCustomer(userSession),
      prisma.store.findUnique({
        where: { slug: storeSlug },
        select: { id: true },
      }),
    ])

    if (!customer || !store) {
      return {
        success: false,
        messageTH: 'ไม่พบข้อมูลลูกค้าหรือร้านค้า',
        messageEN: 'Customer or store not found',
        message: 'ไม่พบข้อมูลลูกค้าหรือร้านค้า',
      }
    }

    await prisma.affiliateAccount.update({
      where: {
        storeId_customerId: {
          storeId: store.id,
          customerId: customer.id,
        },
      },
      data: {
        bankName: input.bankName,
        bankAccountNo: input.bankAccountNo,
        bankAccountName: input.bankAccountName,
        promptPayNumber: input.promptPayNumber,
      },
    })

    return {
      success: true,
      messageTH: 'บันทึกข้อมูลบัญชีรับเงินเรียบร้อยแล้ว',
      messageEN: 'Payout account updated successfully',
      message: 'บันทึกข้อมูลบัญชีรับเงินเรียบร้อยแล้ว',
    }
  } catch (error) {
    console.error('updateCustomerAffiliateBank error:', error)
    return {
      success: false,
      messageTH: 'เกิดข้อผิดพลาดในการบันทึกบัญชี',
      messageEN: 'Failed to update payout account',
      message: 'เกิดข้อผิดพลาดในการบันทึกบัญชี',
    }
  }
}

export async function getStorefrontAffiliateProducts(
  storeSlug: string,
  search?: string,
) {
  try {
    const store = await prisma.store.findUnique({
      where: { slug: storeSlug },
      select: { id: true },
    })

    if (!store) {
      return { success: false, data: [] }
    }

    const products = await prisma.product.findMany({
      where: {
        storeId: store.id,
        isPublished: true,
        ...(search ? { title: { contains: search, mode: 'insensitive' } } : {}),
      },
      select: {
        id: true,
        title: true,
        slug: true,
        images: {
          select: { url: true, isPrimary: true },
          take: 1,
        },
        variants: {
          select: { price: true },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    })

    return {
      success: true,
      data: serializeDecimal(products),
    }
  } catch (error) {
    console.error('getStorefrontAffiliateProducts error:', error)
    return { success: false, data: [] }
  }
}
