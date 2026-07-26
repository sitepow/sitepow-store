'use server'

import { Prisma } from '@/generated/prisma/client'
import { ActorType, LogAction, UserRole } from '@/generated/prisma/enums'
import { ALL_BRANCHES } from '@/stores/use-branch-filter'
import { ALL_STORES } from '@/stores/use-store-filter'
import { PermissionKey } from '@/types/permission'

import { createLog } from '@/lib/activity-log'
import { auth } from '@/lib/auth'
import { verifyEmployeePermission } from '@/lib/permission'
import { prisma } from '@/lib/prisma'

export interface CreateEmployeeInput {
  storeId: string
  name: string
  email: string
  roleId: string
  branchIds: string[]
}

export interface UpdateEmployeeInput {
  storeId: string
  name?: string
  roleId?: string
  branchIds: string[]
}

interface GetEmployeesParams {
  storeId: string
  branchId?: string
  page?: number
  limit?: number
  search?: string
  roleId?: string
}

const employeeStoreSelect = {
  id: true,
  role: {
    select: {
      id: true,
      name: true,
      permissions: {
        select: {
          permission: {
            select: {
              id: true,
              domain: true,
              action: true,
            },
          },
        },
      },
    },
  },
  employee: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
  branches: {
    select: {
      branch: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  },
  store: { select: { id: true } },
} satisfies Prisma.EmployeeStoreSelect

export type GetEmployeesItem = Prisma.EmployeeStoreGetPayload<{
  select: typeof employeeStoreSelect
}>

export interface GetEmployeesResponse {
  data: GetEmployeesItem[]
  meta: {
    currentPage: number
    limit: number
    totalItems: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}

export async function getEmployees({
  storeId,
  page = 1,
  limit = 10,
  search,
  roleId,
}: GetEmployeesParams): Promise<GetEmployeesResponse> {
  const emptyResponse: GetEmployeesResponse = {
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

  try {
    const session = await auth()
    const userId = session?.user?.id

    if (!userId || !storeId || storeId === ALL_STORES) {
      return emptyResponse
    }

    const store = await prisma.store.findUnique({
      where: { id: storeId },
      select: { ownerId: true },
    })

    const isOwner = store?.ownerId === userId

    if (!isOwner) {
      const authCheck = await verifyEmployeePermission({
        userId,
        storeId,
        permission: 'canManageEmployee',
      })

      if (!authCheck.isAuthorized) {
        return emptyResponse
      }
    }

    const sanitizedPage = Math.max(1, page)
    const sanitizedLimit = Math.max(1, Math.min(20, limit))
    const skip = (sanitizedPage - 1) * sanitizedLimit

    const whereClause: Prisma.EmployeeStoreWhereInput = { storeId }

    if (search) {
      whereClause.employee = {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      }
    }

    if (roleId) {
      whereClause.roleId = roleId
    }

    const [totalItems, employees] = await Promise.all([
      prisma.employeeStore.count({ where: whereClause }),
      prisma.employeeStore.findMany({
        where: whereClause,
        skip,
        take: sanitizedLimit,
        select: employeeStoreSelect,
        orderBy: { employee: { name: 'asc' } },
      }),
    ])

    const totalPages = Math.ceil(totalItems / sanitizedLimit)

    return {
      data: employees,
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

export async function createEmployee(input: CreateEmployeeInput) {
  try {
    const session = await auth()
    const userId = session?.user?.id

    if (!userId) {
      return { success: false, message: 'กรุณาเข้าสู่ระบบก่อนทำรายการ' }
    }

    const authCheck = await verifyEmployeePermission({
      userId,
      storeId: input.storeId,
      permission: 'canManageEmployee',
    })

    if (!authCheck.isAuthorized) {
      return {
        success: false,
        message: authCheck.message || 'สิทธิ์การใช้งานของคุณไม่เพียงพอ',
      }
    }

    let employee = await prisma.employee.findUnique({
      where: { email: input.email },
      select: { id: true },
    })

    if (employee) {
      const alreadyInStore = await prisma.employeeStore.findUnique({
        where: {
          storeId_employeeId: {
            employeeId: employee.id,
            storeId: input.storeId,
          },
        },
        select: { id: true },
      })

      if (alreadyInStore) {
        return { success: false, message: 'พนักงานคนนี้อยู่ในร้านนี้แล้ว' }
      }
    } else {
      const user = await prisma.user.create({
        data: {
          email: input.email,
          name: input.name,
          role: UserRole.MERCHANT,
        },
        select: { id: true },
      })

      employee = await prisma.employee.create({
        data: {
          name: input.name,
          email: input.email,
          userId: user.id,
        },
        select: { id: true },
      })
    }

    const employeeStore = await prisma.employeeStore.create({
      data: {
        roleId: input.roleId,
        employeeId: employee.id,
        storeId: input.storeId,
        branches: {
          create: input.branchIds.map((branchId) => ({ branchId })),
        },
      },
      select: employeeStoreSelect,
    })

    await createLog({
      action: LogAction.MANAGE_STAFF,
      actorType: ActorType.MERCHANT,
      storeId: input.storeId,
      entity: 'Employee',
      entityId: employeeStore.employee.id,
      details: {
        name: input.name,
        email: input.email,
        roleId: input.roleId,
        type: 'created',
      },
    })

    return {
      success: true,
      message: 'บันทึกข้อมูลสำเร็จแล้ว',
      data: employeeStore,
    }
  } catch (error) {
    console.error(error)
    return { success: false, message: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล' }
  }
}

export async function updateEmployee(id: string, input: UpdateEmployeeInput) {
  try {
    if (!id) {
      return { success: false, message: 'ไม่พบ Employee ID' }
    }

    const session = await auth()
    const userId = session?.user?.id

    if (!userId) {
      return { success: false, message: 'กรุณาเข้าสู่ระบบก่อนทำรายการ' }
    }

    const authCheck = await verifyEmployeePermission({
      userId,
      storeId: input.storeId,
      permission: 'canManageEmployee',
    })

    if (!authCheck.isAuthorized) {
      return {
        success: false,
        message: authCheck.message || 'สิทธิ์การใช้งานของคุณไม่เพียงพอ',
      }
    }

    const updateData: Prisma.EmployeeStoreUpdateInput = {}

    if (input.roleId) {
      updateData.role = {
        connect: { id: input.roleId },
      }
    }

    if (input.branchIds) {
      updateData.branches = {
        deleteMany: {},
        create: input.branchIds.map((branchId) => ({ branchId })),
      }
    }

    if (input.name) {
      updateData.employee = {
        update: { name: input.name },
      }
    }

    const updated = await prisma.employeeStore.update({
      where: { id },
      data: updateData,
      select: employeeStoreSelect,
    })

    await createLog({
      action: LogAction.MANAGE_STAFF,
      actorType: ActorType.MERCHANT,
      storeId: updated.store.id,
      entity: 'Employee',
      entityId: updated.employee?.id,
      details: { updatedFields: Object.keys(input), type: 'updated' },
    })

    return { success: true, message: 'บันทึกข้อมูลสำเร็จแล้ว', data: updated }
  } catch (error) {
    console.error(error)
    return { success: false, message: 'เกิดข้อผิดพลาดในการอัปเดตข้อมูล' }
  }
}

export async function deleteEmployee(id: string) {
  try {
    if (!id) {
      return { success: false, message: 'ไม่พบ Employee ID' }
    }

    const employeeStore = await prisma.employeeStore.findUnique({
      where: { id },
      select: { storeId: true, employeeId: true },
    })

    if (!employeeStore) {
      return { success: false, message: 'ไม่พบข้อมูลพนักงาน' }
    }

    const session = await auth()
    const userId = session?.user?.id

    if (!userId) {
      return { success: false, message: 'กรุณาเข้าสู่ระบบก่อนทำรายการ' }
    }

    const authCheck = await verifyEmployeePermission({
      userId,
      storeId: employeeStore.storeId,
      permission: 'canManageEmployee',
    })

    if (!authCheck.isAuthorized) {
      return {
        success: false,
        message: authCheck.message || 'สิทธิ์การใช้งานของคุณไม่เพียงพอ',
      }
    }

    await prisma.employeeStore.delete({ where: { id } })

    await createLog({
      action: LogAction.MANAGE_STAFF,
      actorType: ActorType.MERCHANT,
      storeId: employeeStore.storeId,
      entity: 'Employee',
      entityId: employeeStore.employeeId,
      details: { type: 'deleted' },
    })

    return { success: true, message: 'ลบพนักงานออกจากร้านสำเร็จ' }
  } catch (error) {
    console.error(error)
    return { success: false }
  }
}

export async function getEmployee(
  id: string,
): Promise<GetEmployeesItem | null> {
  try {
    if (!id) {
      return null
    }

    const session = await auth()
    const userId = session?.user?.id

    if (!userId) {
      return null
    }

    const employeeStore = await prisma.employeeStore.findUnique({
      where: { id },
      select: employeeStoreSelect,
    })

    if (!employeeStore) {
      return null
    }

    const authCheck = await verifyEmployeePermission({
      userId,
      storeId: employeeStore.store.id,
      permission: 'canManageEmployee',
    })

    if (!authCheck.isAuthorized) {
      return null
    }

    return employeeStore
  } catch (error) {
    console.error(error)
    return null
  }
}

export interface EmployeePermissionResult {
  employeeStore: GetEmployeesItem | null
  role: { id: string; name: string } | null
  isOwner: boolean
  permissions: PermissionKey[]
  hasBranchAccess: boolean
}

export async function getEmployeePermission(
  storeId: string,
  branchId?: string,
): Promise<EmployeePermissionResult | null> {
  try {
    const session = await auth()
    const userId = session?.user?.id

    if (!userId || !storeId) {
      return null
    }

    const store = await prisma.store.findUnique({
      where: { id: storeId },
      select: { ownerId: true },
    })

    const isOwner = store?.ownerId === userId

    const employee = await prisma.employee.findUnique({
      where: { userId },
      select: { id: true },
    })

    if (!employee) {
      if (isOwner) {
        return {
          employeeStore: null,
          role: null,
          isOwner: true,
          permissions: [],
          hasBranchAccess: true,
        }
      }
      return null
    }

    const employeeStore = await prisma.employeeStore.findUnique({
      where: {
        storeId_employeeId: {
          employeeId: employee.id,
          storeId,
        },
      },
      select: employeeStoreSelect,
    })

    if (!employeeStore && !isOwner) {
      return null
    }

    let hasBranchAccess = true
    if (branchId && branchId !== ALL_BRANCHES && !isOwner) {
      const branchAccess = await prisma.employeeBranch.findFirst({
        where: {
          employeeId: employee.id,
          branchId: branchId,
        },
      })
      hasBranchAccess = !!branchAccess
    }

    const permissions: PermissionKey[] =
      employeeStore?.role?.permissions
        ?.map(
          (p) =>
            `${p.permission.domain}_${p.permission.action}` as PermissionKey,
        )
        .filter(Boolean) || []

    return {
      employeeStore,
      role: employeeStore?.role
        ? { id: employeeStore.role.id, name: employeeStore.role.name }
        : null,
      isOwner,
      permissions,
      hasBranchAccess,
    }
  } catch (error) {
    console.error(error)
    return null
  }
}
