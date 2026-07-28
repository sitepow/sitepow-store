'use server'

import { PERMISSION_MAPPING } from '@/constants/permission'
import { DEFAULT_PASSWORD_EMPLOYEE } from '@/constants/system'
import { Prisma } from '@/generated/prisma/client'
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
  email: string
  assignments: {
    branchId: string
    roleId: string
    permissionIds?: string[]
  }[]
}

export interface UpdateEmployeeInput {
  storeId: string
  name?: string
  assignments: {
    branchId: string
    roleId: string
    permissionIds?: string[]
  }[]
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
  store: { select: { id: true } },
  employee: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
  branches: {
    select: {
      id: true,
      branchId: true,
      branch: {
        select: {
          id: true,
          name: true,
        },
      },
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
      customPermissions: {
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
    },
  },
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
  branchId,
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

    const authCheck = await verifyEmployeePermission({
      userId,
      storeId,
      branchId,
      permission: 'canViewEmployee',
    })

    if (!authCheck.isAuthorized) {
      return emptyResponse
    }

    const sanitizedPage = Math.max(1, page)
    const sanitizedLimit = Math.max(1, Math.min(20, limit))
    const skip = (sanitizedPage - 1) * sanitizedLimit

    const whereClause: Prisma.EmployeeStoreWhereInput = {
      storeId,
      ...(branchId && branchId !== ALL_BRANCHES
        ? {
            branches: {
              some: { branchId },
            },
          }
        : {}),
      ...(search
        ? {
            employee: {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
              ],
            },
          }
        : {}),
      ...(roleId
        ? {
            branches: {
              some: { roleId },
            },
          }
        : {}),
    }

    const [totalItems, employees] = await Promise.all([
      prisma.employeeStore.count({ where: whereClause }),
      prisma.employeeStore.findMany({
        where: whereClause,
        skip,
        take: sanitizedLimit,
        select: employeeStoreSelect,
        orderBy: { createdAt: 'desc' },
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
      permission: 'canCreateEmployee',
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
        employeeId: employee.id,
        storeId: input.storeId,
        branches: {
          create: input.assignments.map((assignment) => ({
            branchId: assignment.branchId,
            roleId: assignment.roleId,
            customPermissions: {
              create:
                assignment.permissionIds?.map((permissionId) => ({
                  permissionId,
                })) || [],
            },
          })),
        },
      },
      select: employeeStoreSelect,
    })

    await createLog({
      action: LogAction.MANAGE_EMPLOYEE,
      actorType: ActorType.MERCHANT,
      storeId: input.storeId,
      entity: 'Employee',
      entityId: employee.id,
      details: {
        name: input.name,
        email: input.email,
        assignments: input.assignments,
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
      permission: 'canUpdateEmployee',
    })

    if (!authCheck.isAuthorized) {
      return {
        success: false,
        message: authCheck.message || 'สิทธิ์การใช้งานของคุณไม่เพียงพอ',
      }
    }

    const existingEmployeeStore = await prisma.employeeStore.findUnique({
      where: { id },
      select: { employeeId: true },
    })

    if (!existingEmployeeStore) {
      return { success: false, message: 'ไม่พบข้อมูลพนักงาน' }
    }

    const updated = await prisma.$transaction(async (tx) => {
      if (input.name) {
        await tx.employee.update({
          where: { id: existingEmployeeStore.employeeId },
          data: { name: input.name },
        })
      }

      if (input.assignments) {
        await tx.employeeBranch.deleteMany({
          where: { employeeStoreId: id },
        })

        if (input.assignments.length > 0) {
          for (const assignment of input.assignments) {
            await tx.employeeBranch.create({
              data: {
                employeeStoreId: id,
                branchId: assignment.branchId,
                roleId: assignment.roleId,
                customPermissions: {
                  create:
                    assignment.permissionIds?.map((permissionId) => ({
                      permissionId,
                    })) || [],
                },
              },
            })
          }
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
      storeId: input.storeId,
      entity: 'Employee',
      entityId: existingEmployeeStore.employeeId,
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
      permission: 'canDeleteEmployee',
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
      const employeeBranches = await tx.employeeBranch.findMany({
        where: { employeeStoreId: id },
        select: { id: true },
      })

      for (const eb of employeeBranches) {
        await tx.employeeBranchPermission.deleteMany({
          where: { employeeBranchId: eb.id },
        })
      }

      await tx.employeeBranch.deleteMany({
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
      permission: 'canViewEmployee',
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
  employeeStore: Prisma.EmployeeStoreGetPayload<{
    include: {
      branches: {
        include: {
          role: {
            include: {
              permissions: {
                include: {
                  permission: true
                }
              }
            }
          }
          customPermissions: {
            include: {
              permission: true
            }
          }
        }
      }
    }
  }> | null
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
        branches: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
            customPermissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    })

    if (!employeeStore) {
      return null
    }

    let hasBranchAccess = true
    let targetBranches = employeeStore.branches

    if (branchId && branchId !== ALL_BRANCHES) {
      const found = employeeStore.branches.find((b) => b.branchId === branchId)
      if (found) {
        hasBranchAccess = true
        targetBranches = [found]
      } else {
        hasBranchAccess = false
        targetBranches = []
      }
    } else {
      hasBranchAccess = employeeStore.branches.length > 0
    }

    const permissions: PermissionKey[] = []

    for (const branchAssignment of targetBranches) {
      const rolePermissions = branchAssignment.role?.permissions || []
      for (const rp of rolePermissions) {
        const { domain, action } = rp.permission
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

      const customPermissions = branchAssignment.customPermissions || []
      for (const cp of customPermissions) {
        const { domain, action } = cp.permission
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

    const activeBranchAssignment = targetBranches[0]

    return {
      employeeStore,
      role: activeBranchAssignment?.role
        ? {
            id: activeBranchAssignment.role.id,
            name: activeBranchAssignment.role.name,
          }
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
