'use client'

import { useState } from 'react'

import { useRouter } from 'next/navigation'

import { useDeleteStore, useStores } from '@/actions/hooks/store'
import { StorePagination } from '@/app/sites/[domain]/_components/Pagination'
import { PLAN_DETAILS } from '@/config/planDetails'
import { StoreStatus } from '@/generated/prisma/enums'
import { useStoreFilter } from '@/stores/use-store-filter'
import { formatDate } from '@/utils/date'
import {
  IconExternalLink,
  IconPackage,
  IconSettings,
} from '@tabler/icons-react'

import { DeleteButton } from '@/components/DeleteButton'
import { TableEmptyRow } from '@/components/TableEmptyRow'
import { TableLoadingRow } from '@/components/TableLoadingRow'
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

export function StoreTable() {
  const { setSelectedStoreId } = useStoreFilter()
  const [page, setPage] = useState(1)
  const router = useRouter()

  const { data: { data: stores = [], meta } = {}, isLoading } = useStores({
    page,
  })
  const deleteStoreMutation = useDeleteStore()

  return (
    <>
      <div className="overflow-hidden rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>รหัส</TableHead>
              <TableHead>ร้านค้า</TableHead>
              <TableHead>แพลน</TableHead>
              <TableHead>สถานะ</TableHead>
              <TableHead>วันที่เปิดใช้งาน</TableHead>
              <TableHead className="text-right">จัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && stores.length === 0 && (
              <TableLoadingRow colSpan={6} />
            )}
            {!isLoading && stores.length === 0 && (
              <TableEmptyRow colSpan={6} title="ไม่พบข้อมูลร้านค้าของคุณ" />
            )}
            {stores.length !== 0 &&
              stores.map((store) => {
                const isActive = store.status === StoreStatus.ACTIVE
                const isMaintenance = store.status === StoreStatus.MAINTENANCE

                const formattedDate = store.createdAt
                  ? formatDate(store.createdAt)
                  : '-'

                return (
                  <TableRow key={store.id}>
                    <TableCell>{store.id}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-foreground font-medium">
                          {store.name}
                        </span>
                        <div className="text-muted-foreground flex items-center gap-1.5 text-sm">
                          <span>sitepow.store/{store.slug}</span>
                          <a
                            href={`https://${store.slug}.sitepow.store`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-primary text-muted-foreground/70 transition-colors"
                          >
                            <IconExternalLink size={16} />
                          </a>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge>
                        {PLAN_DETAILS[store.plan]?.name || store.plan}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          isActive
                            ? 'default'
                            : isMaintenance
                              ? 'outline'
                              : 'destructive'
                        }
                      >
                        {isActive
                          ? 'เปิดใช้งานอยู่'
                          : isMaintenance
                            ? 'ปิดปรับปรุงชั่วคราว'
                            : 'ถูกระงับการใช้งาน'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {formattedDate}
                    </TableCell>
                    <TableCell className="space-x-2 text-right">
                      <Button
                        variant="outline"
                        size="icon-lg"
                        onClick={() => {
                          setSelectedStoreId(store.id)
                          router.push('/merchant/settings')
                        }}
                      >
                        <IconSettings />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon-lg"
                        onClick={() =>
                          router.push('/merchant/store-settings/products')
                        }
                      >
                        <IconPackage />
                      </Button>
                      <DeleteButton
                        isPending={false}
                        onDelete={() => deleteStoreMutation.mutate(store.id)}
                      />
                    </TableCell>
                  </TableRow>
                )
              })}
          </TableBody>
        </Table>
      </div>
      {meta && (
        <StorePagination
          currentPage={meta.currentPage}
          totalPages={meta.totalPages}
          hasNextPage={meta.hasNextPage}
          hasPreviousPage={meta.hasPreviousPage}
          onPageChange={(targetPage) => setPage(targetPage)}
        />
      )}
    </>
  )
}
