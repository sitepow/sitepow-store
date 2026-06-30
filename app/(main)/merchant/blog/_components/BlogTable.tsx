'use client'

import { useState } from 'react'

import { useBlogs } from '@/actions/hooks/blog'
import { StorePagination } from '@/app/sites/[domain]/_components/Pagination'
import { ALL_STORES, useStoreFilter } from '@/stores/use-store-filter'

import { ActionRequiredAlert } from '@/components/ActionRequiredAlert'
import { TableEmptyRow } from '@/components/TableEmptyRow'
import { TableImage } from '@/components/TableImage'
import { TableLoadingRow } from '@/components/TableLoadingRow'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export function BlogTable() {
  const { selectedStoreId } = useStoreFilter()
  const [page, setPage] = useState(1)

  const { data: { data: blogs = [], meta } = {}, isLoading } = useBlogs({
    storeId: selectedStoreId,
    page,
    limit: 10,
  })

  if (selectedStoreId === ALL_STORES) {
    return <ActionRequiredAlert />
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>รหัสบทความ</TableHead>
              <TableHead>รูปภาพบทความ</TableHead>
              <TableHead>ชื่อบทความ</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>แท็ก</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && blogs.length === 0 ? (
              <TableLoadingRow colSpan={3} />
            ) : blogs.length === 0 ? (
              <TableEmptyRow colSpan={3} title="ยังไม่มีบทความ" />
            ) : (
              blogs.map((blog) => (
                <TableRow key={blog.id}>
                  <TableCell>{blog.id}</TableCell>
                  <TableCell>
                    <TableImage />
                  </TableCell>
                  <TableCell>{blog.title}</TableCell>
                  <TableCell>{blog.slug}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {blog.tags.length === 0 ? (
                        <span className="text-muted-foreground text-sm">-</span>
                      ) : (
                        blog.tags.map((tag) => (
                          <Badge key={tag} variant="outline">
                            {tag}
                          </Badge>
                        ))
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      {meta && meta.totalPages > 1 && (
        <StorePagination
          currentPage={meta.currentPage}
          totalPages={meta.totalPages}
          hasNextPage={meta.hasNextPage}
          hasPreviousPage={meta.hasPreviousPage}
          onPageChange={(newPage) => setPage(newPage)}
        />
      )}
    </>
  )
}
