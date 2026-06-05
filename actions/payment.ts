'use server'

import { Prisma } from '@/generated/prisma/client'
import { BankAccountFormValues, PaymentSettingFormValues } from '@/zod/payment'

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
    return await prisma.paymentSetting.upsert({
      where: { storeId },
      create: { storeId, ...data },
      update: data,
      select: paymentSettingSelect,
    })
  } catch {
    throw new Error('ไม่สามารถบันทึกการตั้งค่าการชำระเงินได้')
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

    return await prisma.bankAccount.create({
      data: { ...data, paymentSettingId: setting.id },
    })
  } catch {
    throw new Error('ไม่สามารถเพิ่มบัญชีธนาคารได้')
  }
}

export async function updateBankAccount(
  id: string,
  data: BankAccountFormValues,
) {
  if (!id) {
    throw new Error('ไม่พบบัญชีธนาคาร')
  }
  try {
    if (data.isDefault) {
      const account = await prisma.bankAccount.findUnique({
        where: { id },
        select: { paymentSettingId: true },
      })
      if (account) {
        await prisma.bankAccount.updateMany({
          where: { paymentSettingId: account.paymentSettingId },
          data: { isDefault: false },
        })
      }
    }

    return await prisma.bankAccount.update({
      where: { id },
      data,
    })
  } catch {
    throw new Error('ไม่สามารถแก้ไขบัญชีธนาคารได้')
  }
}

export async function deleteBankAccount(id: string) {
  if (!id) {
    throw new Error('ไม่พบบัญชีธนาคาร')
  }

  try {
    await prisma.bankAccount.delete({ where: { id } })
    return { message: 'ลบบัญชีธนาคารสำเร็จ' }
  } catch {
    throw new Error('ไม่สามารถลบบัญชีธนาคารได้')
  }
}
