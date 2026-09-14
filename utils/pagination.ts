import { PaginatedResponse, PaginationMeta } from '@/types/pagination'

export interface SanitizePaginationOptions {
  defaultLimit?: number
  maxLimit?: number
}

/**
 * Sanitizes page and limit input, calculating skip and take for database queries.
 */
export function sanitizePagination(
  page?: number,
  limit?: number,
  options?: SanitizePaginationOptions,
) {
  const defaultLimit = options?.defaultLimit ?? 10
  const maxLimit = options?.maxLimit ?? 50

  const sanitizedPage = Math.max(1, Number(page) || 1)
  const sanitizedLimit = Math.max(
    1,
    Math.min(maxLimit, Number(limit) || defaultLimit),
  )
  const skip = (sanitizedPage - 1) * sanitizedLimit

  return {
    page: sanitizedPage,
    limit: sanitizedLimit,
    skip,
    take: sanitizedLimit,
  }
}

/**
 * Creates a standard PaginationMeta object from totalItems, page, and limit.
 */
export function createPaginationMeta(
  totalItems: number,
  page: number,
  limit: number,
): PaginationMeta {
  const totalPages = Math.ceil(totalItems / (limit || 1))
  return {
    currentPage: page,
    limit,
    totalItems,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  }
}

/**
 * Creates an empty PaginatedResponse with safe default meta.
 */
export function getEmptyPaginatedResponse<T>(
  page = 1,
  limit = 10,
): PaginatedResponse<T> {
  return {
    data: [],
    meta: {
      currentPage: Math.max(1, page),
      limit: Math.max(1, limit),
      totalItems: 0,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false,
    },
  }
}
