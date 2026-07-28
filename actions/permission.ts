'use server'

import {
  PERMISSION_MAPPING,
  ROLE_PERMISSION_PRESETS,
} from '@/constants/permission'
import { DefaultRole } from '@/generated/prisma/enums'
import { ALL_BRANCHES } from '@/stores/use-branch-filter'
import { PermissionKey } from '@/types/permission'

import { prisma } from '@/lib/prisma'

type TransactionClient = Omit<
  typeof prisma,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>

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
      where: {
        domain_action: { domain, action },
      },
      update: {},
      create: { domain, action },
      select: { id: true, domain: true, action: true },
    })
    permMap.set(`${domain}_${action}`, perm.id)
  }

  let ownerRoleId = ''

  for (const [roleName, presetKeys] of Object.entries(
    ROLE_PERMISSION_PRESETS,
  )) {
    const role = await db.role.upsert({
      where: {
        storeId_name: {
          storeId,
          name: roleName as DefaultRole,
        },
      },
      update: {},
      create: {
        storeId,
        name: roleName as DefaultRole,
      },
      select: { id: true, name: true },
    })

    if (roleName === DefaultRole.OWNER) {
      ownerRoleId = role.id
    }

    const rolePermData = presetKeys
      .map((key) => {
        const mapping = PERMISSION_MAPPING[key as PermissionKey]
        if (!mapping) {
          return null
        }
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

export async function resetStoreRolePermissions(
  storeId: string,
  employeeId: string,
  roleName: DefaultRole,
  branchId?: string,
) {
  try {
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

    const result = await prisma.$transaction(async (tx) => {
      const permissionConditions = presetKeys.map((key) => {
        const mapping = PERMISSION_MAPPING[key]
        return {
          domain: mapping.domain,
          action: mapping.action,
        }
      })

      const dbPermissions = await tx.permission.findMany({
        where: {
          OR: permissionConditions,
        },
        select: { id: true },
      })

      const permissionIds = dbPermissions.map((p) => p.id)

      let targetRole = await tx.role.findUnique({
        where: {
          storeId_name: {
            storeId,
            name: roleName,
          },
        },
      })

      if (!targetRole) {
        targetRole = await tx.role.create({
          data: {
            storeId,
            name: roleName,
          },
        })
      }

      await tx.rolePermission.deleteMany({
        where: { roleId: targetRole.id },
      })

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
          where: {
            OR: [{ id: employeeId }, { userId: employeeId }],
          },
          select: { id: true },
        })

        if (employee) {
          const employeeStore = await tx.employeeStore.findUnique({
            where: {
              storeId_employeeId: {
                storeId,
                employeeId: employee.id,
              },
            },
            include: {
              branches: { select: { branchId: true } },
            },
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
                  update: {
                    roleId: targetRole.id,
                  },
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

      return { success: true }
    })

    if (!result.success) {
      return {
        success: false,
        message: 'เกิดข้อผิดพลาดในการรีเซ็ตสิทธิ์',
      }
    }

    return {
      success: true,
      message: `รีเซ็ตสิทธิ์ของ ${roleName} สำเร็จแล้ว`,
    }
  } catch (error) {
    console.error(error)
    return { success: false }
  }
}
