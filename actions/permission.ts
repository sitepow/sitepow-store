'use server'

import {
  PERMISSION_MAPPING,
  ROLE_PERMISSION_PRESETS,
} from '@/constants/permission'
import { DefaultRole } from '@/generated/prisma/enums'
import { PermissionKey } from '@/types/permission'

import { prisma } from '@/lib/prisma'

type TransactionClient = Omit<
  typeof prisma,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>

export async function initializeStoreRolesAndPermissions(
  storeId: string,
  ts?: TransactionClient,
) {
  const db = ts || prisma

  const permissionKeys = Object.keys(PERMISSION_MAPPING) as PermissionKey[]

  for (const key of permissionKeys) {
    const { domain, action } = PERMISSION_MAPPING[key]

    await db.permission.upsert({
      where: {
        domain_action: {
          domain,
          action,
        },
      },
      update: {},
      create: {
        domain,
        action,
      },
    })
  }

  const allPermissions = await db.permission.findMany({
    select: { id: true },
  })
  const permissionIds = allPermissions.map((p: { id: string }) => p.id)

  const defaultRolesToCreate = Object.values(DefaultRole)
  let ownerRoleId = ''

  for (const roleName of defaultRolesToCreate) {
    const role = await db.role.upsert({
      where: {
        storeId_name: {
          storeId,
          name: roleName,
        },
      },
      update: {},
      create: {
        storeId,
        name: roleName,
      },
    })

    if (permissionIds.length > 0) {
      await db.rolePermission.createMany({
        data: permissionIds.map((permissionId: string) => ({
          roleId: role.id,
          permissionId,
        })),
        skipDuplicates: true,
      })
    }

    if (roleName === DefaultRole.OWNER) {
      ownerRoleId = role.id
    }
  }

  return { ownerRoleId }
}

export async function resetStoreRolePermissions(
  storeId: string,
  employeeId: string,
  roleName: DefaultRole,
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
            select: { id: true },
          })

          const allStorePermissions = await tx.permission.findMany({
            select: { id: true },
          })

          if (employeeStore) {
            await tx.employeeStore.update({
              where: { id: employeeStore.id },
              data: {
                roleId: targetRole.id,
                permissions: {
                  deleteMany: {},
                  create: allStorePermissions.map((p) => ({
                    permissionId: p.id,
                  })),
                },
              },
            })
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
      message: `รีเซ็ตสิทธิ์ของ ${roleName} และกู้คืนสิทธิ์พนักงานสำเร็จแล้ว`,
    }
  } catch (error) {
    console.error(error)
    return { success: false }
  }
}
