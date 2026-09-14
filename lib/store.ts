import { ALL_STORES } from '@/stores/use-store-filter'
import { PermissionKey } from '@/types/permission'

import { verifyEmployeePermission } from '@/lib/permission'
import { prisma } from '@/lib/prisma'

/**
 * Returns all store IDs accessible to the given user (as owner or employee).
 */
export async function getUserAccessibleStoreIds(
  userId: string,
): Promise<string[]> {
  const userStores = await prisma.store.findMany({
    where: {
      OR: [
        { ownerId: userId },
        { employeeStores: { some: { employee: { userId } } } },
      ],
    },
    select: { id: true },
  })

  return userStores.map((s) => s.id)
}

export interface ResolveStoreFilterParams {
  userId: string
  storeId?: string | null
  permission?: PermissionKey
}

export type ResolveStoreFilterResult =
  | {
      isAuthorized: true
      storeFilter: { storeId: string } | { storeId: { in: string[] } }
    }
  | {
      isAuthorized: false
      storeFilter?: never
    }

/**
 * Validates store access / permissions and returns a Prisma-compatible storeId filter.
 * If storeId is specific, checks permission. If ALL_STORES or unspecified, resolves accessible stores.
 */
export async function resolveStoreFilter({
  userId,
  storeId,
  permission,
}: ResolveStoreFilterParams): Promise<ResolveStoreFilterResult> {
  if (storeId && storeId !== ALL_STORES && storeId !== '') {
    if (permission) {
      const authCheck = await verifyEmployeePermission({
        userId,
        storeId,
        permission,
      })

      if (!authCheck.isAuthorized) {
        return { isAuthorized: false }
      }
    }

    return {
      isAuthorized: true,
      storeFilter: { storeId },
    }
  }

  const storeIds = await getUserAccessibleStoreIds(userId)
  return {
    isAuthorized: true,
    storeFilter: { storeId: { in: storeIds } },
  }
}
