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

const staffSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
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
} satisfies Prisma.StaffSelect

export type GetStaffsItem = Prisma.StaffGetPayload<{
  select: typeof staffSelect
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

    const whereClause: Prisma.StaffWhereInput = { storeId }

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (role) {
      whereClause.role = role
    }

    const [totalItems, staffs] = await Promise.all([
      prisma.staff.count({ where: whereClause }),
      prisma.staff.findMany({
        where: whereClause,
        skip,
        take: sanitizedLimit,
        select: staffSelect,
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
    const existing = await prisma.staff.findUnique({
      where: { email: input.email },
      select: { id: true },
    })

    if (existing) {
      return { success: false, message: 'อีเมลนี้ถูกใช้งานไปแล้ว' }
    }

    const user = await prisma.user.create({
      data: {
        email: input.email,
        name: input.name,
        role: UserRole.MERCHANT,
      },
      select: { id: true },
    })

    const staff = await prisma.staff.create({
      data: {
        name: input.name,
        email: input.email,
        role: input.role,
        storeId: input.storeId,
        userId: user.id,
        branches: {
          create: input.branchIds.map((branchId) => ({ branchId })),
        },
      },
      select: staffSelect,
    })

    return { success: true, message: 'บันทึกข้อมูลสำเร็จแล้ว', data: staff }
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

    const updated = await prisma.staff.update({
      where: { id },
      data: {
        name: input.name,
        role: input.role,
        ...(input.branchIds && {
          branches: {
            deleteMany: {},
            create: input.branchIds.map((branchId) => ({ branchId })),
          },
        }),
      },
      select: staffSelect,
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

    await prisma.staff.delete({ where: { id } })

    return { success: true, message: 'ลบพนักงานสำเร็จ' }
  } catch (error) {
    console.error(error)
    return { success: false }
  }
}
