'use server'

import { Prisma } from '@/generated/prisma/client';



import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';










const addressOptionSelect = {
  id: true,
  name: true,
  type: true,
  receiverName: true,
  addressLine: true,
  province: true,
  district: true,
  subDistrict: true,
  postalCode: true,
  isDefault: true,
  storeId: true,
} satisfies Prisma.AddressSelect

const addressDetailSelect = {
  id: true,
  name: true,
  type: true,
  phone: true,
  addressLine: true,
  subDistrict: true,
  district: true,
  province: true,
  postalCode: true,
  receiverName: true,
  taxName: true,
  taxId: true,
  branchCode: true,
  isDefault: true,
  storeId: true,
} satisfies Prisma.AddressSelect

export type AddressOption = Prisma.AddressGetPayload<{
  select: typeof addressOptionSelect
}>

export type AddressDetail = Prisma.AddressGetPayload<{
  select: typeof addressDetailSelect
}>

async function getCustomerId(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user?.email) {
    return null
  }

  let customer = await prisma.customer.findUnique({ where: { userId } })

  if (!customer) {
    customer = await prisma.customer.findUnique({
      where: { email: user.email },
    })

    if (customer) {
      customer = await prisma.customer.update({
        where: { id: customer.id },
        data: { userId: userId },
      })
    } else {
      customer = await prisma.customer.create({
        data: {
          userId: userId,
          email: user.email,
          firstName: user.name?.split(' ')[0] || '',
          lastName: user.name?.split(' ').slice(1).join(' ') || '',
        },
      })
    }
  }

  return customer.id
}

async function getStoreIdBySlug(storeSlug?: string) {
  if (!storeSlug) {
    return null
  }
  const store = await prisma.store.findFirst({
    where: {
      OR: [
        { slug: storeSlug },
        { StoreDomain: { some: { domain: storeSlug, status: 'ACTIVE' } } },
      ],
    },
    select: { id: true },
  })
  return store?.id || null
}

export async function getAddressOptions(storeSlug?: string) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return []
    }

    const customerId = await getCustomerId(session.user.id)
    if (!customerId) {
      return []
    }

    const storeId = await getStoreIdBySlug(storeSlug)

    if (!storeId) {
      return []
    }

    return await prisma.address.findMany({
      where: {
        customerId,
        storeId,
      },
      select: addressOptionSelect,
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    })
  } catch (error) {
    console.error(error)
    return []
  }
}

export async function getAddresses(storeSlug: string) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return []
    }

    const customerId = await getCustomerId(session.user.id)
    const storeId = await getStoreIdBySlug(storeSlug)

    if (!customerId || !storeId) {
      return []
    }

    return await prisma.address.findMany({
      where: {
        customerId,
        storeId,
      },
      select: addressDetailSelect,
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    })
  } catch (error) {
    console.error(error)
    return []
  }
}

export async function createAddress(
  data: Omit<AddressDetail, 'id' | 'isDefault' | 'storeId'>,
  storeSlug: string,
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, message: 'ไม่พบข้อมูลผู้ใช้งาน' }
    }

    const customerId = await getCustomerId(session.user.id)
    const storeId = await getStoreIdBySlug(storeSlug)

    if (!customerId || !storeId) {
      return { success: false, message: 'ไม่พบข้อมูลร้านค้าหรือลูกค้า' }
    }

    const countInStore = await prisma.address.count({
      where: { customerId, storeId },
    })

    const address = await prisma.address.create({
      data: {
        ...data,
        customerId,
        storeId,
        isDefault: countInStore === 0,
      },
      select: addressDetailSelect,
    })

    return { success: true, message: 'บันทึกที่อยู่สำเร็จแล้ว', data: address }
  } catch (error) {
    console.error(error)
    return { success: false }
  }
}

export async function updateAddress(
  id: string,
  data: Partial<Omit<AddressDetail, 'id' | 'isDefault'>>,
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, message: 'ไม่พบข้อมูลผู้ใช้งาน' }
    }

    const customerId = await getCustomerId(session.user.id)
    const address = await prisma.address.findUnique({
      where: { id },
      select: { customerId: true },
    })

    if (!address || address.customerId !== customerId) {
      return { success: false, message: 'ไม่พบข้อมูลที่อยู่' }
    }

    const updated = await prisma.address.update({
      where: { id },
      data,
      select: addressDetailSelect,
    })

    return { success: true, message: 'อัปเดตที่อยู่สำเร็จแล้ว', data: updated }
  } catch (error) {
    console.error(error)
    return { success: false }
  }
}

export async function deleteAddress(id: string) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, message: 'ไม่พบข้อมูลผู้ใช้งาน' }
    }

    const customerId = await getCustomerId(session.user.id)
    const address = await prisma.address.findUnique({
      where: { id },
      select: { customerId: true, isDefault: true },
    })

    if (!address || address.customerId !== customerId) {
      return { success: false, message: 'ไม่พบข้อมูลที่อยู่' }
    }

    await prisma.address.delete({ where: { id } })

    if (address.isDefault) {
      const next = await prisma.address.findFirst({
        where: { customerId },
        orderBy: { createdAt: 'desc' },
        select: { id: true },
      })
      if (next) {
        await prisma.address.update({
          where: { id: next.id },
          data: { isDefault: true },
        })
      }
    }

    return { success: true, message: 'ลบที่อยู่สำเร็จแล้ว' }
  } catch (error) {
    console.error(error)
    return { success: false }
  }
}

export async function setDefaultAddress(id: string) {
  try {
    const session = await auth()
    if (!session?.user?.id) return { success: false }

    const customerId = await getCustomerId(session.user.id)

    const targetAddress = await prisma.address.findUnique({
      where: { id },
      select: { customerId: true, storeId: true },
    })

    if (!targetAddress || targetAddress.customerId !== customerId) {
      return { success: false, message: 'ไม่พบข้อมูลที่อยู่' }
    }

    await prisma.$transaction([
      prisma.address.updateMany({
        where: {
          customerId,
          storeId: targetAddress.storeId,
        },
        data: { isDefault: false },
      }),
      prisma.address.update({
        where: { id },
        data: { isDefault: true },
      }),
    ])

    return { success: true, message: 'ตั้งค่าที่อยู่เริ่มต้นสำเร็จแล้ว' }
  } catch (error) {
    console.error(error)
    return { success: false }
  }
}
