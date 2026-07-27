'use server'

import { PERMISSION_MAPPING } from '@/constants/permission'
import { DEFAULT_PASSWORD_EMPLOYEE } from '@/constants/system'
import { EmployeeStore, Prisma } from '@/generated/prisma/client'
import { ActorType, LogAction, UserRole } from '@/generated/prisma/enums'
import { ALL_BRANCHES } from '@/stores/use-branch-filter'
import { ALL_STORES } from '@/stores/use-store-filter'
import { PermissionKey } from '@/types/permission'
import bcrypt from 'bcryptjs'

import { createLog } from '@/lib/activity-log'
import { auth } from '@/lib/auth'
import { verifyEmployeePermission } from '@/lib/permission'
import { prisma } from '@/lib/prisma'

export interface CreateEmployeeInput {
  storeId: string
  name: string
  roleId: string
  email: string
  branchIds: string[]
  permissionIds: string[]
}

export interface UpdateEmployeeInput {
  storeId: string
  name?: string
  roleId?: string
  branchIds: string[]
  permissionIds: string[]
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
  permissions: {
    select: {
      permissionId: true,
      permission: {
        select: {
          id: true,
          domain: true,
          action: true,
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
      let user = await prisma.user.findUnique({
        where: { email: input.email },
        select: { id: true },
      })

      if (!user) {
        const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD_EMPLOYEE, 10)

        user = await prisma.user.create({
          data: {
            email: input.email,
            name: input.name,
            role: UserRole.MERCHANT,
            password: hashedPassword,
          },
          select: { id: true },
        })
      }

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
        permissions: {
          create:
            input.permissionIds?.map((permissionId) => ({ permissionId })) ||
            [],
        },
        branches: {
          create: input.branchIds.map((branchId) => ({ branchId })),
        },
      },
      select: {
        ...employeeStoreSelect,
        permissions: true,
      },
    })

    await createLog({
      action: LogAction.MANAGE_EMPLOYEE,
      actorType: ActorType.MERCHANT,
      storeId: input.storeId,
      entity: 'Employee',
      entityId: employeeStore.employee.id,
      details: {
        name: input.name,
        email: input.email,
        roleId: input.roleId,
        permissionIds: input.permissionIds,
        type: 'created',
      },
    })

    return {
      success: true,
      message: `บันทึกข้อมูลสำเร็จแล้ว (รหัสผ่านเริ่มต้น: ${DEFAULT_PASSWORD_EMPLOYEE})`,
      data: employeeStore,
    }
  } catch (error) {
    console.error(error)
    return { success: false }
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

    const existingEmployeeStore = await prisma.employeeStore.findUnique({
      where: { id },
      select: { roleId: true },
    })

    if (!existingEmployeeStore) {
      return { success: false, message: 'ไม่พบข้อมูลพนักงาน' }
    }

    const updated = await prisma.$transaction(async (tx) => {
      await tx.employeeStore.update({
        where: { id },
        data: {
          roleId: input.roleId,
        },
      })

      if (input.permissionIds) {
        await tx.employeePermission.deleteMany({
          where: { employeeStoreId: id },
        })

        if (input.permissionIds.length > 0) {
          await tx.employeePermission.createMany({
            data: input.permissionIds.map((permissionId) => ({
              employeeStoreId: id,
              permissionId,
            })),
            skipDuplicates: true,
          })
        }
      }

      if (input.branchIds) {
        await tx.employeeBranch.deleteMany({
          where: { employeeStoreId: id },
        })

        if (input.branchIds.length > 0) {
          await tx.employeeBranch.createMany({
            data: input.branchIds.map((branchId) => ({
              employeeStoreId: id,
              branchId,
            })),
            skipDuplicates: true,
          })
        }
      }

      if (input.name) {
        const employeeStoreData = await tx.employeeStore.findUnique({
          where: { id },
          select: { employeeId: true },
        })
        if (employeeStoreData?.employeeId) {
          await tx.employee.update({
            where: { id: employeeStoreData.employeeId },
            data: { name: input.name },
          })
        }
      }

      return await tx.employeeStore.findUnique({
        where: { id },
        select: employeeStoreSelect,
      })
    })

    if (!updated) {
      return { success: false, message: 'เกิดข้อผิดพลาดในการอัปเดตข้อมูล' }
    }

    await createLog({
      action: LogAction.MANAGE_EMPLOYEE,
      actorType: ActorType.MERCHANT,
      storeId: updated.store.id,
      entity: 'Employee',
      entityId: updated.employee?.id,
      details: { updatedFields: Object.keys(input), type: 'updated' },
    })

    return { success: true, message: 'บันทึกข้อมูลสำเร็จแล้ว', data: updated }
  } catch (error) {
    console.error(error)
    return { success: false }
  }
}

export async function deleteEmployee(id: string) {
  try {
    if (!id) {
      return { success: false, message: 'ไม่พบ Employee ID' }
    }

    const employeeStore = await prisma.employeeStore.findUnique({
      where: { id },
      select: {
        storeId: true,
        employeeId: true,
        employee: {
          select: {
            userId: true,
          },
        },
      },
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

    const targetEmployeeId = employeeStore.employeeId
    const targetUserId = employeeStore.employee?.userId

    await prisma.$transaction(async (tx) => {
      await tx.employeeBranch.deleteMany({
        where: { employeeStoreId: id },
      })

      await tx.employeePermission.deleteMany({
        where: { employeeStoreId: id },
      })

      await tx.employeeStore.delete({
        where: { id },
      })

      const remainingStores = await tx.employeeStore.count({
        where: { employeeId: targetEmployeeId },
      })

      if (remainingStores === 0) {
        await tx.employee.delete({
          where: { id: targetEmployeeId },
        })

        if (targetUserId) {
          await tx.user
            .delete({
              where: { id: targetUserId },
            })
            .catch(() => {})
        }
      }
    })

    await createLog({
      action: LogAction.MANAGE_EMPLOYEE,
      actorType: ActorType.MERCHANT,
      storeId: employeeStore.storeId,
      entity: 'Employee',
      entityId: targetEmployeeId,
      details: { type: 'deleted' },
    })

    return {
      success: true,
      message: 'ลบพนักงานและข้อมูลที่เกี่ยวข้องทั้งหมดสำเร็จ',
    }
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
  employeeStore: EmployeeStore | null
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
      return null
    }

    const employeeStore = await prisma.employeeStore.findUnique({
      where: {
        storeId_employeeId: {
          employeeId: employee.id,
          storeId,
        },
      },
      include: {
        role: true,
        permissions: {
          include: {
            permission: true,
          },
        },
        branches: true,
      },
    })

    if (!employeeStore) {
      return null
    }

    let hasBranchAccess = true
    if (branchId && branchId !== ALL_BRANCHES) {
      const branchAccess = employeeStore?.branches.some(
        (b) => b.branchId === branchId,
      )
      hasBranchAccess = !!branchAccess
    }

    const permissions: PermissionKey[] = []

    if (employeeStore?.permissions) {
      for (const ep of employeeStore.permissions) {
        const { domain, action } = ep.permission

        const matchedKey = (
          Object.keys(PERMISSION_MAPPING) as PermissionKey[]
        ).find((key) => {
          const map = PERMISSION_MAPPING[key]
          return map.domain === domain && map.action === action
        })

        if (matchedKey && !permissions.includes(matchedKey)) {
          permissions.push(matchedKey)
        }
      }
    }

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
