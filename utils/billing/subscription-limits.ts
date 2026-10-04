import { PLAN_DETAILS } from '@/constants/plan'

import { prisma } from '@/lib/db/prisma'

export async function checkCanCreateProduct(storeId: string) {
  const store = await prisma.store.findUnique({
    where: { id: storeId },
    select: { plan: true, productCount: true },
  })

  if (!store) {
    return { canCreate: false, message: 'ไม่พบข้อมูลร้านค้า' }
  }

  const maxProducts = PLAN_DETAILS[store.plan].maxProducts

  if (maxProducts !== null && store.productCount >= maxProducts) {
    return {
      canCreate: false,
      message: `คุณใช้โควตาเต็มแล้ว (${store.productCount}/${maxProducts})`,
    }
  }

  return { canCreate: true }
}
