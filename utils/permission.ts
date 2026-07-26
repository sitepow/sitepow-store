import { PERMISSION_MAPPING } from '@/constants/permission'
import { PermissionKey } from '@/types/permission'

import { prisma } from '@/lib/prisma'

export async function checkPermission(
  roleId: string,
  permission: PermissionKey,
): Promise<boolean> {
  const target = PERMISSION_MAPPING[permission]
  if (!target) {
    return false
  }

  const count = await prisma.rolePermission.count({
    where: {
      roleId,
      permission: {
        domain: target.domain,
        action: target.action,
      },
    },
  })

  return count > 0
}
