import {
  PERMISSION_MAPPING,
  ROLE_PERMISSION_PRESETS,
} from '@/constants/permission'
import { DEFAULT_PASSWORD_EMPLOYEE } from '@/constants/system'
import { EmployeeStore } from '@/generated/prisma/client'
import { DefaultRole, UserRole } from '@/generated/prisma/enums'
import { ALL_BRANCHES } from '@/stores/use-branch-filter'
import { ALL_STORES } from '@/stores/use-store-filter'
import { PermissionKey } from '@/types/permission'
import bcrypt from 'bcryptjs'

import { prisma } from '@/lib/prisma'

export type TransactionClient = Omit<
  typeof prisma,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>

interface VerifyEmployeePermissionOptions {
  userId: string
  storeId: string
  permission?: PermissionKey
  branchId?: string
}

export async function verifyEmployeePermission({
  userId,
  storeId,
  permission,
  branchId,
}: VerifyEmployeePermissionOptions) {
  try {
    const employeeStore = await prisma.employeeStore.findFirst({
      where: {
        storeId,
        employee: { userId },
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
      return { isAuthorized: false, message: 'คุณไม่มีสิทธิ์เข้าถึงร้านค้านี้' }
    }

    let targetBranches = employeeStore.branches || []
    if (branchId && branchId !== ALL_BRANCHES) {
      targetBranches = targetBranches.filter((b) => b.branchId === branchId)
      if (targetBranches.length === 0) {
        return {
          isAuthorized: false,
          message: 'คุณไม่มีสิทธิ์จัดการข้อมูลของสาขานี้',
        }
      }
    }

    if (permission) {
      const targetMapping = PERMISSION_MAPPING[permission]
      if (!targetMapping) {
        return {
          isAuthorized: false,
          message: 'ไม่พบข้อมูลสิทธิ์การใช้งานนี้ในระบบ',
        }
      }

      const hasPermission = targetBranches.some((branchAssignment) => {
        const rolePermissions = branchAssignment.role?.permissions || []
        const customPermissions = branchAssignment.customPermissions || []

        const matchInRole = rolePermissions.some(
          (rp) =>
            rp.permission.domain === targetMapping.domain &&
            rp.permission.action === targetMapping.action,
        )

        const matchInCustom = customPermissions.some(
          (cp) =>
            cp.permission.domain === targetMapping.domain &&
            cp.permission.action === targetMapping.action,
        )

        return matchInRole || matchInCustom
      })

      if (!hasPermission) {
        return {
          isAuthorized: false,
          message: 'สิทธิ์การใช้งานของคุณไม่เพียงพอ',
        }
      }
    }

    return {
      isAuthorized: true,
      employeeStore,
    }
  } catch (error) {
    console.error(error)
    return {
      isAuthorized: false,
      message: 'เกิดข้อผิดพลาดในการตรวจสอบสิทธิ์',
    }
  }
}

export async function initializeStoreRolesAndPermissions(
  storeId: string,
  tx?: TransactionClient,
) {
  const db = tx || prisma
  const permissionKeys = Object.keys(PERMISSION_MAPPING) as PermissionKey[]
  const permMap = new Map<string, string>()

  for (const key of permissionKeys) {
    const { domain, action } = PERMISSION_MAPPING[key]
    const perm = await db.permission.upsert({
      where: { domain_action: { domain, action } },
      update: {},
      create: { domain, action },
      select: { id: true },
    })
    permMap.set(`${domain}_${action}`, perm.id)
  }

  let ownerRoleId = ''

  for (const [roleName, presetKeys] of Object.entries(
    ROLE_PERMISSION_PRESETS,
  )) {
    const role = await db.role.upsert({
      where: {
        storeId_name: { storeId, name: roleName as DefaultRole },
      },
      update: {},
      create: { storeId, name: roleName as DefaultRole },
      select: { id: true, name: true },
    })

    if (roleName === DefaultRole.OWNER) {
      ownerRoleId = role.id
    }

    const rolePermData = presetKeys
      .map((key) => {
        const mapping = PERMISSION_MAPPING[key as PermissionKey]
        if (!mapping) return null
        const permId = permMap.get(`${mapping.domain}_${mapping.action}`)
        return permId ? { roleId: role.id, permissionId: permId } : null
      })
      .filter(
        (item): item is { roleId: string; permissionId: string } =>
          item !== null,
      )

    if (rolePermData.length > 0) {
      await db.rolePermission.createMany({
        data: rolePermData,
        skipDuplicates: true,
      })
    }
  }

  return { ownerRoleId }
}

export async function setupStoreOwnerPermissions(
  params: {
    userId: string
    storeId: string
    branchIds: string[]
  },
  tx?: TransactionClient,
) {
  const db = tx || prisma
  const { userId, storeId, branchIds } = params

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { name: true, email: true },
  })

  if (!user) {
    throw new Error()
  }

  let employee = await db.employee.findUnique({
    where: { userId },
  })

  if (!employee) {
    employee = await db.employee.create({
      data: {
        name: user.name ?? 'ไม่มีชื่อผู้ใช้งาน',
        email: user.email!,
        userId,
      },
    })
  }

  const { ownerRoleId } = await initializeStoreRolesAndPermissions(storeId, db)

  const employeeStore = await db.employeeStore.upsert({
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
  })

  if (branchIds.length > 0) {
    for (const branchId of branchIds) {
      await db.employeeBranch.create({
        data: {
          employeeStoreId: employeeStore.id,
          branchId,
          roleId: ownerRoleId,
        },
      })
    }
  }

  return {
    employee,
    employeeStore,
    ownerRoleId,
  }
}

