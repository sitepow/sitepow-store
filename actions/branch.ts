'use server'

import { Prisma } from '@/generated/prisma/client'
import { ActorType, LogAction } from '@/generated/prisma/enums'
import { ALL_STORES } from '@/stores/use-store-filter'
import { PaginatedResponse, PaginationParams } from '@/types/pagination'
import {
  createPaginationMeta,
  getEmptyPaginatedResponse,
  sanitizePagination,
} from '@/utils/pagination'

import { createLog } from '@/lib/activity-log'
import { getCurrentUser } from '@/lib/auth-server'
import {
  findOrCreateEmployee,
  verifyEmployeePermission,
} from '@/lib/permission'
import { prisma } from '@/lib/prisma'
import { resolveStoreFilter } from '@/lib/store'

import { initializeStoreRolesAndPermissions } from './permission'
import { invalidateEmployeePermissionCache } from './query-keys/invalidation/permission'

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

interface GetBranchesParams extends PaginationParams {
  storeId?: string
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

export type GetBranchesResponse = PaginatedResponse<GetBranchesItem>

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

    const userSession = await getCurrentUser()
    const userId = userSession?.id

    if (!userId) {
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
}: GetBranchesParams = {}): Promise<GetBranchesResponse> {
  const userSession = await getCurrentUser()
  const userId = userSession?.id

  if (!userId) {
    return getEmptyPaginatedResponse(page, limit)
  }

  try {
    const storeAccess = await resolveStoreFilter({
      userId,
      storeId,
      permission: 'canViewBranches',
    })

    if (!storeAccess.isAuthorized) {
      return getEmptyPaginatedResponse(page, limit)
    }

    const {
      page: sanitizedPage,
      limit: sanitizedLimit,
      skip,
    } = sanitizePagination(page, limit, { defaultLimit: 10, maxLimit: 20 })

    const whereClause: Prisma.BranchWhereInput = {
      ...storeAccess.storeFilter,
      ...(search ? { name: { contains: search, mode: 'insensitive' } } : {}),
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

    return {
      data: branches,
      meta: createPaginationMeta(totalItems, sanitizedPage, sanitizedLimit),
    }
  } catch (error) {
    console.error(error)
    return getEmptyPaginatedResponse(page, limit)
  }
}

export async function getBranch(id: string) {
  try {
    if (!id) {
      return null
    }

    const userSession = await getCurrentUser()
    const userId = userSession?.id

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
      permission: 'canViewBranches',
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
    const userSession = await getCurrentUser()
    const userId = userSession?.id

    if (!userId) {
      return {
        success: false,
        messageTH: 'กรุณาเข้าสู่ระบบก่อนทำรายการ',
        messageEN: 'Please sign in to proceed',
        message: 'กรุณาเข้าสู่ระบบก่อนทำรายการ',
      }
    }

    const { storeId, isMain = false } = input

    const authCheck = await verifyEmployeePermission({
      userId,
      storeId,
      permission: 'canCreateBranches',
    })

    if (!authCheck.isAuthorized) {
      return {
        success: false,
        messageTH: authCheck.messageTH || 'สิทธิ์การใช้งานของคุณไม่เพียงพอ',
        messageEN: authCheck.messageEN || 'Insufficient permissions',
        message: authCheck.message || 'สิทธิ์การใช้งานของคุณไม่เพียงพอ',
      }
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true },
    })

    if (!currentUser?.email) {
      return {
        success: false,
        messageTH: 'ไม่พบข้อมูลผู้ใช้งาน',
        messageEN: 'User not found',
        message: 'ไม่พบข้อมูลผู้ใช้งาน',
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

      const { employee } = await findOrCreateEmployee({
        email: currentUser.email!,
        name: currentUser.name!,
      })

      const { ownerRoleId } = await initializeStoreRolesAndPermissions(
        storeId,
        tx,
      )

      const employeeStore = await tx.employeeStore.upsert({
        where: {
          storeId_employeeId: {
            employeeId: employee.id,
            storeId,
          },
        },
        update: {},
        create: {
          employeeId: employee.id,
          storeId,
        },
        select: { id: true },
      })

      const storeDetails = await tx.store.findUnique({
        where: { id: storeId },
        select: { ownerId: true },
      })

      const ownerEmployees = await tx.employee.findMany({
        where: { userId: storeDetails?.ownerId },
        select: { id: true },
      })
      const ownerEmployeeIds = ownerEmployees.map((e) => e.id)

      const ownerEmployeeStores = await tx.employeeStore.findMany({
        where: {
          storeId,
          employeeId: { in: ownerEmployeeIds },
        },
        select: { id: true },
      })

      const targetEmployeeStoreIds = ownerEmployeeStores.map((es) => es.id)

      if (!targetEmployeeStoreIds.includes(employeeStore.id)) {
        targetEmployeeStoreIds.push(employeeStore.id)
      }

      if (targetEmployeeStoreIds.length > 0) {
        for (const employeeStoreId of targetEmployeeStoreIds) {
          await tx.employeeBranch.create({
            data: {
              employeeStoreId,
              branchId: newBranch.id,
              roleId: ownerRoleId,
            },
          })
        }
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

    await invalidateEmployeePermissionCache(userId, storeId)

    return {
      success: true,
      messageTH: 'สร้างสาขาสำเร็จ',
      messageEN: 'Branch created successfully',
      message: 'สร้างสาขาสำเร็จ',
      data: branch,
    }
  } catch (error) {
    console.error(error)
    return {
      success: false,
    }
  }
}

export async function updateBranch(id: string, input: UpdateBranchInput) {
  try {
    if (!id) {
      return {
        success: false,
        messageTH: 'ไม่พบ Branch ID',
        messageEN: 'Branch ID not found',
        message: 'ไม่พบ Branch ID',
      }
    }

    const userSession = await getCurrentUser()
    const userId = userSession?.id

    if (!userId) {
      return {
        success: false,
        messageTH: 'กรุณาเข้าสู่ระบบก่อนทำรายการ',
        messageEN: 'Please sign in to proceed',
        message: 'กรุณาเข้าสู่ระบบก่อนทำรายการ',
      }
    }

    const existingBranch = await prisma.branch.findUnique({
      where: { id },
      select: { storeId: true },
    })

    if (!existingBranch) {
      return {
        success: false,
        messageTH: 'ไม่พบข้อมูลสาขา',
        messageEN: 'Branch not found',
        message: 'ไม่พบข้อมูลสาขา',
      }
    }

    const authCheck = await verifyEmployeePermission({
      userId,
      storeId: existingBranch.storeId,
      permission: 'canUpdateBranches',
    })

    if (!authCheck.isAuthorized) {
      return {
        success: false,
        messageTH: authCheck.messageTH || 'สิทธิ์การใช้งานของคุณไม่เพียงพอ',
        messageEN: authCheck.messageEN || 'Insufficient permissions',
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

    return {
      success: true,
      messageTH: 'อัปเดตข้อมูลสาขาสำเร็จ',
      messageEN: 'Branch updated successfully',
      message: 'อัปเดตข้อมูลสาขาสำเร็จ',
      data: updatedBranch,
    }
  } catch (error) {
    console.error(error)
    return { success: false }
  }
}

export async function setMainBranch(id: string, storeId: string) {
  try {
    if (!id) {
      return {
        success: false,
        messageTH: 'ไม่พบ Branch ID',
        messageEN: 'Branch ID not found',
        message: 'ไม่พบ Branch ID',
      }
    }

    const userSession = await getCurrentUser()
    const userId = userSession?.id

    if (!userId) {
      return {
        success: false,
        messageTH: 'กรุณาเข้าสู่ระบบก่อนทำรายการ',
        messageEN: 'Please sign in to proceed',
        message: 'กรุณาเข้าสู่ระบบก่อนทำรายการ',
      }
    }

    const authCheck = await verifyEmployeePermission({
      userId,
      storeId,
      permission: 'canUpdateBranches',
    })

    if (!authCheck.isAuthorized) {
      return {
        success: false,
        messageTH: authCheck.messageTH || 'สิทธิ์การใช้งานของคุณไม่เพียงพอ',
        messageEN: authCheck.messageEN || 'Insufficient permissions',
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

    return {
      success: true,
      messageTH: 'ตั้งเป็นสาขาหลักสำเร็จ',
      messageEN: 'Set as main branch successfully',
      message: 'ตั้งเป็นสาขาหลักสำเร็จ',
      data: updatedBranch,
    }
  } catch (error) {
    console.error(error)
    return { success: false }
  }
}

export async function deleteBranch(id: string, storeId: string) {
  try {
    if (!id) {
      return {
        success: false,
        messageTH: 'ไม่พบ Branch ID',
        messageEN: 'Branch ID not found',
        message: 'ไม่พบ Branch ID',
      }
    }

    const userSession = await getCurrentUser()
    const userId = userSession?.id

    if (!userId) {
      return {
        success: false,
        messageTH: 'กรุณาเข้าสู่ระบบก่อนทำรายการ',
        messageEN: 'Please sign in to proceed',
        message: 'กรุณาเข้าสู่ระบบก่อนทำรายการ',
      }
    }

    const authCheck = await verifyEmployeePermission({
      userId,
      storeId,
      permission: 'canDeleteBranches',
    })

    if (!authCheck.isAuthorized) {
      return {
        success: false,
        messageTH: authCheck.messageTH || 'สิทธิ์การใช้งานของคุณไม่เพียงพอ',
        messageEN: authCheck.messageEN || 'Insufficient permissions',
        message: authCheck.message || 'สิทธิ์การใช้งานของคุณไม่เพียงพอ',
      }
    }

    const branch = await prisma.branch.findUnique({
      where: { id },
      select: { isMain: true },
    })

    if (branch?.isMain) {
      return {
        success: false,
        messageTH: 'ไม่สามารถลบสาขาหลักได้',
        messageEN: 'Cannot delete the main branch',
        message: 'ไม่สามารถลบสาขาหลักได้',
      }
    }

    const branchCount = await prisma.branch.count({ where: { storeId } })
    if (branchCount <= 1) {
      return {
        success: false,
        messageTH: 'ต้องมีสาขาอย่างน้อย 1 สาขา',
        messageEN: 'There must be at least one branch',
        message: 'ต้องมีสาขาอย่างน้อย 1 สาขา',
      }
    }

    await prisma.$transaction(async (tx) => {
      await tx.employeeBranchPermission.deleteMany({
        where: { employeeBranch: { branchId: id } },
      })

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

    await invalidateEmployeePermissionCache(userId, storeId)

    return {
      success: true,
      messageTH: 'ลบสาขาสำเร็จ',
      messageEN: 'Branch deleted successfully',
      message: 'ลบสาขาสำเร็จ',
    }
  } catch (error) {
    console.error(error)
    return { success: false }
  }
}
