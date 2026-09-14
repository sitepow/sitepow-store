'use server'

import { ActorType, LogAction, Prisma } from '@/generated/prisma/client'
import { ALL_STORES } from '@/stores/use-store-filter'
import { PaginatedResponse, PaginationParams } from '@/types/pagination'
import { DecimalToNumber, serializeDecimal } from '@/utils/decimal'
import {
  createPaginationMeta,
  getEmptyPaginatedResponse,
  sanitizePagination,
} from '@/utils/pagination'
import { CreateCustomerInput } from '@/zod/customer'

import { createLog } from '@/lib/activity-log'
import { getCurrentUser } from '@/lib/auth-server'
import { verifyEmployeePermission } from '@/lib/permission'
import { prisma } from '@/lib/prisma'
import { resolveStoreFilter } from '@/lib/store'

export interface GetCustomersParams extends PaginationParams {
  storeId?: string
}

const customerStoreSelect = {
  id: true,
  rewardPoints: true,
  totalSpent: true,
  isBlocked: true,
  blockedUntil: true,
  fakeSlipCount: true,
  customer: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      createdAt: true,
    },
  },
} satisfies Prisma.CustomerStoreSelect

export type GetCustomersItem = Prisma.CustomerStoreGetPayload<{
  select: typeof customerStoreSelect
}>

export type GetCustomersResponse = PaginatedResponse<
  DecimalToNumber<GetCustomersItem>
>

export async function getCustomers({
  storeId,
  page = 1,
  limit = 10,
  search,
}: GetCustomersParams = {}): Promise<GetCustomersResponse> {
  const userSession = await getCurrentUser()
  const userId = userSession?.id

  if (!userId) {
    return getEmptyPaginatedResponse(page, limit)
  }

  try {
    const storeAccess = await resolveStoreFilter({
      userId,
      storeId,
      permission: 'canViewCustomers',
    })

    if (!storeAccess.isAuthorized) {
      return getEmptyPaginatedResponse(page, limit)
    }

    const {
      page: sanitizedPage,
      limit: sanitizedLimit,
      skip,
    } = sanitizePagination(page, limit, { defaultLimit: 10, maxLimit: 20 })

    const whereClause: Prisma.CustomerStoreWhereInput = {
      ...storeAccess.storeFilter,
      ...(search
        ? {
            customer: {
              OR: [
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search, mode: 'insensitive' } },
              ],
            },
          }
        : {}),
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

    return {
      data: serializeDecimal(customerStores),
      meta: createPaginationMeta(totalItems, sanitizedPage, sanitizedLimit),
    }
  } catch (error) {
    console.error(error)
    return getEmptyPaginatedResponse(page, limit)
  }
}

export async function unblockCustomer(customerId: string, storeId: string) {
  try {
    const userSession = await getCurrentUser()
    const userId = userSession?.id
    if (!userId) {
      return {
        success: false,
        messageTH: 'ไม่มีสิทธิ์เข้าถึง',
        messageEN: 'Unauthorized',
        message: 'ไม่มีสิทธิ์เข้าถึง',
      }
    }

    const authCheck = await verifyEmployeePermission({
      userId,
      storeId,
      permission: 'canUpdateCustomers',
    })

    if (!authCheck.isAuthorized) {
      return {
        success: false,
        messageTH: authCheck.messageTH || 'สิทธิ์การใช้งานไม่เพียงพอ',
        messageEN: authCheck.messageEN || 'Insufficient permissions',
        message: authCheck.message || 'สิทธิ์การใช้งานไม่เพียงพอ',
      }
    }

    const updatedCustomerStore = await prisma.customerStore.update({
      where: {
        customerId_storeId: {
          customerId,
          storeId,
        },
      },
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
      entity: 'CustomerStore',
      entityId: updatedCustomerStore.id,
    })

    return {
      success: true,
      messageTH: 'ปลดล็อกลูกค้าสำเร็จ',
      messageEN: 'Customer unblocked successfully',
      message: 'ปลดล็อกลูกค้าสำเร็จ',
    }
  } catch (error) {
    console.error(error)
    return { success: false }
  }
}

