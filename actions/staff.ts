'use server'

import { Prisma } from '@/generated/prisma/client'
import { StaffRole, UserRole } from '@/generated/prisma/enums'

import { prisma } from '@/lib/prisma'

export interface CreateStaffInput {
  storeId: string
  name: string
  email: string
  role: StaffRole
  branchIds: string[]
}

export interface UpdateStaffInput {
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

    return {
      success: true,
      message: 'บันทึกข้อมูลสำเร็จแล้ว',
      data: staffStore,
    }
  } catch (error) {
    console.error(error)
    return { success: false }
  }
}

export async function updateStaff(id: string, input: UpdateStaffInput) {
  try {
    if (!id) {
      return { success: false, message: 'ไม่พบ Staff ID' }
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

    return { success: true, message: 'บันทึกข้อมูลสำเร็จแล้ว', data: updated }
  } catch (error) {
    console.error(error)
    return { success: false }
  }
}

export async function deleteStaff(id: string) {
  try {
    if (!id) {
      return { success: false, message: 'ไม่พบ Staff ID' }
    }

    await prisma.staffStore.delete({ where: { id } })

    return { success: true, message: 'ลบพนักงานออกจากร้านสำเร็จ' }
  } catch (error) {
    console.error(error)
    return { success: false }
  }
}
