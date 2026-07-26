'use server'

import { cache } from 'react'

import { PLAN_DETAILS } from '@/constants/plan'
import { PRICING_VALUE } from '@/constants/pricing'
import { Prisma } from '@/generated/prisma/client'
import {
  ActorType,
  InvoiceStatus,
  LogAction,
  PermissionRole,
  Plan,
  StoreStatus,
  SubStatus,
} from '@/generated/prisma/enums'
import { queryKeyToRedisKey } from '@/utils/cache'
import { formatDate } from '@/utils/date'
import { DecimalToNumber, serializeDecimal } from '@/utils/decimal'
import { calculatePlanPrice } from '@/utils/pricing'
import { createStoreSchema } from '@/zod/store'

import { createLog } from '@/lib/activity-log'
import { auth } from '@/lib/auth'
import { verifyEmployeePermission } from '@/lib/auth-guard'
import { withCache } from '@/lib/cache'
import { prisma } from '@/lib/prisma'

import { invalidateStoreCache } from './query-keys/invalidation/store'
import { storeKeys } from './query-keys/store'

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
  billingCycle?: string
  status?: StoreStatus
  isPointsEnabled?: boolean
  pointEarningRate?: number | string | Prisma.Decimal | null
  pointRedeemRate?: number | string | Prisma.Decimal | null
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
  subscription: {
    select: {
      id: true,
      status: true,
      startDate: true,
      endDate: true,
      pendingPlan: true,
      pendingPlanAt: true,
    },
  },
} satisfies Prisma.StoreSelect

export type GetStoresItem = Prisma.StoreGetPayload<{
  select: typeof storeSelect
}>

export type GetStoreOptionsItem = Prisma.StoreGetPayload<{
  select: typeof storeDropdownSelect
}>

export interface GetStoresResponse {
  data: DecimalToNumber<GetStoresItem[]>
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
  const cacheKey = queryKeyToRedisKey(storeKeys.landing())

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
    plan: true
    email: true
    taxId: true
    ownerId: true
    slug: true
    coverImage: true
    primaryColor: true
  }
}>