export async function resetStoreRolePermissions(
  storeId: string,
  employeeId: string,
  roleName: DefaultRole,
  branchId?: string,
) {
  if (!storeId || !roleName) {
    return { success: false, message: 'ข้อมูลไม่ครบถ้วน' }
  }

  const presetKeys = ROLE_PERMISSION_PRESETS[roleName] as PermissionKey[]
  if (!presetKeys) {
    return {
      success: false,
      message: 'ไม่พบรูปแบบสิทธิ์ (Preset) ของ Role นี้',
    }
  }

  try {
    return await prisma.$transaction(async (tx) => {
      const permissionConditions = presetKeys.map((key) => ({
        domain: PERMISSION_MAPPING[key].domain,
        action: PERMISSION_MAPPING[key].action,
      }))

      const dbPermissions = await tx.permission.findMany({
        where: { OR: permissionConditions },
        select: { id: true },
      })
      const permissionIds = dbPermissions.map((p) => p.id)

      let targetRole = await tx.role.findUnique({
        where: { storeId_name: { storeId, name: roleName } },
      })

      if (!targetRole) {
        targetRole = await tx.role.create({
          data: { storeId, name: roleName },
        })
      }

      await tx.rolePermission.deleteMany({ where: { roleId: targetRole.id } })

      if (permissionIds.length > 0) {
        await tx.rolePermission.createMany({
          data: permissionIds.map((permissionId) => ({
            roleId: targetRole.id,
            permissionId,
          })),
          skipDuplicates: true,
        })
      }

      if (employeeId) {
        const employee = await tx.employee.findFirst({
          where: { OR: [{ id: employeeId }, { userId: employeeId }] },
          select: { id: true },
        })

        if (employee) {
          const employeeStore = await tx.employeeStore.findUnique({
            where: { storeId_employeeId: { storeId, employeeId: employee.id } },
          })

          if (employeeStore) {
            if (branchId && branchId !== ALL_BRANCHES) {
              await tx.employeeBranch
                .update({
                  where: {
                    employeeStoreId_branchId: {
                      employeeStoreId: employeeStore.id,
                      branchId,
                    },
                  },
                  data: {
                    roleId: targetRole.id,
                    customPermissions: { deleteMany: {} },
                  },
                })
                .catch(async () => {
                  await tx.employeeBranch.create({
                    data: {
                      employeeStoreId: employeeStore.id,
                      branchId,
                      roleId: targetRole.id,
                    },
                  })
                })
            } else {
              const allStoreBranches = await tx.branch.findMany({
                where: { storeId },
                select: { id: true },
              })

              for (const branch of allStoreBranches) {
                await tx.employeeBranch.upsert({
                  where: {
                    employeeStoreId_branchId: {
                      employeeStoreId: employeeStore.id,
                      branchId: branch.id,
                    },
                  },
                  update: { roleId: targetRole.id },
                  create: {
                    employeeStoreId: employeeStore.id,
                    branchId: branch.id,
                    roleId: targetRole.id,
                  },
                })
              }
            }
          }
        }
      }

      return {
        success: true,
        message: `รีเซ็ตสิทธิ์ของ ${roleName} สำเร็จแล้ว`,
      }
    })
  } catch (error) {
    console.error(error)
    return { success: false }
  }
}

export interface EmployeePermissionResult {
  employeeStore: EmployeeStore
  role: { id: string; name: string } | null
  isOwner: boolean
  permissions: PermissionKey[]
  hasBranchAccess: boolean
}

