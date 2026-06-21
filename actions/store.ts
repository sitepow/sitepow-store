'use server'

import { cache } from 'react'

import { PLAN_DETAILS } from '@/config/planDetails'
import { MILLISECONDS_PER_DAY, SUBSCRIPTION_DAYS } from '@/constants/system'
import { Prisma } from '@/generated/prisma/client'
import {
  ActorType,
  InvoiceStatus,
  LogAction,
  Plan,
  StoreStatus,
  SubStatus,
} from '@/generated/prisma/enums'

import { createLog } from '@/lib/activity-log'
import { withCache } from '@/lib/cache'
import { prisma } from '@/lib/prisma'

export interface CreateStoreInput {
  name: string
  slug: string
  ownerId: string
  logo?: string | null
  coverImage?: string | null
  description?: string | null
  phone?: string | null
  lineId?: string | null
  facebookPage?: string | null
  address?: string | null
  taxId?: string | null
  isVatRegistered?: boolean
  vatRate?: number | string | Prisma.Decimal
  plan?: Plan
  status?: StoreStatus
  isPointsEnabled?: boolean
  pointEarningRate?: number | string | Prisma.Decimal | null
  pointRedeemRate?: number | string | Prisma.Decimal | null
  aiVisionCredits?: number
  aiSearchCredits?: number
}

export interface UpdateStoreInput extends Partial<
  Omit<CreateStoreInput, 'ownerId'>
> {
  balance?: number | string | Prisma.Decimal
  platformPoints?: number
}

interface GetStoresParams {
  page?: number
  limit?: number
  search?: string
  status?: StoreStatus
  plan?: Plan
}

const storeDropdownSelect = {
  id: true,
  name: true,
  slug: true,
} satisfies Prisma.StoreSelect

const storeSelect = {
  id: true,
  name: true,
  slug: true,
  plan: true,
  status: true,
  logo: true,
  createdAt: true,
} satisfies Prisma.StoreSelect

export type GetStoresItem = Prisma.StoreGetPayload<{
  select: typeof storeSelect
}>

export type GetStoreOptionsItem = Prisma.StoreGetPayload<{
  select: typeof storeDropdownSelect
}>

