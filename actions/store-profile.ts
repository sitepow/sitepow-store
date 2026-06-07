'use server'

import { Prisma } from '@/generated/prisma/client'
import { StoreProfileFormValues } from '@/zod/store-profile'

import { prisma } from '@/lib/prisma'

const storeProfileSelect = {
  id: true,
  name: true,
  slug: true,
  email: true,
  taxId: true,
  logo: true,
} satisfies Prisma.StoreSelect

export type GetStoreProfileResult = Prisma.StoreGetPayload<{
  select: typeof storeProfileSelect
}>

export async function getStoreProfile(
  storeId: string,
): Promise<GetStoreProfileResult | null> {
  if (!storeId) {
    return null
  }

  try {
    return await prisma.store.findUnique({
      where: { id: storeId },
      select: storeProfileSelect,
    })
  } catch {
    return null
  }
}

export async function updateStoreProfile(
  storeId: string,
  input: StoreProfileFormValues,
) {
  try {
    if (!storeId) {
      return { success: false, message: 'ไม่พบ Store ID' }
    }

    if (input.slug) {
      const existing = await prisma.store.findFirst({
        where: { slug: input.slug, id: { not: storeId } },
        select: { id: true },
      })
      if (existing) {
        return { success: false, message: 'URL Slug นี้ถูกใช้งานไปแล้ว' }
      }
    }

    await prisma.store.update({
      where: { id: storeId },
      data: {
        ...input,
        email: input.email || null,
        taxId: input.taxId || null,
      },
    })

    return { success: true, message: 'บันทึกข้อมูลร้านค้าสำเร็จ' }
  } catch (error) {
    console.error(error)
    return { success: false }
  }
}
