'use server'

import { serializeDecimal } from '@/utils/decimal'
import { TaxSettingFormValues } from '@/zod/tax'

import { prisma } from '@/lib/prisma'

export async function getTaxSetting(storeId: string) {
  return serializeDecimal(
    await prisma.store.findUnique({
      where: { id: storeId },
      select: { isVatRegistered: true, vatRate: true },
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
        isVatRegistered: data.isVatRegistered,
        vatRate: parseFloat(data.vatRate),
      },
    })

    return {
      data: serializeDecimal(result),
      message: 'บันทึกการตั้งค่าสำเร็จแล้ว',
    }
  } catch {
    throw new Error('ไม่สามารถบันทึกการตั้งค่าภาษีได้')
  }
}
