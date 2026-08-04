'use server'

import { ActorType, LogAction, Prisma } from '@/generated/prisma/client'
import { ALL_STORES } from '@/stores/use-store-filter'
import { DecimalToNumber, serializeDecimal } from '@/utils/decimal'
import { CreateCustomerInput } from '@/zod/customer'

import { createLog } from '@/lib/activity-log'
import { auth } from '@/lib/auth'
import { verifyEmployeePermission } from '@/lib/permission'
import { prisma } from '@/lib/prisma'

export interface GetCustomersParams {
  storeId: string
  page?: number
  limit?: number
  search?: string
}

const customerStoreSelect = {
  id: true,
  rewardPoints: true,
  totalSpent: true,
  customer: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      isBlocked: true,
      blockedUntil: true,
      fakeSlipCount: true,
      createdAt: true,
    },
  },
} satisfies Prisma.CustomerStoreSelect

export type GetCustomersItem = Prisma.CustomerStoreGetPayload<{
  select: typeof customerStoreSelect
}>

export interface GetCustomersResponse {
  data: DecimalToNumber<GetCustomersItem[]>
  meta: {
    currentPage: number
    limit: number
    totalItems: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}

export async function getCustomers({
  storeId,
  page = 1,
  limit = 10,
  search,
}: GetCustomersParams): Promise<GetCustomersResponse> {
  const emptyResponse: GetCustomersResponse = {
    data: [],
    meta: {
      currentPage: page,
      limit,
      totalItems: 0,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false,
    },
  }

  const session = await auth()
  const userId = session?.user?.id

  if (!userId) {
    return emptyResponse
  }

  try {
    const whereClause: Prisma.CustomerStoreWhereInput = {}

    if (storeId && storeId !== ALL_STORES && storeId !== '') {
      const authCheck = await verifyEmployeePermission({
        userId,
        storeId,
        permission: 'canViewCustomers',
      })

      if (!authCheck.isAuthorized) {
        return emptyResponse
      }

      whereClause.storeId = storeId
    } else {
      const userStores = await prisma.store.findMany({
        where: {
          OR: [
            { ownerId: userId },
            { employeeStores: { some: { employee: { userId } } } },
          ],
        },
        select: { id: true },
      })

      const storeIds = userStores.map((s) => s.id)
      whereClause.storeId = { in: storeIds }
    }

    const sanitizedPage = Math.max(1, page)
    const sanitizedLimit = Math.max(1, Math.min(20, limit))
    const skip = (sanitizedPage - 1) * sanitizedLimit

    if (search) {
      whereClause.customer = {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search, mode: 'insensitive' } },
        ],
      }
    }

    const [totalItems, customerStores] = await Promise.all([
      prisma.customerStore.count({ where: whereClause }),
      prisma.customerStore.findMany({
        where: whereClause,
        skip,
        take: sanitizedLimit,
        orderBy: { customer: { createdAt: 'desc' } },
        select: customerStoreSelect,
      }),
    ])

    const totalPages = Math.ceil(totalItems / sanitizedLimit)

    return {
      data: serializeDecimal(customerStores),
      meta: {
        currentPage: sanitizedPage,
        limit: sanitizedLimit,
        totalItems,
        totalPages,
        hasNextPage: sanitizedPage < totalPages,
        hasPreviousPage: sanitizedPage > 1,
      },
    }
  } catch (error) {
    console.error(error)
    return emptyResponse
  }
}

export async function unblockCustomer(customerId: string, storeId: string) {
  try {
    const session = await auth()
    const userId = session?.user?.id
    if (!userId) {
      return { success: false, message: 'ไม่มีสิทธิ์เข้าถึง' }
    }

    const authCheck = await verifyEmployeePermission({
      userId,
      storeId,
      permission: 'canUpdateCustomers',
    })

    if (!authCheck.isAuthorized) {
      return { success: false, message: 'สิทธิ์การใช้งานไม่เพียงพอ' }
    }

    const updatedCustomer = await prisma.customer.update({
      where: { id: customerId },
      data: {
        isBlocked: false,
        fakeSlipCount: 0,
        blockedUntil: null,
      },
    })

    await createLog({
      action: LogAction.UNBLOCK_CUSTOMER,
      actorType: ActorType.MERCHANT,
      storeId,
      entity: 'Customer',
      entityId: updatedCustomer.id,
    })

    return { success: true, message: 'ปลดล็อกลูกค้าสำเร็จ' }
  } catch (error) {
    console.error(error)
    return { success: false }
  }
}

