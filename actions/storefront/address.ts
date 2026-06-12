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
    throw new Error('ไม่พบข้อมูลผู้ใช้งาน')
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
  const session = await auth()
  if (!session?.user?.id) return []

  try {
    const customerId = await getCustomerId(session.user.id)
    return prisma.address.findMany({
      where: { customerId },
      select: addressOptionSelect,
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    })
  } catch {
    return []
  }
}

export async function getAddresses() {
  const session = await auth()
  if (!session?.user?.id) return []

  try {
    const customerId = await getCustomerId(session.user.id)
    return prisma.address.findMany({
      where: { customerId },
      select: addressDetailSelect,
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    })
  } catch {
    return []
  }
}

export async function createAddress(
  data: Omit<AddressDetail, 'id' | 'isDefault'>,
) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('ไม่พบข้อมูลผู้ใช้งาน')
  }

  const customerId = await getCustomerId(session.user.id)

  const count = await prisma.address.count({ where: { customerId } })

  return prisma.address.create({
    data: {
      ...data,
      customerId,
      isDefault: count === 0,
    },
    select: addressDetailSelect,
  })
}

export async function updateAddress(
  id: string,
  data: Partial<Omit<AddressDetail, 'id' | 'isDefault'>>,
) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('ไม่พบข้อมูลผู้ใช้งาน')
  }

  const customerId = await getCustomerId(session.user.id)

  const address = await prisma.address.findUnique({
    where: { id },
    select: { customerId: true },
  })

  if (!address || address.customerId !== customerId) {
    throw new Error('ไม่พบข้อมูลที่อยู่')
  }

  return prisma.address.update({
    where: { id },
    data,
    select: addressDetailSelect,
  })
}

export async function deleteAddress(id: string) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('ไม่พบข้อมูลผู้ใช้งาน')
  }

  const customerId = await getCustomerId(session.user.id)

  const address = await prisma.address.findUnique({
    where: { id },
    select: { customerId: true, isDefault: true },
  })

  if (!address || address.customerId !== customerId) {
    throw new Error('ไม่พบข้อมูลที่อยู่')
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
}

export async function setDefaultAddress(id: string) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('ไม่พบข้อมูลผู้ใช้งาน')
  }

  const customerId = await getCustomerId(session.user.id)

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
}
