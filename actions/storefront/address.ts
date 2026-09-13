'use server'

import { Prisma } from '@/generated/prisma/client'

import { getCurrentUser } from '@/lib/auth-server'
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
  postalCode: true,
  country: true,
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
  country: true,
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
        { customDomain: storeSlug, customDomainStatus: 'ACTIVE' },
        { StoreDomain: { some: { domain: storeSlug, status: 'ACTIVE' } } },
      ],
    },
    select: { id: true },
  })
  return store?.id || null
}

export async function getAddressOptions(storeSlug?: string) {
  try {
    const userSession = await getCurrentUser()
    const userId = userSession?.id

    if (!userId) {
      return []
    }

    const customerId = await getCustomerId(userId)
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
    const userSession = await getCurrentUser()
    const userId = userSession?.id

    if (!userId) {
      return []
    }

    const customerId = await getCustomerId(userId)
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
    const userSession = await getCurrentUser()
    const userId = userSession?.id

    if (!userId) {
      return {
        success: false,
        messageTH: 'ไม่พบข้อมูลผู้ใช้งาน',
        messageEN: 'User not found',
      }
    }

    const customerId = await getCustomerId(userId)
    const storeId = await getStoreIdBySlug(storeSlug)

    if (!customerId || !storeId) {
      return {
        success: false,
        messageTH: 'ไม่พบข้อมูลร้านค้าหรือลูกค้า',
        messageEN: 'Store or customer data not found',
      }
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

    return {
      success: true,
      messageTH: 'บันทึกที่อยู่สำเร็จแล้ว',
      messageEN: 'Address saved successfully',
      data: address,
    }
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
    const userSession = await getCurrentUser()
    const userId = userSession?.id

    if (!userId) {
      return {
        success: false,
        messageTH: 'ไม่พบข้อมูลผู้ใช้งาน',
        messageEN: 'User not found',
      }
    }

    const customerId = await getCustomerId(userId)
    const address = await prisma.address.findUnique({
      where: { id },
      select: { customerId: true },
    })

    if (!address || address.customerId !== customerId) {
      return {
        success: false,
        messageTH: 'ไม่พบข้อมูลที่อยู่',
        messageEN: 'Address not found',
      }
    }

    const updated = await prisma.address.update({
      where: { id },
      data,
      select: addressDetailSelect,
    })

    return {
      success: true,
      messageTH: 'อัปเดตที่อยู่สำเร็จแล้ว',
      messageEN: 'Address updated successfully',
      data: updated,
    }
  } catch (error) {
    console.error(error)
    return { success: false }
  }
}

export async function deleteAddress(id: string) {
  try {
    const userSession = await getCurrentUser()
    const userId = userSession?.id

    if (!userId) {
      return {
        success: false,
        messageTH: 'ไม่พบข้อมูลผู้ใช้งาน',
        messageEN: 'User not found',
      }
    }

    const customerId = await getCustomerId(userId)
    const address = await prisma.address.findUnique({
      where: { id },
      select: { customerId: true, isDefault: true },
    })

    if (!address || address.customerId !== customerId) {
      return {
        success: false,
        messageTH: 'ไม่พบข้อมูลที่อยู่',
        messageEN: 'Address not found',
      }
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

    return {
      success: true,
      messageTH: 'ลบที่อยู่สำเร็จแล้ว',
      messageEN: 'Address deleted successfully',
    }
  } catch (error) {
    console.error(error)
    return { success: false }
  }
}

export async function setDefaultAddress(id: string) {
  try {
    const userSession = await getCurrentUser()
    const userId = userSession?.id

    if (!userId) {
      return {
        success: false,
        messageTH: 'ไม่พบข้อมูลผู้ใช้งาน',
        messageEN: 'User not found',
      }
    }

    const customerId = await getCustomerId(userId)

    const targetAddress = await prisma.address.findUnique({
      where: { id },
      select: { customerId: true, storeId: true },
    })

    if (!targetAddress || targetAddress.customerId !== customerId) {
      return {
        success: false,
        messageTH: 'ไม่พบข้อมูลที่อยู่',
        messageEN: 'Address not found',
      }
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

    return {
      success: true,
      messageTH: 'ตั้งค่าที่อยู่เริ่มต้นสำเร็จแล้ว',
      messageEN: 'Default address set successfully',
    }
  } catch (error) {
    console.error(error)
    return { success: false }
  }
}
