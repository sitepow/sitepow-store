'use client'

import * as React from 'react'

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'

interface StorePaginationProps {
  currentPage?: number
  totalPages?: number
  hasNextPage?: boolean
  hasPreviousPage?: boolean
  onPageChange: (page: number) => void
}

export function StorePagination({
  currentPage = 1,
  totalPages = 1,
  hasNextPage = false,
  hasPreviousPage = false,
  onPageChange,
}: StorePaginationProps) {
  if (totalPages <= 1) {
    return null
  }

  const renderPages = () => {
    const items: React.ReactNode[] = []

    const makePage = (page: number) => (
      <PaginationItem key={page}>
        <PaginationLink
          className="cursor-pointer select-none"
          isActive={currentPage === page}
          onClick={() => onPageChange(page)}
        >
          {page}
        </PaginationLink>
      </PaginationItem>
    )

    const makeEllipsis = (key: string) => (
      <PaginationItem key={key}>
        <PaginationEllipsis />
      </PaginationItem>
    )

    const windowStart = Math.max(2, currentPage - 1)
    const windowEnd = Math.min(totalPages - 1, currentPage + 1)

    items.push(makePage(1))

    if (windowStart > 2) items.push(makeEllipsis('left-ellipsis'))

    for (let p = windowStart; p <= windowEnd; p++) {
      items.push(makePage(p))
    }

    if (windowEnd < totalPages - 1) items.push(makeEllipsis('right-ellipsis'))

    items.push(makePage(totalPages))

    return items
  }

  return (
    <Pagination className="mt-4">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            text="ก่อนหน้า"
            className={
              !hasPreviousPage
                ? 'pointer-events-none opacity-50'
                : 'cursor-pointer select-none'
            }
            onClick={() => hasPreviousPage && onPageChange(currentPage - 1)}
          />
        </PaginationItem>
        {renderPages()}
        <PaginationItem>
          <PaginationNext
            text="ถัดไป"
            className={
              !hasNextPage
                ? 'pointer-events-none opacity-50'
                : 'cursor-pointer select-none'
            }
            onClick={() => hasNextPage && onPageChange(currentPage + 1)}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}
