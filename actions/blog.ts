'use server'

import { ActorType, LogAction, Prisma } from '@/generated/prisma/client'
import { ALL_STORES } from '@/stores/use-store-filter'
import { getPathR2FromUrl } from '@/utils/image'

import { createLog } from '@/lib/activity-log'
import { auth } from '@/lib/auth'
import { verifyEmployeePermission } from '@/lib/permission'
import { prisma } from '@/lib/prisma'

import { invalidateBlogCache } from './query-keys/invalidation/blog'
import { r2DeleteImage } from './r2'

export interface CreateBlogInput {
  storeId: string
  title: string
  slug: string
  content: string
  image: string
  tags?: string[]
}

const blogSelect = {
  id: true,
  title: true,
  slug: true,
  image: true,
  tags: true,
  createdAt: true,
  updatedAt: true,
  store: {
    select: {
      id: true,
      name: true,
      slug: true,
    },
  },
} satisfies Prisma.BlogSelect

export type GetBlogsItem = Prisma.BlogGetPayload<{
  select: typeof blogSelect
}>

export interface GetBlogsParams {
  storeId?: string
  page?: number
  limit?: number
  search?: string
}

export interface GetBlogsResponse {
  data: GetBlogsItem[]
  meta: {
    currentPage: number
    limit: number
    totalItems: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}

export async function getBlogs({
  storeId,
  page = 1,
  limit = 10,
  search,
}: GetBlogsParams): Promise<GetBlogsResponse> {
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

  try {
    if (storeId && storeId !== ALL_STORES && storeId !== '') {
      const authCheck = await verifyEmployeePermission({
        userId,
        storeId,
        permission: 'canViewBlogs',
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
    }

    const sanitizedPage = Math.max(1, page)
    const sanitizedLimit = Math.max(1, Math.min(50, limit))
    const skip = (sanitizedPage - 1) * sanitizedLimit

    const whereClause: Prisma.BlogWhereInput = {}

    if (storeId && storeId !== 'all' && storeId !== '') {
      whereClause.storeId = storeId
    } else {
      const userStores = await prisma.store.findMany({
        where: {
          OR: [
            { ownerId: userId },
            { employeeStores: { some: { employee: { userId } } } },
          ],
        },
        select: { id: true },
      })

      const storeIds = userStores.map((s) => s.id)
      whereClause.storeId = { in: storeIds }
    }

    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [totalItems, blogs] = await Promise.all([
      prisma.blog.count({ where: whereClause }),
      prisma.blog.findMany({
        where: whereClause,
        skip,
        take: sanitizedLimit,
        orderBy: {
          createdAt: 'desc',
        },
        select: blogSelect,
      }),
    ])

    const totalPages = Math.ceil(totalItems / sanitizedLimit)

    return {
      data: blogs,
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

export async function createBlog(input: CreateBlogInput) {
  try {
    const session = await auth()
    const userId = session?.user?.id

    if (!userId) {
      return { success: false, message: 'กรุณาเข้าสู่ระบบก่อนทำรายการ' }
    }

    const authCheck = await verifyEmployeePermission({
      userId,
      storeId: input.storeId,
      permission: 'canCreateBlogs',
    })

    if (!authCheck.isAuthorized) {
      return {
        success: false,
        message: authCheck.message || 'สิทธิ์การใช้งานของคุณไม่เพียงพอ',
      }
    }

    const blog = await prisma.blog.create({
      data: {
        storeId: input.storeId,
        title: input.title,
        slug: input.slug,
        content: input.content,
        image: input.image,
        tags: input.tags ?? [],
      },
      select: blogSelect,
    })

    await createLog({
      action: LogAction.CREATE_BLOG,
      actorType: ActorType.MERCHANT,
      storeId: input.storeId,
      entity: 'Blog',
      entityId: blog.id,
      details: { title: blog.title, slug: blog.slug },
    })

    await invalidateBlogCache(blog.store.slug)

    return { success: true, message: 'สร้างบทความสำเร็จแล้ว' }
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return {
          success: false,
          message: 'บทความนี้มี slug ซ้ำกับบทความอื่นในระบบแล้ว',
        }
      }
    }
    console.error(error)
    return { success: false }
  }
}

export async function getBlogById(id: string) {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) {
    return null
  }

  try {
    const blog = await prisma.blog.findUnique({
      where: { id },
      include: {
        store: { select: { id: true, slug: true } },
      },
    })

    if (!blog) {
      return null
    }

    const authCheck = await verifyEmployeePermission({
      userId,
      storeId: blog.storeId,
      permission: 'canViewBlogs',
    })

    if (!authCheck.isAuthorized) {
      return null
    }

    return blog
  } catch (error) {
    console.error(error)
    return null
  }
}

export async function updateBlog(id: string, input: CreateBlogInput) {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) {
    return { success: false, message: 'กรุณาเข้าสู่ระบบก่อนทำรายการ' }
  }

  try {
    const existingBlog = await prisma.blog.findUnique({
      where: { id },
      select: { storeId: true },
    })

    if (!existingBlog) {
      return { success: false, message: 'ไม่พบบทความ' }
    }

    const authCheck = await verifyEmployeePermission({
      userId,
      storeId: existingBlog.storeId,
      permission: 'canUpdateBlogs',
    })

    if (!authCheck.isAuthorized) {
      return {
        success: false,
        message: authCheck.message || 'สิทธิ์การใช้งานของคุณไม่เพียงพอ',
      }
    }

    const updatedBlog = await prisma.blog.update({
      where: { id },
      data: {
        title: input.title,
        slug: input.slug,
        content: input.content,
        image: input.image,
        tags: input.tags ?? [],
      },
      select: {
        id: true,
        title: true,
        slug: true,
        store: {
          select: {
            slug: true,
          },
        },
      },
    })

    await createLog({
      action: LogAction.UPDATE_BLOG,
      actorType: ActorType.MERCHANT,
      storeId: existingBlog.storeId,
      entity: 'Blog',
      entityId: id,
      details: { title: updatedBlog.title, slug: updatedBlog.slug },
    })

    await invalidateBlogCache(updatedBlog.store.slug)

    return { success: true, message: 'อัปเดตบทความสำเร็จ' }
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return {
          success: false,
          message: 'บทความนี้มี slug ซ้ำกับบทความอื่นในระบบแล้ว',
        }
      }
    }
    console.error(error)
    return { success: false }
  }
}

