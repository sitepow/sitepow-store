'use server'

import {
  ActorType,
  LogAction,
  PermissionRole,
  Prisma,
} from '@/generated/prisma/client'
import { ALL_STORES } from '@/stores/use-store-filter'

import { createLog } from '@/lib/activity-log'
import { auth } from '@/lib/auth'
import { verifyEmployeePermission } from '@/lib/auth-guard'
import { prisma } from '@/lib/prisma'

export interface CreateBranchInput {
  name: string
  storeId: string
  isMain?: boolean
  address?: string
}

export interface UpdateBranchInput {
  name?: string
  address?: string
}

interface GetBranchesParams {
  storeId: string
  page?: number
  limit?: number
  search?: string
}

const branchSelect = {
  id: true,
  name: true,
  isMain: true,
  address: true,
  subDistrict: true,
  district: true,
  province: true,
  postcode: true,
  mapUrl: true,
  openingHours: true,
  storeId: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.BranchSelect

export type GetBranchesItem = Prisma.BranchGetPayload<{
  select: typeof branchSelect
}>

export interface GetBranchesResponse {
  data: GetBranchesItem[]
  meta: {
    currentPage: number
    limit: number
    totalItems: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}

const branchOptionSelect = {
  id: true,
  name: true,
  isMain: true,
} satisfies Prisma.BranchSelect

export type BranchOption = Prisma.BranchGetPayload<{
  select: typeof branchOptionSelect
}>

export async function getBranchOptions(
  storeId: string,
): Promise<BranchOption[]> {
  try {
    if (!storeId || storeId === ALL_STORES) {
      return []
    }

    const session = await auth()
    const userId = session?.user?.id

    if (!userId) {
      return []
    }

    const authCheck = await verifyEmployeePermission({
      userId,
      storeId,
      permission: 'canManageStoreSettings',
    })

    if (!authCheck.isAuthorized) {
      return []
    }

    return await prisma.branch.findMany({
      where: { storeId },
      orderBy: [{ isMain: 'desc' }, { createdAt: 'asc' }],
      select: branchOptionSelect,
    })
  } catch (error) {
    console.error(error)
    return []
  }
}

export async function getBranches({
  storeId,
  page = 1,
  limit = 10,
  search,
}: GetBranchesParams): Promise<GetBranchesResponse> {
  const emptyResponse: GetBranchesResponse = {
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
    const whereClause: Prisma.BranchWhereInput = {}

    if (storeId && storeId !== ALL_STORES && storeId !== '') {
      const authCheck = await verifyEmployeePermission({
        userId,
        storeId,
        permission: 'canManageStoreSettings',
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
      whereClause.name = { contains: search, mode: 'insensitive' }
    }

    const [totalItems, branches] = await Promise.all([
      prisma.branch.count({ where: whereClause }),
      prisma.branch.findMany({
        where: whereClause,
        skip,
        take: sanitizedLimit,
        orderBy: [{ isMain: 'desc' }, { createdAt: 'asc' }],
        select: branchSelect,
      }),
    ])

    const totalPages = Math.ceil(totalItems / sanitizedLimit)

    return {
      data: branches,
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

export async function getBranch(id: string) {
  try {
    if (!id) {
      return null
    }

    const session = await auth()
    const userId = session?.user?.id

    if (!userId) {
      return null
    }

    const branch = await prisma.branch.findUnique({
      where: { id },
      select: branchSelect,
    })

    if (!branch) {
      return null
    }

    const authCheck = await verifyEmployeePermission({
      userId,
      storeId: branch.storeId,
      permission: 'canManageStoreSettings',
    })

    if (!authCheck.isAuthorized) {
      return null
    }

    return branch
  } catch (error) {
    console.error(error)
    return null
  }
}

export async function createBranch(input: CreateBranchInput) {
  try {
    const session = await auth()
    const userId = session?.user?.id

    if (!userId) {
      return { success: false, message: 'กรุณาเข้าสู่ระบบก่อนทำรายการ' }
    }

    const { storeId, isMain = false } = input

    const authCheck = await verifyEmployeePermission({
      userId,
      storeId,
      permission: 'canManageStoreSettings',
    })

    if (!authCheck.isAuthorized) {
      return {
        success: false,
        message: authCheck.message || 'สิทธิ์การใช้งานของคุณไม่เพียงพอ',
      }
    }

    const branch = await prisma.$transaction(async (tx) => {
      if (isMain) {
        await tx.branch.updateMany({
          where: { storeId, isMain: true },
          data: { isMain: false },
        })
      }

      const newBranch = await tx.branch.create({
        data: input,
        select: branchSelect,
      })

      let employee = await tx.employee.findUnique({
        where: { userId },
        select: { id: true },
      })

      if (!employee) {
        const user = await tx.user.findUnique({
          where: { id: userId },
          select: { name: true, email: true },
        })

        if (user) {
          employee = await tx.employee.create({
            data: {
              name: user.name ?? 'ไม่มีชื่อผู้ใช้งาน',
              email: user.email!,
              userId: userId,
            },
            select: { id: true },
          })
        }
      }

      if (!employee) {
        throw new Error('ไม่พบข้อมูลพนักงานสำหรับผู้ใช้งานนี้')
      }

      let adminRole = await tx.role.findFirst({
        where: { storeId, name: PermissionRole.ADMIN },
        select: { id: true },
      })

      if (!adminRole) {
        adminRole = await tx.role.create({
          data: {
            storeId,
            name: PermissionRole.ADMIN,
          },
          select: { id: true },
        })
      }

      const employeeStore = await tx.employeeStore.upsert({
        where: {
          storeId_employeeId: {
            employeeId: employee.id,
            storeId,
          },
        },
        update: {
          roleId: adminRole.id,
        },
        create: {
          employeeId: employee.id,
          storeId,
          roleId: adminRole.id,
        },
        select: { id: true },
      })

      const adminEmployeeStores = await tx.employeeStore.findMany({
        where: { storeId, roleId: adminRole.id },
        select: { id: true },
      })

      const targetEmployeeStoreIds = adminEmployeeStores.map((es) => es.id)

      if (!targetEmployeeStoreIds.includes(employeeStore.id)) {
        targetEmployeeStoreIds.push(employeeStore.id)
      }

      if (targetEmployeeStoreIds.length > 0) {
        await tx.employeeBranch.createMany({
          data: targetEmployeeStoreIds.map((employeeStoreId) => ({
            employeeStoreId,
            branchId: newBranch.id,
          })),
          skipDuplicates: true,
        })
      }

      return newBranch
    })

    await createLog({
      action: LogAction.UPDATE_STORE_SETTING,
      actorType: ActorType.MERCHANT,
      storeId,
      entity: 'Branch',
      entityId: branch.id,
      details: {
        name: input.name,
        isMain: input.isMain ?? false,
        type: 'created',
      },
    })

    return { success: true, data: branch }
  } catch (error) {
    console.error(error)
    return { success: false }
  }
}

export async function updateBranch(id: string, input: UpdateBranchInput) {
  try {
    if (!id) {
      return { success: false, message: 'ไม่พบ Branch ID' }
    }

    const session = await auth()
    const userId = session?.user?.id

    if (!userId) {
      return { success: false, message: 'กรุณาเข้าสู่ระบบก่อนทำรายการ' }
    }

    const existingBranch = await prisma.branch.findUnique({
      where: { id },
      select: { storeId: true },
    })

    if (!existingBranch) {
      return { success: false, message: 'ไม่พบข้อมูลสาขา' }
    }

    const authCheck = await verifyEmployeePermission({
      userId,
      storeId: existingBranch.storeId,
      permission: 'canManageStoreSettings',
    })

    if (!authCheck.isAuthorized) {
      return {
        success: false,
        message: authCheck.message || 'สิทธิ์การใช้งานของคุณไม่เพียงพอ',
      }
    }

    const updatedBranch = await prisma.branch.update({
      where: { id },
      data: input,
      select: branchSelect,
    })

    await createLog({
      action: LogAction.UPDATE_STORE_SETTING,
      actorType: ActorType.MERCHANT,
      storeId: updatedBranch.storeId,
      entity: 'Branch',
      entityId: id,
      details: { updatedFields: Object.keys(input), type: 'updated' },
    })

    return { success: true, data: updatedBranch }
  } catch (error) {
    console.error(error)
    return { success: false }
  }
}

export async function setMainBranch(id: string, storeId: string) {
  try {
    if (!id) {
      return { success: false, message: 'ไม่พบ Branch ID' }
    }

    const session = await auth()
    const userId = session?.user?.id

    if (!userId) {
      return { success: false, message: 'กรุณาเข้าสู่ระบบก่อนทำรายการ' }
    }

    const authCheck = await verifyEmployeePermission({
      userId,
      storeId,
      permission: 'canManageStoreSettings',
    })

    if (!authCheck.isAuthorized) {
      return {
        success: false,
        message: authCheck.message || 'สิทธิ์การใช้งานของคุณไม่เพียงพอ',
      }
    }

    await prisma.$transaction(async (tx) => {
      await tx.branch.updateMany({
        where: { storeId, isMain: true },
        data: { isMain: false },
      })

      await tx.branch.update({
        where: { id },
        data: { isMain: true },
      })
    })

    const updatedBranch = await prisma.branch.findUnique({
      where: { id },
      select: branchSelect,
    })

    await createLog({
      action: LogAction.UPDATE_STORE_SETTING,
      actorType: ActorType.MERCHANT,
      storeId,
      entity: 'Branch',
      entityId: id,
      details: { type: 'set_main' },
    })

    return { success: true, data: updatedBranch }
  } catch (error) {
    console.error(error)
    return { success: false }
  }
}

export async function deleteBranch(id: string, storeId: string) {
  try {
    if (!id) {
      return { success: false, message: 'ไม่พบ Branch ID' }
    }

    const session = await auth()
    const userId = session?.user?.id

    if (!userId) {
      return { success: false, message: 'กรุณาเข้าสู่ระบบก่อนทำรายการ' }
    }

    const authCheck = await verifyEmployeePermission({
      userId,
      storeId,
      permission: 'canManageStoreSettings',
    })

    if (!authCheck.isAuthorized) {
      return {
        success: false,
        message: authCheck.message || 'สิทธิ์การใช้งานของคุณไม่เพียงพอ',
      }
    }

    const branch = await prisma.branch.findUnique({
      where: { id },
      select: { isMain: true },
    })

    if (branch?.isMain) {
      return { success: false, message: 'ไม่สามารถลบสาขาหลักได้' }
    }

    const branchCount = await prisma.branch.count({ where: { storeId } })
    if (branchCount <= 1) {
      return { success: false, message: 'ต้องมีสาขาอย่างน้อย 1 สาขา' }
    }

    await prisma.$transaction(async (tx) => {
      await tx.employeeBranch.deleteMany({ where: { branchId: id } })
      await tx.branch.delete({ where: { id } })
    })

    await createLog({
      action: LogAction.UPDATE_STORE_SETTING,
      actorType: ActorType.MERCHANT,
      storeId,
      entity: 'Branch',
      entityId: id,
      details: { type: 'deleted' },
    })

    return { success: true, message: 'ลบสาขาสำเร็จ' }
  } catch (error) {
    console.error(error)
    return { success: false }
  }
}