export const getStore = cache(async ({ domain }: { domain: string }) => {
  if (!domain) {
    return null
  }
  const cacheKey = queryKeyToRedisKey(storeKeys.detail(domain))

  return withCache(cacheKey, async () => {
    return await prisma.store.findUnique({
      where: { slug: domain },
      select: {
        id: true,
        name: true,
        description: true,
        logo: true,
        coverImage: true,
        primaryColor: true,
        status: true,
        plan: true,
        email: true,
        taxId: true,
        slug: true,
        ownerId: true,
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
    const session = await auth()

    if (!session?.user?.id) {
      return {
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
    }

    const whereClause: Prisma.StoreWhereInput = {
      ownerId: session.user.id,
    }

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
      data: serializeDecimal(stores),
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
    const session = await auth()
    if (!session?.user?.id) {
      return []
    }

    const whereClause: Prisma.StoreWhereInput = {
      ownerId: session.user.id,
    }

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
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, message: 'ไม่มีสิทธิ์เข้าถึง' }
    }

    const { billingCycle, ...storeData } = input
    const validatedInput = createStoreSchema.safeParse({
      ...input,
      ownerId: session.user.id,
    })

    if (!validatedInput.success) {
      const errorMessage = validatedInput.error.issues[0].message

      return { success: false, message: errorMessage }
    }

    const cycle = input.billingCycle ?? PRICING_VALUE.ONE_MONTH
    const months =
      cycle === PRICING_VALUE.TWELVE_MONTHS
        ? 12
        : cycle === PRICING_VALUE.SIX_MONTHS
          ? 6
          : cycle === PRICING_VALUE.THREE_MONTHS
            ? 3
            : 1

    const startDate = new Date()
    const endDate = new Date()
    endDate.setMonth(endDate.getMonth() + months)

    const selectedPlan = input.plan ?? Plan.STARTER
    const isFreePlan = selectedPlan === Plan.FREE
    const initialStatus = isFreePlan
      ? StoreStatus.ACTIVE
      : StoreStatus.MAINTENANCE

    const { finalPrice } = calculatePlanPrice(
      PLAN_DETAILS[input.plan ?? Plan.STARTER].price.toString(),
      cycle,
    )

    const { name, slug } = validatedInput.data

    const existingStore = await prisma.store.findFirst({
      where: {
        OR: [
          { slug: slug.toLowerCase() },
          { name: { equals: name, mode: 'insensitive' } },
        ],
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

    const userId = session.user.id

    const store = serializeDecimal(
      await prisma.$transaction(async (tx) => {
        const newStore = await tx.store.create({
          data: {
            ...storeData,
            ownerId: userId,
            status: initialStatus,
            branches: {
              create: {
                name: 'สาขาออนไลน์ (ค่าเริ่มต้นระบบ)',
                isMain: true,
              },
            },
            subscription: {
              create: {
                plan: input.plan ?? Plan.STARTER,
                status: SubStatus.ACTIVE,
                startDate,
                endDate,
                pendingPlanCycle: cycle,
              },
            },
            subscriptionInvoices: {
              create: {
                plan: input.plan ?? Plan.STARTER,
                amount: new Prisma.Decimal(finalPrice),
                status: isFreePlan ? InvoiceStatus.PAID : InvoiceStatus.UNPAID,
                paidAt: isFreePlan ? new Date() : null,
                periodStart: startDate,
                periodEnd: endDate,
                description: `ค่าบริการแพลน ${PLAN_DETAILS[input.plan ?? Plan.STARTER].name} (รอบ ${formatDate(startDate)} ถึง ${formatDate(endDate)})`,
              },
            },
          },
          select: {
            ...storeSelect,
            subscriptionInvoices: {
              select: {
                id: true,
                amount: true,
                description: true,
              },
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
            branches: {
              select: { id: true },
              take: 1,
            },
          },
        })

        const user = await tx.user.findUnique({
          where: { id: userId },
          select: { name: true, email: true },
        })

        if (user) {
          let employee = await tx.employee.findUnique({
            where: { userId: userId },
          })

          if (!employee) {
            employee = await tx.employee.create({
              data: {
                name: user.name ?? 'ไม่มีชื่อผู้ใช้งาน',
                email: user.email!,
                userId: userId,
              },
            })
          }

          let adminRole = await tx.role.findFirst({
            where: {
              storeId: newStore.id,
              name: PermissionRole.ADMIN,
            },
          })

          if (!adminRole) {
            adminRole = await tx.role.create({
              data: {
                storeId: newStore.id,
                name: PermissionRole.ADMIN,
              },
            })
          }

          const employeeStore = await tx.employeeStore.upsert({
            where: {
              storeId_employeeId: {
                employeeId: employee.id,
                storeId: newStore.id,
              },
            },
            update: {
              roleId: adminRole.id,
            },
            create: {
              employeeId: employee.id,
              storeId: newStore.id,
              roleId: adminRole.id,
            },
          })

          if (newStore.branches.length > 0) {
            await tx.employeeBranch.createMany({
              data: newStore.branches.map((branch) => ({
                employeeStoreId: employeeStore.id,
                branchId: branch.id,
              })),
              skipDuplicates: true,
            })
          }
        }

        return newStore
      }),
    )

    const invoice = store.subscriptionInvoices[0]

    await createLog({
      action: LogAction.CREATE_STORE,
      actorType: ActorType.MERCHANT,
      storeId: store.id,
      entity: 'Store',
      entityId: store.id,
      details: { name: store.name, slug: store.slug, plan: store.plan },
    })

    await invalidateStoreCache(slug)

    return {
      success: true,
      message: 'สร้างร้านค้าสำเร็จแล้ว',
      data: store,
      invoice,
    }
  } catch (error) {
    console.error(error)
    return { success: false }
  }
}

export async function updateStore(id: string, input: UpdateStoreInput) {
  try {
    const session = await auth()
    const userId = session?.user?.id

    if (!userId) {
      return { success: false, message: 'ไม่มีสิทธิ์เข้าถึง' }
    }

    if (!id) {
      return { success: false, message: 'ไม่พบ Store ID' }
    }

    const authCheck = await verifyEmployeePermission({
      userId,
      storeId: id,
      permission: 'canManageStoreSettings',
    })

    if (!authCheck.isAuthorized) {
      return {
        success: false,
        message: authCheck.message || 'สิทธิ์การใช้งานของคุณไม่เพียงพอ',
      }
    }

    if (input.slug) {
      const existingStore = await prisma.store.findUnique({
        where: { slug: input.slug },
      })

      if (existingStore && existingStore.id !== id) {
        return { success: false, message: 'Slug นี้ถูกใช้งานไปแล้ว' }
      }
    }

    const store = await prisma.store.update({
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

    await invalidateStoreCache(store?.slug)

    return {
      success: true,
      message: 'อัปเดตข้อมูลร้านค้าสำเร็จแล้ว',
      data: store,
    }
  } catch (error) {
    console.error(error)
    return { success: false }
  }
}

export async function deleteStore(id: string) {
  try {
    const session = await auth()
    const userId = session?.user?.id

    if (!userId) {
      return { success: false, message: 'ไม่มีสิทธิ์เข้าถึง' }
    }

    if (!id) {
      return { success: false, message: 'ไม่พบ Store ID' }
    }

    const authCheck = await verifyEmployeePermission({
      userId,
      storeId: id,
      permission: 'canManageStoreSettings',
    })

    if (!authCheck.isAuthorized) {
      return {
        success: false,
        message: authCheck.message || 'สิทธิ์การใช้งานของคุณไม่เพียงพอ',
      }
    }

    const store = await prisma.$transaction(async (tx) => {
      await tx.orderItem.deleteMany({ where: { order: { storeId: id } } })
      await tx.order.deleteMany({ where: { storeId: id } })
      await tx.employeeStore.deleteMany({ where: { storeId: id } })
      await tx.subscription.deleteMany({ where: { storeId: id } })
      await tx.subscriptionInvoice.deleteMany({ where: { storeId: id } })
      await tx.coupon.deleteMany({ where: { storeId: id } })
      await tx.product.deleteMany({ where: { storeId: id } })
      await tx.category.deleteMany({ where: { storeId: id } })
      await tx.branch.deleteMany({ where: { storeId: id } })
      await tx.customerStore.deleteMany({ where: { storeId: id } })
      await tx.activityLog.deleteMany({ where: { storeId: id } })

      return await tx.store.delete({
        where: { id },
        select: { slug: true },
      })
    })

    await createLog({
      action: LogAction.DELETE_STORE,
      actorType: ActorType.SUPER_ADMIN,
      storeId: id,
      entity: 'Store',
      entityId: id,
    })

    await invalidateStoreCache(store.slug)

    return {
      success: true,
      message: 'ลบร้านค้าและข้อมูลทั้งหมดสำเร็จเรียบร้อย',
    }
  } catch (error) {
    console.error(error)
    return {
      success: false,
    }
  }
}

export async function assignUserAsStoreAdmin(userId: string, storeId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true },
    })

    if (!user) {
      return { success: false, message: 'ไม่พบข้อมูลผู้ใช้งาน' }
    }

    let employee = await prisma.employee.findUnique({
      where: { userId: userId },
    })

    if (!employee) {
      employee = await prisma.employee.create({
        data: {
          name: user.name ?? 'ไม่มีชื่อผู้ใช้งาน',
          email: user.email!,
          userId: userId,
        },
      })
    }

    let adminRole = await prisma.role.findFirst({
      where: {
        storeId: storeId,
        name: PermissionRole.ADMIN,
      },
    })

    if (!adminRole) {
      adminRole = await prisma.role.create({
        data: {
          storeId: storeId,
          name: PermissionRole.ADMIN,
        },
      })
    }

    const employeeStore = await prisma.employeeStore.upsert({
      where: {
        storeId_employeeId: {
          employeeId: employee.id,
          storeId: storeId,
        },
      },
      update: {
        roleId: adminRole.id,
      },
      create: {
        employeeId: employee.id,
        storeId: storeId,
        roleId: adminRole.id,
      },
    })

    const storeBranches = await prisma.branch.findMany({
      where: { storeId: storeId },
      select: { id: true },
    })

    if (storeBranches.length > 0) {
      await prisma.employeeBranch.createMany({
        data: storeBranches.map((branch) => ({
          employeeStoreId: employeeStore.id,
          branchId: branch.id,
        })),
        skipDuplicates: true,
      })
    }

    return { success: true, employeeStore }
  } catch (error) {
    console.error(error)
    return { success: false }
  }
}
