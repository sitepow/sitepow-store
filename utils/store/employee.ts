import {
  PERMISSION_MAPPING,
  ROLE_PERMISSION_PRESETS,
} from '@/constants/store/permission'
import { PermissionKey } from '@/types/store'

export interface EmployeePermissionItem {
  id: string
  domain: string
  action: string
}

export interface ExtractEmployeeStoreDataResult {
  roleNames: string[]
  uniquePermissions: EmployeePermissionItem[]
  displayedRoles: string[]
  remainingRolesCount: number
  displayedPermissions: EmployeePermissionItem[]
  remainingPermissionsCount: number
}

export function extractEmployeeStoreData(
  branches: {
    role?: {
      name?: string
      permissions?: { permission?: EmployeePermissionItem | null }[]
    } | null
    customPermissions?: { permission?: EmployeePermissionItem | null }[]
  }[] = [],
  maxRoles = 2,
  maxPermissions = 3,
): ExtractEmployeeStoreDataResult {
  const permissionsMap = new Map<string, EmployeePermissionItem>()
  const rolesSet = new Set<string>()

  branches.forEach((branchAssignment) => {
    if (branchAssignment.role?.name) {
      rolesSet.add(branchAssignment.role.name)
    }

    branchAssignment.role?.permissions?.forEach(({ permission }) => {
      if (permission) {
        permissionsMap.set(permission.id, permission)
      }
    })

    branchAssignment.customPermissions?.forEach(({ permission }) => {
      if (permission) {
        permissionsMap.set(permission.id, permission)
      }
    })
  })

  const roleNames = Array.from(rolesSet)
  const uniquePermissions = Array.from(permissionsMap.values())

  return {
    roleNames,
    uniquePermissions,
    displayedRoles: roleNames.slice(0, maxRoles),
    remainingRolesCount: Math.max(0, roleNames.length - maxRoles),
    displayedPermissions: uniquePermissions.slice(0, maxPermissions),
    remainingPermissionsCount: Math.max(
      0,
      uniquePermissions.length - maxPermissions,
    ),
  }
}

interface PermissionItem {
  id: string
  domain: string
  action: string
}

export function mapEmployeeDataToFormValues(
  employeeData?: {
    employee?: { name?: string | null; email?: string | null } | null
    branches?:
      | {
          branch: { id: string }
          roleId?: string | null
          role?: {
            id?: string | null
            name?: string | null
            permissions?:
              | {
                  permission?: { id: string } | null
                  permissionId?: string | null
                }[]
              | null
          } | null
          customPermissions?:
            | {
                permissionId?: string | null
                permission?: { id: string } | null
              }[]
            | null
          rolePermissions?:
            | {
                permission?: { id: string } | null
                permissionId?: string | null
              }[]
            | null
        }[]
      | null
  } | null,
) {
  if (!employeeData) {
    return {
      name: '',
      email: '',
      assignments: [],
    }
  }

  const mappedAssignments =
    employeeData.branches?.map((b) => {
      const extractedIds: string[] = []

      b.customPermissions?.forEach((cp) => {
        const pId = cp.permissionId || cp.permission?.id
        if (pId) extractedIds.push(pId)
      })

      b.rolePermissions?.forEach((rp) => {
        const pId = rp.permissionId || rp.permission?.id
        if (pId) extractedIds.push(pId)
      })

      b.role?.permissions?.forEach((pItem) => {
        const pId = pItem.permissionId || pItem.permission?.id
        if (pId) extractedIds.push(pId)
      })

      return {
        branchId: b.branch.id,
        roleId: b.role?.id || b.roleId || '',
        permissionIds: Array.from(new Set(extractedIds)),
      }
    }) ?? []

  return {
    name: employeeData.employee?.name ?? '',
    email: employeeData.employee?.email ?? '',
    assignments: mappedAssignments,
  }
}

export function getPresetPermissionIds(
  roleName: string,
  allPermissions: PermissionItem[],
): string[] {
  const normalizedRoleName = roleName.toUpperCase()
  const presetKeys = ROLE_PERMISSION_PRESETS[normalizedRoleName] ?? []

  return presetKeys
    .map((key) => {
      const target = PERMISSION_MAPPING[key as PermissionKey]
      if (!target) {
        return null
      }
      return allPermissions.find(
        (p) => p.domain === target.domain && p.action === target.action,
      )?.id
    })
    .filter(Boolean) as string[]
}