export interface GetStoresResponse {
  data: GetStoresItem[]
  meta: {
    currentPage: number
    limit: number
    totalItems: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}

const storeLandingSelect = {
  id: true,
  name: true,
  slug: true,
  logo: true,
  coverImage: true,
  description: true,
} satisfies Prisma.StoreSelect

export type StoreLandingItem = Prisma.StoreGetPayload<{
  select: typeof storeLandingSelect
}>

export async function getLandingStores(
  limit = 12,
): Promise<StoreLandingItem[]> {
  const cacheKey = `landing_stores:limit:${limit}`

  return (
    (await withCache(cacheKey, () =>
      prisma.store.findMany({
        where: { status: StoreStatus.ACTIVE },
        select: storeLandingSelect,
        orderBy: { createdAt: 'desc' },
        take: limit,
      }),
    )) ?? []
  )
}

export type StoreData = Prisma.StoreGetPayload<{
  select: {
    id: true
    name: true
    description: true
    logo: true
    status: true
  }
}>

export const getStore = cache(async ({ domain }: { domain: string }) => {
  if (!domain) {
    return null
  }

  const cacheKey = `store:${domain}`

  return withCache(cacheKey, async () => {
    return await prisma.store.findUnique({
      where: { slug: domain },
      select: {
        id: true,
        name: true,
        description: true,
        logo: true,
        status: true,
      },
    })
  })
})

export async function checkStoreAvailability(input: {
  name?: string
  slug?: string
  excludeId?: string
}) {
  const { name, slug, excludeId } = input

  const results = { nameAvailable: true, slugAvailable: true }

  if (slug) {
    const existing = await prisma.store.findFirst({
      where: { slug, ...(excludeId && { id: { not: excludeId } }) },
      select: { id: true },
    })
    if (existing) {
      results.slugAvailable = false
    }
  }

  if (name) {
    const existing = await prisma.store.findFirst({
      where: { name, ...(excludeId && { id: { not: excludeId } }) },
      select: { id: true },
    })
    if (existing) {
      results.nameAvailable = false
    }
  }

  return results
}

export async function getStores({
  page = 1,
  limit = 10,
  search,
  status,
  plan,
}: GetStoresParams = {}): Promise<GetStoresResponse> {
  try {
    const sanitizedPage = Math.max(1, page)
    const sanitizedLimit = Math.max(1, Math.min(20, limit))
    const skip = (sanitizedPage - 1) * sanitizedLimit

    const whereClause: Prisma.StoreWhereInput = {}

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (status) {
      whereClause.status = status
    }

    if (plan) {
      whereClause.plan = plan
    }

    const [totalItems, stores] = await Promise.all([
      prisma.store.count({ where: whereClause }),
      prisma.store.findMany({
        where: whereClause,
        skip,
        take: sanitizedLimit,
        orderBy: {
          createdAt: 'desc',
        },
        select: storeSelect,
      }),
    ])

    const totalPages = Math.ceil(totalItems / sanitizedLimit)

    return {
      data: stores,
      meta: {
        currentPage: sanitizedPage,
        limit: sanitizedLimit,
        totalItems,
        totalPages,
        hasNextPage: sanitizedPage < totalPages,
        hasPreviousPage: sanitizedPage > 1,
      },
    }
  } catch {
    return {
      data: [],
      meta: {
        currentPage: page,
        limit: limit,
        totalItems: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    }
  }
}

export async function getStoreOptions(filters?: {
  search?: string
  status?: StoreStatus
}): Promise<GetStoreOptionsItem[]> {
  try {
    const whereClause: Prisma.StoreWhereInput = {}

    if (filters?.search) {
      whereClause.name = { contains: filters.search, mode: 'insensitive' }
    }

    if (filters?.status) {
      whereClause.status = filters.status
    }

    return await prisma.store.findMany({
      where: whereClause,
      select: storeDropdownSelect,
      orderBy: {
        name: 'asc',
      },
    })
  } catch {
    return []
  }
}

export async function createStore(input: CreateStoreInput) {
  try {
    const { name, slug } = input

    const existingStore = await prisma.store.findFirst({
      where: {
        OR: [{ slug }, { name }],
      },
    })

    if (existingStore) {
      if (existingStore.slug === slug) {
        return { success: false, message: 'Slug นี้ถูกใช้งานไปแล้ว' }
      }
      if (existingStore.name === name) {
        return { success: false, message: 'ชื่อร้านค้า นี้ถูกใช้งานไปแล้ว' }
      }
    }

    const store = await prisma.store.create({
      data: {
        ...input,
        usage: {
          create: {},
        },
        branches: {
          create: {
            name: 'สาขาหลัก',
            isMain: true,
          },
        },
        subscription: {
          create: {
            plan: input.plan ?? Plan.STARTER,
            status: SubStatus.ACTIVE,
            startDate: new Date(),
            endDate: new Date(
              Date.now() + SUBSCRIPTION_DAYS * MILLISECONDS_PER_DAY,
            ),
          },
        },
        subscriptionInvoices: {
          create: {
            plan: input.plan ?? Plan.STARTER,
            amount: PLAN_DETAILS[input.plan ?? Plan.STARTER].price,
            status: InvoiceStatus.PAID,
            paidAt: new Date(),
            periodStart: new Date(),
            periodEnd: new Date(
              Date.now() + SUBSCRIPTION_DAYS * MILLISECONDS_PER_DAY,
            ),
            description: `ค่าบริการแพลน ${PLAN_DETAILS[input.plan ?? Plan.STARTER].name} เดือนแรก`,
          },
        },
      },
      select: storeSelect,
    })

    await createLog({
      action: LogAction.CREATE_STORE,
      actorType: ActorType.MERCHANT,
      storeId: store.id,
      entity: 'Store',
      entityId: store.id,
      details: { name: store.name, slug: store.slug, plan: store.plan },
    })

    return { success: true, message: 'สร้างร้านค้าสำเร็จแล้ว', data: store }
  } catch (error) {
    console.error(error)
    return { success: false }
  }
}

export async function updateStore(id: string, input: UpdateStoreInput) {
  try {
    if (!id) {
      return { success: false, message: 'ไม่พบ Store ID' }
    }

    if (input.slug) {
      const existingStore = await prisma.store.findUnique({
        where: { slug: input.slug },
      })

      if (existingStore && existingStore.id !== id) {
        return { success: false, message: 'Slug นี้ถูกใช้งานไปแล้ว' }
      }
    }

    const updatedStore = await prisma.store.update({
      where: { id },
      data: input,
      select: storeSelect,
    })

    await createLog({
      action: LogAction.UPDATE_STORE,
      actorType: ActorType.MERCHANT,
      storeId: id,
      entity: 'Store',
      entityId: id,
      details: { updatedFields: Object.keys(input) },
    })

    return {
      success: true,
      message: 'อัปเดตข้อมูลร้านค้าสำเร็จแล้ว',
      data: updatedStore,
    }
  } catch (error) {
    console.error(error)
    return { success: false }
  }
}

export async function deleteStore(id: string) {
  try {
    if (!id) {
      return { success: false, message: 'ไม่พบ Store ID' }
    }

    await prisma.store.delete({
      where: { id },
    })

    await createLog({
      action: LogAction.DELETE_STORE,
      actorType: ActorType.SUPER_ADMIN,
      storeId: id,
      entity: 'Store',
      entityId: id,
    })

    return { success: true, message: 'ลบร้านค้าสำเร็จ' }
  } catch (error) {
    console.error(error)
    return { success: false }
  }
}
