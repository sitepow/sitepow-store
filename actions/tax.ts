'use server'

import { serializeDecimal } from '@/utils/decimal'
import { TaxSettingFormValues } from '@/zod/tax'

import { prisma } from '@/lib/prisma'

export async function getTaxSetting(storeId: string) {
  return serializeDecimal(
    await prisma.store.findUnique({
      where: { id: storeId },
      select: { isVatRegistered: true, taxId: true, vatRate: true },
    }),
  )
}

export async function updateTaxSetting(
  storeId: string,
  data: TaxSettingFormValues,
) {
  try {
    const result = await prisma.store.update({
      where: { id: storeId },
      data: {
        ...data,
        vatRate: parseFloat(data.vatRate),
      },
    })

    return {
      success: true,
      message: 'บันทึกการตั้งค่าสำเร็จแล้ว',
      data: serializeDecimal(result),
    }
  } catch (error) {
    console.error(error)
    return {
      success: false,
    }
  }
}
