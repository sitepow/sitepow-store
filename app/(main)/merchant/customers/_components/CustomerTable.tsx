'use client'

import { useState } from 'react'

import { useCustomers } from '@/actions/hooks/customer'
import { StorePagination } from '@/app/sites/[domain]/_components/Pagination'
import { CUSTOMER_TYPE_TH } from '@/constants/translate'
import { ALL_STORES, useStoreFilter } from '@/stores/use-store-filter'
import { formatNumber } from '@/utils/pricing'

import { ActionRequiredAlert } from '@/components/ActionRequiredAlert'
import { TableEmptyRow } from '@/components/TableEmptyRow'
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

export function CustomerTable() {
  const { selectedStoreId } = useStoreFilter()
  const [page, setPage] = useState(1)

  const { data: { data: customers = [], meta } = {}, isLoading } = useCustomers(
    {
      storeId: selectedStoreId,
      page,
      limit: 10,
    },
  )

  if (selectedStoreId === ALL_STORES) {
    return <ActionRequiredAlert />
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>รหัสลูกค้า</TableHead>
              <TableHead>ชื่อลูกค้า</TableHead>
              <TableHead>อีเมล</TableHead>
              <TableHead>เบอร์โทร</TableHead>
              <TableHead>ประเภท</TableHead>
              <TableHead className="text-right">แต้มสะสม</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && customers.length === 0 ? (
              <TableLoadingRow colSpan={5} />
            ) : customers.length === 0 ? (
              <TableEmptyRow colSpan={5} title="ยังไม่มีข้อมูลลูกค้า" />
            ) : (
              customers.map((item) => (
                <TableRow key={item.customer.id}>
                  <TableCell>{item.customer.id}</TableCell>
                  <TableCell>
                    {[item.customer.firstName, item.customer.lastName]
                      .filter(Boolean)
                      .join(' ') || '-'}
                  </TableCell>
                  <TableCell>{item.customer.email}</TableCell>
                  <TableCell>{item.customer.phone ?? '-'}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {CUSTOMER_TYPE_TH[item.customer.customerType]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-primary text-right font-semibold">
                    {formatNumber(item.rewardPoints)}
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
