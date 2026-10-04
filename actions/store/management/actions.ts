'use server'

import { cache } from 'react'

import { PLAN_DETAILS } from '@/constants/plan'
import { PRICING_VALUE } from '@/constants/pricing'
import { Prisma } from '@/generated/prisma/client'
import {
  ActorType,
  InvoiceStatus,
  LogAction,
  PermissionAction,
  PermissionDomain,
  Plan,
  StoreStatus,
  SubStatus,
} from '@/generated/prisma/enums'
import { ALL_STORES } from '@/stores/use-store-filter'
import { queryKeyToRedisKey } from '@/utils/cache/query-key'
import { formatDate } from '@/utils/formatting/date'
import { DecimalToNumber, serializeDecimal } from '@/utils/shared/decimal'
import { calculatePlanPrice } from '@/utils/billing/subscription-pricing'
import { createStoreSchema } from '@/zod/store/create-store'
import { addMonths } from 'date-fns'

import { createLog } from '@/lib/activity/log'
import { getCurrentUser } from '@/lib/auth/server'
import { withCache } from '@/lib/cache'
import { requireVerifiedUser } from '@/lib/auth/permission'
import {
  setupStoreOwnerPermissions,
  verifyEmployeePermission,
} from '@/lib/auth/permission'
import { prisma } from '@/lib/db/prisma'

