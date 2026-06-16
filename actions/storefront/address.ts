'use server'

import { auth } from '@/auth'
import { Prisma } from '@/generated/prisma/client'

import { prisma } from '@/lib/prisma'

const addressOptionSelect = {
  id: true,
  name: true,
  type: true,
  receiverName: true,
  addressLine: true,
  province: true,
  district: true,
  subDistrict: true,
  isDefault: true,
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
} satisfies Prisma.AddressSelect

export type AddressOption = Prisma.AddressGetPayload<{
  select: typeof addressOptionSelect
}>

export type AddressDetail = Prisma.AddressGetPayload<{
  select: typeof addressDetailSelect
}>

async function getCustomerId(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, name: true },
  })

  if (!user) {
    return null
  }

  const [firstName, ...rest] = (user.name ?? '').split(' ')

  const customer = await prisma.customer.upsert({
    where: { userId },
    create: {
      userId,
      email: user.email!,
      firstName: firstName || null,
      lastName: rest.join(' ') || null,
    },
    update: {},
    select: { id: true },
  })

  return customer.id
}

export async function getAddressOptions() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return []
    }

    const customerId = await getCustomerId(session.user.id)
    if (!customerId) {
      return []
    }

    return await prisma.address.findMany({
      where: { customerId },
      select: addressOptionSelect,
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    })
  } catch (error) {
    console.error(error)
    return []
  }
}

export async function getAddresses() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return []
    }
    const customerId = await getCustomerId(session.user.id)
    if (!customerId) {
      return []
    }

    return await prisma.address.findMany({
      where: { customerId },
      select: addressDetailSelect,
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    })
  } catch (error) {
    console.error(error)
    return []
  }
}

export async function createAddress(
  data: Omit<AddressDetail, 'id' | 'isDefault'>,
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, message: 'ไม่พบข้อมูลผู้ใช้งาน' }
    }

    const customerId = await getCustomerId(session.user.id)
    if (!customerId) {
      return { success: false, message: 'ไม่พบข้อมูลลูกค้า' }
    }

    const count = await prisma.address.count({ where: { customerId } })
    const address = await prisma.address.create({
      data: { ...data, customerId, isDefault: count === 0 },
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
    if (!session?.user?.id) {
      return { success: false, message: 'ไม่พบข้อมูลผู้ใช้งาน' }
    }

    const customerId = await getCustomerId(session.user.id)
    if (!customerId) {
      return { success: false, message: 'ไม่พบข้อมูลลูกค้า' }
    }

    await prisma.$transaction([
      prisma.address.updateMany({
        where: { customerId },
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