export async function blockCustomer(customerId: string, storeId: string) {
  try {
    const userSession = await getCurrentUser()
    const userId = userSession?.id
    if (!userId) {
      return {
        success: false,
        messageTH: 'ไม่มีสิทธิ์เข้าถึง',
        messageEN: 'Unauthorized',
        message: 'ไม่มีสิทธิ์เข้าถึง',
      }
    }

    const authCheck = await verifyEmployeePermission({
      userId,
      storeId,
      permission: 'canUpdateCustomers',
    })

    if (!authCheck.isAuthorized) {
      return {
        success: false,
        messageTH: authCheck.messageTH || 'สิทธิ์การใช้งานไม่เพียงพอ',
        messageEN: authCheck.messageEN || 'Insufficient permissions',
        message: authCheck.message || 'สิทธิ์การใช้งานไม่เพียงพอ',
      }
    }

    const updatedCustomerStore = await prisma.customerStore.update({
      where: {
        customerId_storeId: {
          customerId,
          storeId,
        },
      },
      data: {
        isBlocked: true,
        blockedUntil: null,
      },
    })

    await createLog({
      action: LogAction.BLOCK_CUSTOMER,
      actorType: ActorType.MERCHANT,
      storeId,
      entity: 'CustomerStore',
      entityId: updatedCustomerStore.id,
    })

    return {
      success: true,
      messageTH: 'บล็อกลูกค้าสำเร็จ',
      messageEN: 'Customer blocked successfully',
      message: 'บล็อกลูกค้าสำเร็จ',
    }
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
  messageTH?: string
  messageEN?: string
  message?: string
}

export async function searchCustomer({
  storeId,
  query,
}: {
  storeId: string
  query: string
}): Promise<SearchCustomerResponse> {
  const userSession = await getCurrentUser()
  const userId = userSession?.id

  if (!userId) {
    return {
      success: false,
      messageTH: 'ไม่มีสิทธิ์เข้าถึง กรุณาเข้าสู่ระบบ',
      messageEN: 'Access denied, please sign in',
      message: 'ไม่มีสิทธิ์เข้าถึง กรุณาเข้าสู่ระบบ',
    }
  }

  if (!query || !query.trim()) {
    return {
      success: false,
      messageTH: 'กรุณากรอกข้อมูลสำหรับค้นหา',
      messageEN: 'Please enter search query',
      message: 'กรุณากรอกข้อมูลสำหรับค้นหา',
    }
  }

  try {
    const authCheck = await verifyEmployeePermission({
      userId,
      storeId,
      permission: 'canViewCustomers',
    })

    if (!authCheck.isAuthorized) {
      return {
        success: false,
        messageTH: authCheck.messageTH || 'สิทธิ์การใช้งานไม่เพียงพอ',
        messageEN: authCheck.messageEN || 'Insufficient permissions',
        message: authCheck.message || 'สิทธิ์การใช้งานไม่เพียงพอ',
      }
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
        isBlocked: true,
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
    })

    if (!customerStore) {
      return {
        success: false,
        messageTH: 'ไม่พบข้อมูลสมาชิกในระบบ',
        messageEN: 'Member not found in the system',
        message: 'ไม่พบข้อมูลสมาชิกในระบบ',
      }
    }

    if (customerStore.isBlocked) {
      return {
        success: false,
        messageTH: 'สมาชิกรายนี้ถูกระงับการใช้งานในร้านนี้',
        messageEN: 'This member has been suspended from this store',
        message: 'สมาชิกรายนี้ถูกระงับการใช้งานในร้านนี้',
      }
    }

    const fullName =
      [customerStore.customer.firstName, customerStore.customer.lastName]
        .filter(Boolean)
        .join(' ') || 'ลูกค้า'

    return {
      success: true,
      messageTH: 'พบข้อมูลสมาชิก พร้อมใช้แต้มสะสมสำหรับร้านนี้',
      messageEN: 'Member found, ready to use reward points for this store',
      message: 'พบข้อมูลสมาชิก พร้อมใช้แต้มสะสมสำหรับร้านนี้',
      data: {
        id: customerStore.customer.id,
        name: fullName,
        phone: customerStore.customer.phone || '-',
        email: customerStore.customer.email || '-',
        points: customerStore.rewardPoints || 0,
        isBlocked: customerStore.isBlocked,
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
  messageTH?: string
  messageEN?: string
  message?: string
}

export async function createCustomer(
  input: CreateCustomerInput,
): Promise<CreateCustomerResponse> {
  const userSession = await getCurrentUser()
  const userId = userSession?.id

  if (!userId) {
    return {
      success: false,
      messageTH: 'ไม่มีสิทธิ์เข้าถึง',
      messageEN: 'Unauthorized',
      message: 'ไม่มีสิทธิ์เข้าถึง',
    }
  }

  if (!input.storeId) {
    return {
      success: false,
      messageTH: 'กรุณาระบุรหัสร้านค้า (storeId)',
      messageEN: 'Please specify storeId',
      message: 'กรุณาระบุรหัสร้านค้า (storeId)',
    }
  }

  try {
    const authCheck = await verifyEmployeePermission({
      userId,
      storeId: input.storeId,
      permission: 'canUpdateCustomers',
    })

    if (!authCheck.isAuthorized) {
      return {
        success: false,
        messageTH: authCheck.messageTH || 'สิทธิ์การใช้งานไม่เพียงพอ',
        messageEN: authCheck.messageEN || 'Insufficient permissions',
        message: authCheck.message || 'สิทธิ์การใช้งานไม่เพียงพอ',
      }
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
          email: cleanEmail || `${cleanPhone}@temporary.com`,
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
      messageTH: 'สร้างสมาชิกใหม่สำเร็จ พร้อมใช้สะสมแต้มสำหรับร้านนี้',
      messageEN:
        'New member created successfully, ready to use reward points for this store',
      message: 'สร้างสมาชิกใหม่สำเร็จ พร้อมใช้สะสมแต้มสำหรับร้านนี้',
      data: {
        id: customer.id,
        name: fullName,
        phone: customer.phone || '-',
        email: customer.email || '-',
        points: customerStore.rewardPoints || 0,
        isBlocked: customerStore.isBlocked || false,
      },
    }
  } catch (error) {
    console.error(error)
    return { success: false }
  }
}
