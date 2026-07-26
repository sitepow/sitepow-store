'use server'

import { ActorType, LogAction, Prisma } from '@/generated/prisma/client'
import { BankAccountFormValues, PaymentSettingFormValues } from '@/zod/payment'

import { createLog } from '@/lib/activity-log'
import { auth } from '@/lib/auth'
import { verifyEmployeePermission } from '@/lib/permission'
import { prisma } from '@/lib/prisma'

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
    const session = await auth()
    const userId = session?.user?.id

    if (!userId) {
      return null
    }

    const authCheck = await verifyEmployeePermission({
      userId,
      storeId,
      permission: 'canManageStoreSettings',
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
    const session = await auth()
    const userId = session?.user?.id

    if (!userId) {
      return { success: false, message: 'กรุณาเข้าสู่ระบบก่อนทำรายการ' }
    }

    const authCheck = await verifyEmployeePermission({
      userId,
      storeId,
      permission: 'canManageStoreSettings',
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
      details: { setting: 'payment', updatedFields: Object.keys(data) },
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
    const session = await auth()
    const userId = session?.user?.id

    if (!userId) {
      return { success: false, message: 'กรุณาเข้าสู่ระบบก่อนทำรายการ' }
    }

    const authCheck = await verifyEmployeePermission({
      userId,
      storeId,
      permission: 'canManageStoreSettings',
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
        setting: 'bank_account',
        bankName: data.bankName,
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

    const session = await auth()
    const userId = session?.user?.id

    if (!userId) {
      return { success: false, message: 'กรุณาเข้าสู่ระบบก่อนทำรายการ' }
    }

    const account = await prisma.bankAccount.findUnique({
      where: { id },
      select: {
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
      permission: 'canManageStoreSettings',
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
      details: { setting: 'bank_account', type: 'updated' },
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

    const session = await auth()
    const userId = session?.user?.id

    if (!userId) {
      return { success: false, message: 'กรุณาเข้าสู่ระบบก่อนทำรายการ' }
    }

    const account = await prisma.bankAccount.findUnique({
      where: { id },
      select: { paymentSetting: { select: { storeId: true } } },
    })

    if (!account) {
      return { success: false, message: 'ไม่พบบัญชีธนาคาร' }
    }

    const authCheck = await verifyEmployeePermission({
      userId,
      storeId: account.paymentSetting.storeId,
      permission: 'canManageStoreSettings',
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
      details: { setting: 'bank_account', type: 'deleted' },
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

    const session = await auth()
    const userId = session?.user?.id

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
      permission: 'canManageStoreSettings',
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
