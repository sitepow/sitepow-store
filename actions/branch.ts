'use server'

import { ActorType, LogAction, Prisma } from '@/generated/prisma/client'

import { createLog } from '@/lib/activity-log'
import { prisma } from '@/lib/prisma'

export interface CreateBranchInput {
  name: string
  storeId: string
  isMain?: boolean
}

export interface UpdateBranchInput {
  name?: string
}

interface GetBranchesParams {
  storeId: string
  page?: number
  limit?: number
  search?: string
}

const branchSelect = {
  id: true,
  name: true,
  isMain: true,
  address: true,
  subDistrict: true,
  district: true,
  province: true,
  postcode: true,
  storeId: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.BranchSelect

export type GetBranchesItem = Prisma.BranchGetPayload<{
  select: typeof branchSelect
}>

export interface GetBranchesResponse {
  data: GetBranchesItem[]
  meta: {
    currentPage: number
    limit: number
    totalItems: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}

const branchOptionSelect = {
  id: true,
  name: true,
  isMain: true,
} satisfies Prisma.BranchSelect

export type BranchOption = Prisma.BranchGetPayload<{
  select: typeof branchOptionSelect
}>

export async function getBranchOptions(
  storeId: string,
): Promise<BranchOption[]> {
  try {
    if (!storeId) {
      return []
    }
    return await prisma.branch.findMany({
      where: { storeId },
      orderBy: [{ isMain: 'desc' }, { createdAt: 'asc' }],
      select: branchOptionSelect,
    })
  } catch (error) {
    console.error(error)
    return []
  }
}

export async function getBranches({
  storeId,
  page = 1,
  limit = 10,
  search,
}: GetBranchesParams): Promise<GetBranchesResponse> {
  try {
    const sanitizedPage = Math.max(1, page)
    const sanitizedLimit = Math.max(1, Math.min(20, limit))
    const skip = (sanitizedPage - 1) * sanitizedLimit

    const whereClause: Prisma.BranchWhereInput = { storeId }

    if (search) {
      whereClause.name = { contains: search, mode: 'insensitive' }
    }

    const [totalItems, branches] = await Promise.all([
      prisma.branch.count({ where: whereClause }),
      prisma.branch.findMany({
        where: whereClause,
        skip,
        take: sanitizedLimit,
        orderBy: [{ isMain: 'desc' }, { createdAt: 'asc' }],
        select: branchSelect,
      }),
    ])

    const totalPages = Math.ceil(totalItems / sanitizedLimit)

    return {
      data: branches,
      meta: {
        currentPage: sanitizedPage,
        limit: sanitizedLimit,
        totalItems,
        totalPages,
        hasNextPage: sanitizedPage < totalPages,
        hasPreviousPage: sanitizedPage > 1,
      },
    }
  } catch (error) {
    console.error(error)
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

export async function getBranch(id: string) {
  try {
    if (!id) {
      return null
    }
    return await prisma.branch.findUnique({
      where: { id },
      select: branchSelect,
    })
  } catch (error) {
    console.error(error)
    return null
  }
}

export async function createBranch(input: CreateBranchInput) {
  try {
    const { storeId, isMain = false } = input

    if (isMain) {
      await prisma.branch.updateMany({
        where: { storeId, isMain: true },
        data: { isMain: false },
      })
    }

    const branch = await prisma.branch.create({
      data: input,
      select: branchSelect,
    })

    await createLog({
      action: LogAction.UPDATE_STORE_SETTING,
      actorType: ActorType.MERCHANT,
      storeId,
      entity: 'Branch',
      entityId: branch.id,
      details: {
        name: input.name,
        isMain: input.isMain ?? false,
        type: 'created',
      },
    })

    return { success: true, data: branch }
  } catch (error) {
    console.error(error)
    return { success: false }
  }
}

export async function updateBranch(id: string, input: UpdateBranchInput) {
  try {
    if (!id) {
      return { success: false, message: 'ไม่พบ Branch ID' }
    }

    const updatedBranch = await prisma.branch.update({
      where: { id },
      data: input,
      select: branchSelect,
    })

    await createLog({
      action: LogAction.UPDATE_STORE_SETTING,
      actorType: ActorType.MERCHANT,
      storeId: updatedBranch.storeId,
      entity: 'Branch',
      entityId: id,
      details: { updatedFields: Object.keys(input), type: 'updated' },
    })

    return { success: true, data: updatedBranch }
  } catch (error) {
    console.error(error)
    return { success: false }
  }
}

export async function setMainBranch(id: string, storeId: string) {
  try {
    if (!id) {
      return { success: false, message: 'ไม่พบ Branch ID' }
    }

    await prisma.branch.updateMany({
      where: { storeId, isMain: true },
      data: { isMain: false },
    })

    const updatedBranch = await prisma.branch.update({
      where: { id },
      data: { isMain: true },
      select: branchSelect,
    })

    await createLog({
      action: LogAction.UPDATE_STORE_SETTING,
      actorType: ActorType.MERCHANT,
      storeId,
      entity: 'Branch',
      entityId: id,
      details: { type: 'set_main' },
    })

    return { success: true, data: updatedBranch }
  } catch (error) {
    console.error(error)
    return { success: false }
  }
}

export async function deleteBranch(id: string, storeId: string) {
  try {
    if (!id) {
      return { success: false, message: 'ไม่พบ Branch ID' }
    }

    const branch = await prisma.branch.findUnique({
      where: { id },
      select: { isMain: true },
    })

    if (branch?.isMain) {
      return { success: false, message: 'ไม่สามารถลบสาขาหลักได้' }
    }

    const branchCount = await prisma.branch.count({ where: { storeId } })
    if (branchCount <= 1) {
      return { success: false, message: 'ต้องมีสาขาอย่างน้อย 1 สาขา' }
    }

    await prisma.branch.delete({ where: { id } })

    await createLog({
      action: LogAction.UPDATE_STORE_SETTING,
      actorType: ActorType.MERCHANT,
      storeId,
      entity: 'Branch',
      entityId: id,
      details: { type: 'deleted' },
    })

    return { success: true, message: 'ลบสาขาสำเร็จ' }
  } catch (error) {
    console.error(error)
    return { success: false }
  }
}
