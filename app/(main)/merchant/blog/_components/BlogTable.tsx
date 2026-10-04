'use client'

import { useState } from 'react'

import Link from 'next/link'

import { useBlogs, useDeleteBlog } from '@/actions/catalog/blog/hooks'
import { useEmployeePermission } from '@/actions/store/employee/hooks'
import { StorePagination } from '@/app/sites/[domain]/_components/Pagination'
import { ALL_STORES, useStoreFilter } from '@/stores/use-store-filter'
import { IconEdit, IconTag } from '@tabler/icons-react'

import { ActionRequiredAlert } from '@/components/shared/ActionRequiredAlert'
import { DeleteButton } from '@/components/shared/DeleteButton'
import { TableEmptyRow } from '@/components/table/TableEmptyRow'
import { TableLoadingRow } from '@/components/table/TableLoadingRow'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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

  const { canUpdateBlogs, canDeleteBlogs } = useEmployeePermission()

  const { data: { data: blogs = [], meta } = {}, isLoading } = useBlogs({
    storeId: selectedStoreId,
    page,
    limit: 10,
  })

  const { mutate: deleteBlog, isPending: isDeleting } = useDeleteBlog()

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
              <TableHead>ชื่อบทความ</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>แท็ก</TableHead>
              {(canUpdateBlogs || canDeleteBlogs) && (
                <TableHead className="text-right">จัดการ</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && blogs.length === 0 ? (
              <TableLoadingRow colSpan={5} />
            ) : blogs.length === 0 ? (
              <TableEmptyRow colSpan={5} title="ยังไม่มีบทความ" />
            ) : (
              blogs.map((blog) => (
                <TableRow key={blog.id}>
                  <TableCell>{blog.id}</TableCell>
                  <TableCell className="max-w-72 min-w-72 wrap-break-word whitespace-pre-line">
                    {blog.title}
                  </TableCell>
                  <TableCell>{blog.slug}</TableCell>
                  <TableCell className="max-w-72 min-w-72 wrap-break-word whitespace-pre-line">
                    <div className="flex flex-wrap gap-1">
                      {blog.tags.length === 0 ? (
                        <span className="text-muted-foreground">-</span>
                      ) : (
                        blog.tags.map((tag) => (
                          <Badge key={tag} variant="outline">
                            <IconTag />
                            {tag}
                          </Badge>
                        ))
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {canUpdateBlogs && (
                        <Button variant="outline" size="icon-lg" asChild>
                          <Link href={`/merchant/blog/create/${blog.id}`}>
                            <IconEdit className="size-4" />
                          </Link>
                        </Button>
                      )}
                      {canDeleteBlogs && (
                        <DeleteButton
                          isPending={isDeleting}
                          onDelete={() => deleteBlog(blog.id)}
                        />
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
