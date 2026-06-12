'use server'

import { Prisma } from '@/generated/prisma/client'

import { prisma } from '@/lib/prisma'

const storefrontPaymentSelect = {
  isBankTransferEnabled: true,
  isStripeEnabled: true,
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

export type StorefrontPaymentOption = Prisma.PaymentSettingGetPayload<{
  select: typeof storefrontPaymentSelect
}>

export async function getStorefrontPaymentOptions(storeSlug: string) {
  try {
    const store = await prisma.store.findUnique({
      where: { slug: storeSlug },
      select: { id: true },
    })

    if (!store) {
      return null
    }

    return await prisma.paymentSetting.findUnique({
      where: { storeId: store.id },
      select: storefrontPaymentSelect,
    })
  } catch {
    return null
  }
}
