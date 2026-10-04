'use server'

import {
  PERMISSION_MAPPING,
  ROLE_PERMISSION_PRESETS,
} from '@/constants/store/permission'
import { DefaultRole } from '@/generated/prisma/enums'
import { PermissionKey } from '@/types/permission'

import {
  TransactionClient,
  initializeStoreRolesAndPermissions as initStoreRoles,
  resetStoreRolePermissions as resetRolePerms,
} from '@/lib/auth/permission'
import { prisma } from '@/lib/db/prisma'

export async function initializeStoreRolesAndPermissions(
  storeId: string,
  tx?: TransactionClient,
) {
  return await initStoreRoles(storeId, tx)
}

export async function resetStoreRolePermissions(
  storeId: string,
  employeeId: string,
  roleName: DefaultRole,
  branchId?: string,
) {
  return await resetRolePerms(storeId, employeeId, roleName, branchId)
}

export async function syncStoreRolesAndPermissions(storeId: string) {
  const permissionKeys = Object.keys(PERMISSION_MAPPING) as PermissionKey[]

  for (const key of permissionKeys) {
    const { domain, action } = PERMISSION_MAPPING[key]
    await prisma.permission.upsert({
      where: {
        domain_action: { domain, action },
      },
      update: {},
      create: { domain, action },
    })
  }

  const allPermissions = await prisma.permission.findMany({
    select: { id: true, domain: true, action: true },
  })

  const permMap = new Map<string, string>()
  allPermissions.forEach((p) => permMap.set(`${p.domain}_${p.action}`, p.id))

  const existingRoles = await prisma.role.findMany({
    where: { storeId },
    select: { id: true, name: true },
  })

  const roleMap = new Map<string, string>()
  existingRoles.forEach((r) => roleMap.set(r.name, r.id))

  const roleEntries = Object.entries(ROLE_PERMISSION_PRESETS)

  await prisma.$transaction(async (prismaTx) => {
    for (const [roleName, presetKeys] of roleEntries) {
      let roleId = roleMap.get(roleName)

      if (!roleId) {
        const newRole = await prismaTx.role.create({
          data: { storeId, name: roleName as DefaultRole },
        })
        roleId = newRole.id
      }

      const validPermissionIds: string[] = []
      for (const key of presetKeys) {
        const mapping = PERMISSION_MAPPING[key as PermissionKey]
        if (!mapping) {
          continue
        }

        const permId = permMap.get(`${mapping.domain}_${mapping.action}`)
        if (permId) {
          validPermissionIds.push(permId)
        }
      }

      await prismaTx.rolePermission.deleteMany({
        where: { roleId },
      })

      if (validPermissionIds.length > 0) {
        await prismaTx.rolePermission.createMany({
          data: validPermissionIds.map((permissionId) => ({
            roleId,
            permissionId,
          })),
          skipDuplicates: true,
        })
      }
    }
  })

  return {
    success: true,
    message: 'รีเซ็ตและซิงค์สิทธิ์ของ Role ทั้งหมดเรียบร้อยแล้ว',
  }
}
