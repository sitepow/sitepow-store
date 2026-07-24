'use server'

import { Prisma } from '@/generated/prisma/client'
import {
  ActorType,
  LogAction,
  StaffRole,
  UserRole,
} from '@/generated/prisma/enums'
import { ALL_STORES } from '@/stores/use-store-filter'
import { PermissionKey, checkPermission } from '@/types/permission'

import { createLog } from '@/lib/activity-log'
import { auth } from '@/lib/auth'
import { verifyStaffPermission } from '@/lib/auth-guard'
import { prisma } from '@/lib/prisma'

export interface CreateStaffInput {
  storeId: string
  name: string
  email: string
  role: StaffRole
  branchIds: string[]
}

export interface UpdateStaffInput {
  storeId: string
  name?: string
  role?: StaffRole
  branchIds: string[]
}

interface GetStaffsParams {
  storeId: string
  page?: number
  limit?: number
  search?: string
  role?: StaffRole
}

export interface CurrentStaffInfo {
  id: string
  name: string
  email: string
  role: StaffRole
  permissions: Record<PermissionKey, boolean>
}

const staffStoreSelect = {
  id: true,
  role: true,
  staff: {
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
} satisfies Prisma.StaffStoreSelect

export type GetStaffsItem = Prisma.StaffStoreGetPayload<{
  select: typeof staffStoreSelect
}>

export interface GetStaffsResponse {
  data: GetStaffsItem[]
  meta: {
    currentPage: number
    limit: number
    totalItems: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}

export async function getStaffs({
  storeId,
  page = 1,
  limit = 10,
  search,
  role,
}: GetStaffsParams): Promise<GetStaffsResponse> {
  try {
    const session = await auth()
    const userId = session?.user?.id

    if (!userId) {
      return {
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
    }

    const authCheck = await verifyStaffPermission({
      userId,
      storeId,
      permission: 'canManageStaff',
    })

    if (!authCheck.isAuthorized) {
      return {
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
    }

    const sanitizedPage = Math.max(1, page)
    const sanitizedLimit = Math.max(1, Math.min(20, limit))
    const skip = (sanitizedPage - 1) * sanitizedLimit

    const whereClause: Prisma.StaffStoreWhereInput = { storeId }

    if (search) {
      whereClause.staff = {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      }
    }

    if (role) {
      whereClause.role = role
    }

    const [totalItems, staffs] = await Promise.all([
      prisma.staffStore.count({ where: whereClause }),
      prisma.staffStore.findMany({
        where: whereClause,
        skip,
        take: sanitizedLimit,
        select: staffStoreSelect,
      }),
    ])

    const totalPages = Math.ceil(totalItems / sanitizedLimit)

    return {
      data: staffs,
      meta: {
        currentPage: sanitizedPage,
        limit: sanitizedLimit,
        totalItems,
        totalPages,
        hasNextPage: sanitizedPage < totalPages,
        hasPreviousPage: sanitizedPage > 1,
      },
    }
  } catch {
    return {
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
  }
}

export async function createStaff(input: CreateStaffInput) {
  try {
    const session = await auth()
    const userId = session?.user?.id

    if (!userId) {
      return { success: false, message: 'กรุณาเข้าสู่ระบบก่อนทำรายการ' }
    }

    const authCheck = await verifyStaffPermission({
      userId,
      storeId: input.storeId,
      permission: 'canManageStaff',
    })

    if (!authCheck.isAuthorized) {
      return {
        success: false,
        message: authCheck.message || 'สิทธิ์การใช้งานของคุณไม่เพียงพอ',
      }
    }

    let staff = await prisma.staff.findUnique({
      where: { email: input.email },
      select: { id: true },
    })

    if (staff) {
      const alreadyInStore = await prisma.staffStore.findUnique({
        where: {
          staffId_storeId: { staffId: staff.id, storeId: input.storeId },
        },
        select: { id: true },
      })

      if (alreadyInStore) {
        return { success: false, message: 'พนักงานคนนี้อยู่ในร้านนี้แล้ว' }
      }
    } else {
      const user = await prisma.user.create({
        data: {
          email: input.email,
          name: input.name,
          role: UserRole.MERCHANT,
        },
        select: { id: true },
      })

      staff = await prisma.staff.create({
        data: {
          name: input.name,
          email: input.email,
          userId: user.id,
        },
        select: { id: true },
      })
    }

    const staffStore = await prisma.staffStore.create({
      data: {
        role: input.role,
        staffId: staff.id,
        storeId: input.storeId,
        branches: {
          create: input.branchIds.map((branchId) => ({ branchId })),
        },
      },
      select: staffStoreSelect,
    })

    await createLog({
      action: LogAction.MANAGE_STAFF,
      actorType: ActorType.MERCHANT,
      storeId: input.storeId,
      entity: 'Staff',
      entityId: staffStore.staff.id,
      details: {
        name: input.name,
        email: input.email,
        role: input.role,
        type: 'created',
      },
    })

    return {
      success: true,
      message: 'บันทึกข้อมูลสำเร็จแล้ว',
      data: staffStore,
    }
  } catch (error) {
    console.error(error)
    return { success: false, message: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล' }
  }
}

export async function updateStaff(id: string, input: UpdateStaffInput) {
  try {
    if (!id) {
      return { success: false, message: 'ไม่พบ Staff ID' }
    }

    const session = await auth()
    const userId = session?.user?.id

    if (!userId) {
      return { success: false, message: 'กรุณาเข้าสู่ระบบก่อนทำรายการ' }
    }

    const authCheck = await verifyStaffPermission({
      userId,
      storeId: input.storeId,
      permission: 'canManageStaff',
    })

    if (!authCheck.isAuthorized) {
      return {
        success: false,
        message: authCheck.message || 'สิทธิ์การใช้งานของคุณไม่เพียงพอ',
      }
    }

    const updated = await prisma.staffStore.update({
      where: { id },
      data: {
        role: input.role,
        ...(input.branchIds && {
          branches: {
            deleteMany: {},
            create: input.branchIds.map((branchId) => ({ branchId })),
          },
        }),
        ...(input.name && {
          staff: { update: { name: input.name } },
        }),
      },
      select: staffStoreSelect,
    })

    await createLog({
      action: LogAction.MANAGE_STAFF,
      actorType: ActorType.MERCHANT,
      storeId: updated.store?.id,
      entity: 'Staff',
      entityId: updated.staff.id,
      details: { updatedFields: Object.keys(input), type: 'updated' },
    })

    return { success: true, message: 'บันทึกข้อมูลสำเร็จแล้ว', data: updated }
  } catch (error) {
    console.error(error)
    return { success: false, message: 'เกิดข้อผิดพลาดในการอัปเดตข้อมูล' }
  }
}

export async function deleteStaff(id: string) {
  try {
    if (!id) {
      return { success: false, message: 'ไม่พบ Staff ID' }
    }

    const staffStore = await prisma.staffStore.findUnique({
      where: { id },
      select: { storeId: true, staffId: true },
    })

    if (!staffStore) {
      return { success: false, message: 'ไม่พบข้อมูลพนักงาน' }
    }

    const session = await auth()
    const userId = session?.user?.id

    if (!userId) {
      return { success: false, message: 'กรุณาเข้าสู่ระบบก่อนทำรายการ' }
    }

    const authCheck = await verifyStaffPermission({
      userId,
      storeId: staffStore.storeId,
      permission: 'canManageStaff',
    })

    if (!authCheck.isAuthorized) {
      return {
        success: false,
        message: authCheck.message || 'สิทธิ์การใช้งานของคุณไม่เพียงพอ',
      }
    }

    await prisma.staffStore.delete({ where: { id } })

    await createLog({
      action: LogAction.MANAGE_STAFF,
      actorType: ActorType.MERCHANT,
      storeId: staffStore.storeId,
      entity: 'Staff',
      entityId: staffStore.staffId,
      details: { type: 'deleted' },
    })

    return { success: true, message: 'ลบพนักงานออกจากร้านสำเร็จ' }
  } catch (error) {
    console.error(error)
    return { success: false }
  }
}

export async function getCurrentStaffInfo(
  storeId: string,
): Promise<CurrentStaffInfo | null> {
  try {
    if (!storeId || storeId === ALL_STORES) {
      return null
    }

    const session = await auth()
    const userId = session?.user?.id

    if (!userId) {
      return null
    }

    const currentStaffStore = await prisma.staffStore.findFirst({
      where: {
        storeId,
        staff: {
          userId,
        },
      },
      include: {
        staff: true,
      },
    })

    if (!currentStaffStore || !currentStaffStore.staff) {
      return null
    }

    const staffProfile = currentStaffStore.staff
    const role = currentStaffStore.role

    const permissions: Record<PermissionKey, boolean> = {
      canManageStaff: checkPermission(role, 'canManageStaff'),
      canManageProducts: checkPermission(role, 'canManageProducts'),
      canManageInventory: checkPermission(role, 'canManageInventory'),
      canManageStock: checkPermission(role, 'canManageStock'),
      canCreateOrder: true,
      canManageOrders: checkPermission(role, 'canManageOrders'),
      canCancelOrder: checkPermission(role, 'canCancelOrder'),
      canManageCoupons: checkPermission(role, 'canManageCoupons'),
      canManageCustomers: checkPermission(role, 'canManageCustomers'),
      canManageStoreSettings: checkPermission(role, 'canManageStoreSettings'),
      canViewFinance: checkPermission(role, 'canViewFinance'),
      canViewActivityLogs: checkPermission(role, 'canViewActivityLogs'),
    }

    return {
      id: staffProfile.id,
      name: staffProfile.name,
      email: staffProfile.email,
      role,
      permissions,
    }
  } catch (error) {
    console.error(error)
    return null
  }
}
