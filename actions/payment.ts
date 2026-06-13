'use server'

import { ActorType, LogAction, Prisma } from '@/generated/prisma/client'
import { BankAccountFormValues, PaymentSettingFormValues } from '@/zod/payment'

import { createLog } from '@/lib/activity-log'
import { prisma } from '@/lib/prisma'

const paymentSettingSelect = {
  isBankTransferEnabled: true,
  isStripeEnabled: true,
  stripeSecretKey: true,
  stripePublicKey: true,
  bankAccounts: {
    select: {
      id: true,
      bankName: true,
      accountNumber: true,
      accountName: true,
      qrImage: true,
      isDefault: true,
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

  return await prisma.paymentSetting.findUnique({
    where: { storeId },
    select: paymentSettingSelect,
  })
}

export async function upsertPaymentSetting(
  storeId: string,
  data: PaymentSettingFormValues,
) {
  try {
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
    const setting = await prisma.paymentSetting.upsert({
      where: { storeId },
      create: { storeId },
      update: {},
      select: { id: true },
    })

    if (data.isDefault) {
      await prisma.bankAccount.updateMany({
        where: { paymentSettingId: setting.id },
        data: { isDefault: false },
      })
    }

    const account = await prisma.bankAccount.create({
      data: { ...data, paymentSettingId: setting.id },
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

    const account = await prisma.bankAccount.findUnique({
      where: { id },
      select: {
        paymentSettingId: true,
        paymentSetting: { select: { storeId: true } },
      },
    })

    if (data.isDefault && account) {
      await prisma.bankAccount.updateMany({
        where: { paymentSettingId: account.paymentSettingId },
        data: { isDefault: false },
      })
    }

    const updatedAccount = await prisma.bankAccount.update({
      where: { id },
      data,
    })

    await createLog({
      action: LogAction.UPDATE_STORE_SETTING,
      actorType: ActorType.MERCHANT,
      storeId: account?.paymentSetting.storeId,
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

    const account = await prisma.bankAccount.findUnique({
      where: { id },
      select: { paymentSetting: { select: { storeId: true } } },
    })

    await prisma.bankAccount.delete({ where: { id } })

    await createLog({
      action: LogAction.UPDATE_STORE_SETTING,
      actorType: ActorType.MERCHANT,
      storeId: account?.paymentSetting.storeId,
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