export async function deleteBlog(id: string) {
  try {
    const session = await auth()
    const userId = session?.user?.id

    if (!userId) {
      return { success: false, message: 'กรุณาเข้าสู่ระบบก่อนทำรายการ' }
    }

    const blog = await prisma.blog.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        storeId: true,
        image: true,
        store: {
          select: {
            slug: true,
          },
        },
      },
    })

    if (!blog) {
      return { success: false, message: 'ไม่พบบทความ' }
    }

    const authCheck = await verifyEmployeePermission({
      userId,
      storeId: blog.storeId,
      permission: 'canDeleteBlogs',
    })

    if (!authCheck.isAuthorized) {
      return {
        success: false,
        message: authCheck.message || 'สิทธิ์การใช้งานของคุณไม่เพียงพอ',
      }
    }

    if (blog.image) {
      const key = getPathR2FromUrl(blog.image)
      if (key) {
        await r2DeleteImage(key)
      }
    }

    await prisma.blog.delete({ where: { id } })

    await createLog({
      action: LogAction.DELETE_BLOG,
      actorType: ActorType.MERCHANT,
      storeId: blog.storeId,
      entity: 'Blog',
      entityId: id,
      details: { title: blog.title },
    })

    await invalidateBlogCache(blog.store.slug)

    return { success: true, message: 'ลบบทความสำเร็จ' }
  } catch (error) {
    console.error(error)
    return { success: false }
  }
}
