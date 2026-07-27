import { PERMISSION_MAPPING } from '@/constants/permission'
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
