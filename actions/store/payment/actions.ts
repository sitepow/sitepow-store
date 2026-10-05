'use server'

import { ActorType, LogAction, Prisma } from '@/generated/prisma/client'
import { BankAccountFormValues, PaymentSettingFormValues } from '@/zod/store/payment-settings'

import { createLog } from '@/lib/activity/log'
import { getCurrentUser } from '@/lib/auth/server'
import { verifyEmployeePermission } from '@/lib/auth/permission'
import { prisma } from '@/lib/db/prisma'

const paymentSettingSelect = {
  isBankTransferEnabled: true,
  isStripeEnabled: true,
  stripeSecretKey: true,
  stripeWebhookSecret: true,
  bankAccounts: {
    select: {
      id: true,
      bankName: true,
      accountNumber: true,
      accountName: true,
      qrImage: true,
      isDefault: true,
      type: true,
      promptPayId: true,
    },
    orderBy: { isDefault: 'desc' } as const,
  },
} satisfies Prisma.PaymentSettingSelect

export type PaymentSettingPayload = Prisma.PaymentSettingGetPayload<{
  select: typeof paymentSettingSelect
}>

export async function getPaymentSetting(
  storeId: string,
): Promise<PaymentSettingPayload | null> {
  if (!storeId) {
    return null
  }

  try {
    const userSession = await getCurrentUser()
    const userId = userSession?.id

    if (!userId) {
      return null
    }

    const authCheck = await verifyEmployeePermission({
      userId,
      storeId,
      permission: 'canViewPayment',
    })

    if (!authCheck.isAuthorized) {
      return null
    }

    return await prisma.paymentSetting.findUnique({
      where: { storeId },
      select: paymentSettingSelect,
    })
  } catch {
    return null
  }
}

export async function upsertPaymentSetting(
  storeId: string,
  data: PaymentSettingFormValues,
) {
  try {
    const userSession = await getCurrentUser()
    const userId = userSession?.id

    if (!userId) {
      return { success: false, message: 'กรุณาเข้าสู่ระบบก่อนทำรายการ' }
    }

    const authCheck = await verifyEmployeePermission({
      userId,
      storeId,
      permission: 'canUpdatePayment',
    })

    if (!authCheck.isAuthorized) {
      return {
        success: false,
        message: authCheck.message || 'สิทธิ์การใช้งานของคุณไม่เพียงพอ',
      }
    }

    const setting = await prisma.paymentSetting.upsert({
      where: { storeId },
      create: { storeId, ...data },
      update: data,
      select: paymentSettingSelect,
    })

    await createLog({
      action: LogAction.UPDATE_STORE_SETTING,
      actorType: ActorType.MERCHANT,
      storeId,
      entity: 'PaymentSetting',
      entityId: storeId,
      details: {
        summary: 'แก้ไขการตั้งค่าการชำระเงินของร้านค้า',
        setting: 'payment',
        updatedFields: Object.keys(data),
      },
    })

    return {
      success: true,
      message: 'บันทึกการตั้งค่าการชำระเงินสำเร็จแล้ว',
      data: setting,
    }
  } catch (error) {
    console.error(error)
    return { success: false }
  }
}

export async function createBankAccount(
  storeId: string,
  data: BankAccountFormValues,
) {
  try {
    const userSession = await getCurrentUser()
    const userId = userSession?.id

    if (!userId) {
      return { success: false, message: 'กรุณาเข้าสู่ระบบก่อนทำรายการ' }
    }

    const authCheck = await verifyEmployeePermission({
      userId,
      storeId,
      permission: 'canCreatePayment',
    })

    if (!authCheck.isAuthorized) {
      return {
        success: false,
        message: authCheck.message || 'สิทธิ์การใช้งานของคุณไม่เพียงพอ',
      }
    }

    const setting = await prisma.paymentSetting.upsert({
      where: { storeId },
      create: { storeId },
      update: {},
      select: { id: true },
    })

    const account = await prisma.$transaction(async (tx) => {
      if (data.isDefault) {
        await tx.bankAccount.updateMany({
          where: { paymentSettingId: setting.id },
          data: { isDefault: false },
        })
      }

      return await tx.bankAccount.create({
        data: {
          ...data,
          paymentSettingId: setting.id,
          accountNumber: data.accountNumber ?? '',
          promptPayId: data.promptPayId ?? '',
        },
      })
    })

    await createLog({
      action: LogAction.UPDATE_STORE_SETTING,
      actorType: ActorType.MERCHANT,
      storeId,
      entity: 'BankAccount',
      entityId: account.id,
      details: {
        summary: `เพิ่มบัญชีธนาคาร ${data.bankName} (${data.accountNumber || data.promptPayId || ''})`,
        setting: 'bank_account',
        bankName: data.bankName,
        accountNumber: data.accountNumber,
        promptPayId: data.promptPayId,
        type: 'created',
      },
    })

    return { success: true, message: 'เพิ่มบัญชีธนาคารสำเร็จ', data: account }
  } catch (error) {
    console.error(error)
    return { success: false }
  }
}

