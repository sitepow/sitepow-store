'use server'

import { ActorType, LogAction } from '@/generated/prisma/enums'
import { serializeDecimal } from '@/utils/decimal'
import { TaxSettingFormValues } from '@/zod/tax'

import { createLog } from '@/lib/activity-log'
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

    await createLog({
      action: LogAction.UPDATE_STORE_SETTING,
      actorType: ActorType.MERCHANT,
      storeId,
      entity: 'Store',
      entityId: storeId,
      details: { setting: 'tax', updatedFields: Object.keys(data) },
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