export async function getEmployeePermissions(
  userId: string,
  storeId: string,
  branchId?: string,
): Promise<EmployeePermissionResult | null> {
  if (!userId || !storeId || storeId === ALL_STORES) {
    return null
  }

  try {
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      select: { ownerId: true },
    })

    if (!store) {
      return null
    }

    const isOwner = store.ownerId === userId

    const employee = await prisma.employee.findUnique({
      where: { userId },
      select: { id: true },
    })

    if (!employee) {
      return null
    }

    const employeeStore = await prisma.employeeStore.findUnique({
      where: { storeId_employeeId: { employeeId: employee.id, storeId } },
      include: {
        branches: {
          include: {
            role: {
              include: {
                permissions: { include: { permission: true } },
              },
            },
            customPermissions: { include: { permission: true } },
          },
        },
      },
    })

    if (!employeeStore || employeeStore.branches.length === 0) {
      return null
    }

    let targetBranches = employeeStore.branches

    if (branchId && branchId !== ALL_BRANCHES) {
      const matchedBranch = employeeStore.branches.find(
        (b) => b.branchId === branchId,
      )

      if (matchedBranch) {
        targetBranches = [matchedBranch]
      } else {
        const isBranchInStore = await prisma.branch.findFirst({
          where: { id: branchId, storeId },
          select: { id: true },
        })

        if (!isBranchInStore) {
          targetBranches = employeeStore.branches
        } else {
          return {
            employeeStore,
            role: null,
            isOwner,
            permissions: [],
            hasBranchAccess: false,
          }
        }
      }
    }

    const permissionsSet = new Set<PermissionKey>()
    const permissionEntries = Object.entries(PERMISSION_MAPPING) as [
      PermissionKey,
      { domain: string; action: string },
    ][]

    for (const branchAssignment of targetBranches) {
      for (const rp of branchAssignment.role?.permissions || []) {
        const found = permissionEntries.find(
          ([_, map]) =>
            map.domain === rp.permission.domain &&
            map.action === rp.permission.action,
        )
        if (found) permissionsSet.add(found[0])
      }

      for (const cp of branchAssignment.customPermissions || []) {
        const found = permissionEntries.find(
          ([_, map]) =>
            map.domain === cp.permission.domain &&
            map.action === cp.permission.action,
        )
        if (found) permissionsSet.add(found[0])
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
      permissions: Array.from(permissionsSet),
      hasBranchAccess: true,
    }
  } catch (error) {
    console.error(error)
    return null
  }
}

export async function assignNewBranchToOwners(
  params: {
    userId: string
    storeId: string
    branchId: string
  },
  tx?: TransactionClient,
) {
  const db = tx || prisma
  const { userId, storeId, branchId } = params

  let employee = await db.employee.findUnique({
    where: { userId },
    select: { id: true },
  })

  if (!employee) {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true },
    })

    if (!user) {
      throw new Error()
    }

    employee = await db.employee.create({
      data: {
        name: user.name ?? 'ไม่มีชื่อผู้ใช้งาน',
        email: user.email!,
        userId,
      },
      select: { id: true },
    })
  }

  const { ownerRoleId } = await initializeStoreRolesAndPermissions(storeId, db)

  const currentEmployeeStore = await db.employeeStore.upsert({
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

  const storeDetails = await db.store.findUnique({
    where: { id: storeId },
    select: { ownerId: true },
  })

  const ownerEmployees = await db.employee.findMany({
    where: { userId: storeDetails?.ownerId },
    select: { id: true },
  })
  const ownerEmployeeIds = ownerEmployees.map((e) => e.id)

  const ownerEmployeeStores = await db.employeeStore.findMany({
    where: {
      storeId,
      employeeId: { in: ownerEmployeeIds },
    },
    select: { id: true },
  })

  const targetEmployeeStoreIds = ownerEmployeeStores.map((es) => es.id)

  if (!targetEmployeeStoreIds.includes(currentEmployeeStore.id)) {
    targetEmployeeStoreIds.push(currentEmployeeStore.id)
  }

  for (const employeeStoreId of targetEmployeeStoreIds) {
    await db.employeeBranch.create({
      data: {
        employeeStoreId,
        branchId,
        roleId: ownerRoleId,
      },
    })
  }
}

export async function findOrCreateEmployee(
  params: {
    email: string
    name: string
    defaultPassword?: string
  },
  tx?: TransactionClient,
) {
  const db = tx || prisma
  const {
    email,
    name = 'ไม่มีชื่อผู้ใช้งาน',
    defaultPassword = DEFAULT_PASSWORD_EMPLOYEE,
  } = params

  let employee = await db.employee.findUnique({
    where: { email },
    select: { id: true, userId: true },
  })

  if (employee) {
    return { employee, isNewUser: false }
  }

  let user = await db.user.findUnique({
    where: { email },
    select: { id: true },
  })

  if (!user) {
    const hashedPassword = await bcrypt.hash(defaultPassword, 10)
    user = await db.user.create({
      data: {
        email,
        name,
        role: UserRole.MERCHANT,
        password: hashedPassword,
      },
      select: { id: true },
    })
  }

  employee = await db.employee.create({
    data: {
      name,
      email,
      userId: user.id,
    },
    select: { id: true, userId: true },
  })

  return { employee, isNewUser: true }
}