export async function updateBankAccount(
  id: string,
  data: BankAccountFormValues,
) {
  try {
    if (!id) {
      return { success: false, message: 'ไม่พบบัญชีธนาคาร' }
    }

    const userSession = await getCurrentUser()
    const userId = userSession?.id

    if (!userId) {
      return { success: false, message: 'กรุณาเข้าสู่ระบบก่อนทำรายการ' }
    }

    const account = await prisma.bankAccount.findUnique({
      where: { id },
      select: {
        bankName: true,
        accountNumber: true,
        promptPayId: true,
        paymentSettingId: true,
        paymentSetting: { select: { storeId: true } },
      },
    })

    if (!account) {
      return { success: false, message: 'ไม่พบบัญชีธนาคาร' }
    }

    const authCheck = await verifyEmployeePermission({
      userId,
      storeId: account.paymentSetting.storeId,
      permission: 'canUpdatePayment',
    })

    if (!authCheck.isAuthorized) {
      return {
        success: false,
        message: authCheck.message || 'สิทธิ์การใช้งานของคุณไม่เพียงพอ',
      }
    }

    const updatedAccount = await prisma.$transaction(async (tx) => {
      if (data.isDefault) {
        await tx.bankAccount.updateMany({
          where: {
            paymentSettingId: account.paymentSettingId,
            id: { not: id },
          },
          data: { isDefault: false },
        })
      }

      return await tx.bankAccount.update({
        where: { id },
        data,
      })
    })

    await createLog({
      action: LogAction.UPDATE_STORE_SETTING,
      actorType: ActorType.MERCHANT,
      storeId: account.paymentSetting.storeId,
      entity: 'BankAccount',
      entityId: id,
      details: {
        summary: `แก้ไขข้อมูลบัญชีธนาคาร ${account.bankName} (${account.accountNumber || account.promptPayId || ''})`,
        setting: 'bank_account',
        bankName: account.bankName,
        type: 'updated',
      },
    })

    return {
      success: true,
      message: 'แก้ไขบัญชีธนาคารสำเร็จ',
      data: updatedAccount,
    }
  } catch (error) {
    console.error(error)
    return { success: false }
  }
}

export async function deleteBankAccount(id: string) {
  try {
    if (!id) {
      return { success: false, message: 'ไม่พบบัญชีธนาคาร' }
    }

    const userSession = await getCurrentUser()
    const userId = userSession?.id

    if (!userId) {
      return { success: false, message: 'กรุณาเข้าสู่ระบบก่อนทำรายการ' }
    }

    const account = await prisma.bankAccount.findUnique({
      where: { id },
      select: {
        bankName: true,
        accountNumber: true,
        paymentSetting: { select: { storeId: true } },
      },
    })

    if (!account) {
      return { success: false, message: 'ไม่พบบัญชีธนาคาร' }
    }

    const authCheck = await verifyEmployeePermission({
      userId,
      storeId: account.paymentSetting.storeId,
      permission: 'canDeletePayment',
    })

    if (!authCheck.isAuthorized) {
      return {
        success: false,
        message: authCheck.message || 'สิทธิ์การใช้งานของคุณไม่เพียงพอ',
      }
    }

    await prisma.bankAccount.delete({ where: { id } })

    await createLog({
      action: LogAction.UPDATE_STORE_SETTING,
      actorType: ActorType.MERCHANT,
      storeId: account.paymentSetting.storeId,
      entity: 'BankAccount',
      entityId: id,
      details: {
        summary: `ลบบัญชีธนาคาร ${account.bankName} (${account.accountNumber || ''})`,
        setting: 'bank_account',
        bankName: account.bankName,
        accountNumber: account.accountNumber,
        type: 'deleted',
      },
    })

    return { success: true, message: 'ลบบัญชีธนาคารสำเร็จ' }
  } catch (error) {
    console.error(error)
    return { success: false }
  }
}

export async function getBankAccount(id: string) {
  try {
    if (!id) {
      return null
    }

    const userSession = await getCurrentUser()
    const userId = userSession?.id

    if (!userId) {
      return null
    }

    const account = await prisma.bankAccount.findUnique({
      where: { id },
      select: {
        id: true,
        type: true,
        bankName: true,
        accountNumber: true,
        accountName: true,
        promptPayId: true,
        qrImage: true,
        isDefault: true,
        paymentSetting: { select: { storeId: true } },
      },
    })

    if (!account) {
      return null
    }

    const authCheck = await verifyEmployeePermission({
      userId,
      storeId: account.paymentSetting.storeId,
      permission: 'canViewPayment',
    })

    if (!authCheck.isAuthorized) {
      return null
    }

    return account
  } catch (error) {
    console.error(error)
    return null
  }
}

export async function checkPaymentSettingStatus(
  storeId: string,
): Promise<boolean> {
  if (!storeId) {
    return false
  }

  try {
    const setting = await prisma.paymentSetting.findUnique({
      where: { storeId },
      select: {
        isStripeEnabled: true,
        stripeSecretKey: true,
      },
    })

    return Boolean(setting?.isStripeEnabled && setting?.stripeSecretKey)
  } catch (error) {
    console.error(error)
    return false
  }
}