export async function blockCustomer(customerId: string, storeId: string) {
  try {
    const session = await auth()
    const userId = session?.user?.id
    if (!userId) {
      return { success: false, message: 'ไม่มีสิทธิ์เข้าถึง' }
    }

    const authCheck = await verifyEmployeePermission({
      userId,
      storeId,
      permission: 'canUpdateCustomers',
    })

    if (!authCheck.isAuthorized) {
      return { success: false, message: 'สิทธิ์การใช้งานไม่เพียงพอ' }
    }

    const updatedCustomer = await prisma.customer.update({
      where: { id: customerId },
      data: {
        isBlocked: true,
        blockedUntil: null,
      },
    })

    await createLog({
      action: LogAction.BLOCK_CUSTOMER,
      actorType: ActorType.MERCHANT,
      storeId,
      entity: 'Customer',
      entityId: updatedCustomer.id,
    })

    return { success: true, message: 'บล็อกลูกค้าสำเร็จ' }
  } catch (error) {
    console.error(error)
    return { success: false }
  }
}

export type POSCustomerData = NonNullable<
  Awaited<ReturnType<typeof searchCustomer>>['data']
>

export interface POSCustomerSearch {
  id: string
  name: string
  phone: string
  email: string
  points: number
  isBlocked: boolean
}

export type SearchCustomerResponse = {
  success: boolean
  data?: POSCustomerSearch
  message?: string
}

export async function searchCustomer({
  storeId,
  query,
}: {
  storeId: string
  query: string
}): Promise<SearchCustomerResponse> {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) {
    return { success: false, message: 'ไม่มีสิทธิ์เข้าถึง กรุณาเข้าสู่ระบบ' }
  }

  if (!query || !query.trim()) {
    return { success: false, message: 'กรุณากรอกข้อมูลสำหรับค้นหา' }
  }

  try {
    const authCheck = await verifyEmployeePermission({
      userId,
      storeId,
      permission: 'canViewCustomers',
    })

    if (!authCheck.isAuthorized) {
      return { success: false, message: 'สิทธิ์การใช้งานไม่เพียงพอ' }
    }

    const cleanQuery = query.trim()

    const customerStore = await prisma.customerStore.findFirst({
      where: {
        storeId,
        customer: {
          OR: [
            { phone: cleanQuery },
            { email: { equals: cleanQuery, mode: 'insensitive' } },
            { id: cleanQuery },
          ],
        },
      },
      select: {
        id: true,
        rewardPoints: true,
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            isBlocked: true,
          },
        },
      },
    })

    if (!customerStore) {
      return { success: false, message: 'ไม่พบข้อมูลสมาชิกในระบบ' }
    }

    if (customerStore.customer.isBlocked) {
      return { success: false, message: 'สมาชิกรายนี้ถูกระงับการใช้งาน' }
    }

    const fullName =
      [customerStore.customer.firstName, customerStore.customer.lastName]
        .filter(Boolean)
        .join(' ') || 'ลูกค้า'

    return {
      success: true,
      message: 'พบข้อมูลสมาชิก พร้อมใช้แต้มสะสมสำหรับร้านนี้',
      data: {
        id: customerStore.customer.id,
        name: fullName,
        phone: customerStore.customer.phone || '-',
        email: customerStore.customer.email || '-',
        points: customerStore.rewardPoints || 0,
        isBlocked: customerStore.customer.isBlocked,
      },
    }
  } catch (error) {
    console.error(error)
    return { success: false }
  }
}

export type CreateCustomerResponse = {
  success: boolean
  data?: POSCustomerSearch
  message?: string
}

export async function createCustomer(
  input: CreateCustomerInput & { storeId: string },
): Promise<CreateCustomerResponse> {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) {
    return { success: false, message: 'ไม่มีสิทธิ์เข้าถึง' }
  }

  try {
    const authCheck = await verifyEmployeePermission({
      userId,
      storeId: input.storeId,
      permission: 'canUpdateCustomers',
    })

    if (!authCheck.isAuthorized) {
      return { success: false, message: 'สิทธิ์การใช้งานไม่เพียงพอ' }
    }

    const cleanPhone = input.phone.trim()
    const cleanEmail = input.email?.trim() || null

    let customer = await prisma.customer.findFirst({
      where: {
        OR: [
          { phone: cleanPhone },
          ...(cleanEmail ? [{ email: cleanEmail }] : []),
        ],
      },
    })

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          firstName: input.firstName.trim(),
          lastName: input.lastName?.trim() || null,
          phone: cleanPhone,
          email: cleanEmail!,
        },
      })
    }

    const customerStore = await prisma.customerStore.upsert({
      where: {
        customerId_storeId: {
          customerId: customer.id,
          storeId: input.storeId,
        },
      },
      create: {
        customerId: customer.id,
        storeId: input.storeId,
        rewardPoints: 0,
        totalSpent: 0,
      },
      update: {},
    })

    const fullName =
      [customer.firstName, customer.lastName].filter(Boolean).join(' ') ||
      'ลูกค้า'

    return {
      success: true,
      message: 'สร้างสมาชิกใหม่สำเร็จ พร้อมใช้สะสมแต้มสำหรับร้านนี้',
      data: {
        id: customer.id,
        name: fullName,
        phone: customer.phone || '-',
        email: customer.email || '-',
        points: customerStore.rewardPoints || 0,
        isBlocked: customer.isBlocked || false,
      },
    }
  } catch (error) {
    console.error(error)
    return { success: false }
  }
}