import { invalidateStoreCache } from '@/actions/store/management/invalidation'
import { storeKeys } from '@/actions/store/management/query-keys'

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
  logo: true,
  primaryColor: true,
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
  limit = 11,
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
        customDomain: true,
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
    const userSession = await getCurrentUser()

    if (!userSession?.id) {
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

    const userId = userSession.id

    const whereClause: Prisma.StoreWhereInput = {
      OR: [
        { ownerId: userId },
        {
          employeeStores: {
            some: {
              employee: { userId },
              branches: {
                some: {
                  OR: [
                    {
                      role: {
                        permissions: {
                          some: {
                            permission: {
                              domain: PermissionDomain.STORE,
                              action: PermissionAction.READ,
                            },
                          },
                        },
                      },
                    },
                    {
                      customPermissions: {
                        some: {
                          permission: {
                            domain: PermissionDomain.STORE,
                            action: PermissionAction.READ,
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      ],
    }

    if (search) {
      whereClause.AND = [
        {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { slug: { contains: search, mode: 'insensitive' } },
          ],
        },
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
    const userSession = await getCurrentUser()
    if (!userSession?.id) {
      return []
    }

    const userId = userSession.id

    return await prisma.store.findMany({
      where: {
        OR: [
          { ownerId: userId },
          {
            employeeStores: {
              some: {
                employee: { userId },
                branches: {
                  some: {
                    OR: [
                      {
                        role: {
                          permissions: {
                            some: {
                              permission: {
                                domain: PermissionDomain.STORE,
                                action: PermissionAction.READ,
                              },
                            },
                          },
                        },
                      },
                      {
                        customPermissions: {
                          some: {
                            permission: {
                              domain: PermissionDomain.STORE,
                              action: PermissionAction.READ,
                            },
                          },
                        },
                      },
                    ],
                  },
                },
              },
            },
          },
        ],
        ...(filters?.search && {
          name: { contains: filters.search, mode: 'insensitive' },
        }),
        ...(filters?.status && {
          status: filters.status,
        }),
      },
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
    const { isAuthorized, message, userId } = await requireVerifiedUser()

    if (!isAuthorized || !userId) {
      return { success: false, message: message || 'ไม่มีสิทธิ์เข้าถึง' }
    }

    const validatedInput = createStoreSchema.safeParse({
      ...input,
      ownerId: userId,
    })

    if (!validatedInput.success) {
      const errorMessage =
        validatedInput.error.issues[0]?.message || 'ข้อมูลไม่ถูกต้อง'
      return { success: false, message: errorMessage }
    }

    const { billingCycle, ...storeData } = input
    const cycle = billingCycle ?? PRICING_VALUE.ONE_MONTH
    const months =
      cycle === PRICING_VALUE.TWELVE_MONTHS
        ? 12
        : cycle === PRICING_VALUE.SIX_MONTHS
          ? 6
          : cycle === PRICING_VALUE.THREE_MONTHS
            ? 3
            : 1

    const startDate = new Date()
    const endDate = addMonths(startDate, months)

    const selectedPlan = input.plan ?? Plan.STARTER
    const isFreePlan = selectedPlan === Plan.FREE
    const initialStatus = isFreePlan
      ? StoreStatus.ACTIVE
      : StoreStatus.MAINTENANCE

    const planPrice = PLAN_DETAILS[selectedPlan]?.price?.toString() ?? '0'
    const { finalPrice } = calculatePlanPrice(planPrice, cycle)

    const { name, slug } = validatedInput.data

    const existingStore = await prisma.store.findFirst({
      where: {
        OR: [
          { slug: slug.toLowerCase() },
          { name: { equals: name, mode: 'insensitive' } },
        ],
      },
      select: { id: true, slug: true, name: true },
    })

    if (existingStore) {
      if (existingStore.slug.toLowerCase() === slug.toLowerCase()) {
        return { success: false, message: 'Slug นี้ถูกใช้งานไปแล้ว' }
      }
      if (existingStore.name.toLowerCase() === name.toLowerCase()) {
        return { success: false, message: 'ชื่อร้านค้า นี้ถูกใช้งานไปแล้ว' }
      }
    }

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
                plan: selectedPlan,
                status: SubStatus.ACTIVE,
                startDate,
                endDate,
                pendingPlanCycle: cycle,
              },
            },
            subscriptionInvoices: {
              create: {
                plan: selectedPlan,
                amount: new Prisma.Decimal(finalPrice),
                status: isFreePlan ? InvoiceStatus.PAID : InvoiceStatus.UNPAID,
                paidAt: isFreePlan ? new Date() : null,
                periodStart: startDate,
                periodEnd: endDate,
                description: `ค่าบริการแพลน ${PLAN_DETAILS[selectedPlan]?.name ?? selectedPlan} (รอบ ${formatDate(startDate)} ถึง ${formatDate(endDate)})`,
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
            },
          },
        })

        const branchIds = newStore.branches.map((b) => b.id)
        await setupStoreOwnerPermissions(
          {
            userId,
            storeId: newStore.id,
            branchIds,
          },
          tx,
        )

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
    const userSession = await getCurrentUser()
    const userId = userSession?.id

    if (!userId) {
      return { success: false, message: 'ไม่มีสิทธิ์เข้าถึง' }
    }

    if (!id) {
      return { success: false, message: 'ไม่พบ Store ID' }
    }

    const authCheck = await verifyEmployeePermission({
      userId,
      storeId: id,
      permission: 'canUpdateStore',
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
        select: { id: true },
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
    const userSession = await getCurrentUser()
    const userId = userSession?.id

    if (!userId) {
      return { success: false, message: 'ไม่มีสิทธิ์เข้าถึง' }
    }

    if (!id) {
      return { success: false, message: 'ไม่พบ Store ID' }
    }

    const authCheck = await verifyEmployeePermission({
      userId,
      storeId: id,
      permission: 'canDeleteStore',
    })

    if (!authCheck.isAuthorized) {
      return {
        success: false,
        message: authCheck.message || 'สิทธิ์การใช้งานของคุณไม่เพียงพอ',
      }
    }

    const store = await prisma.store.delete({
      where: { id },
      select: { slug: true },
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

export interface StoreSetupStatus {
  hasShipping: boolean
  hasPayment: boolean
  isConfigured: boolean
}

export async function getStoreSetupStatus(
  storeId: string,
): Promise<StoreSetupStatus> {
  if (!storeId || storeId === ALL_STORES) {
    return { hasShipping: false, hasPayment: false, isConfigured: false }
  }

  try {
    const [shippingCount, paymentSetting] = await Promise.all([
      prisma.storeCourierService.count({
        where: {
          storeId,
          isEnabled: true,
        },
      }),
      prisma.paymentSetting.findUnique({
        where: { storeId },
        select: {
          isStripeEnabled: true,
          _count: {
            select: { bankAccounts: true },
          },
        },
      }),
    ])

    const hasShipping = shippingCount > 0

    const hasPayment = Boolean(
      paymentSetting &&
      (paymentSetting._count.bankAccounts > 0 ||
        paymentSetting.isStripeEnabled),
    )

    return {
      hasShipping,
      hasPayment,
      isConfigured: hasShipping && hasPayment,
    }
  } catch (error) {
    console.error(error)
    return { hasShipping: false, hasPayment: false, isConfigured: false }
  }
}
