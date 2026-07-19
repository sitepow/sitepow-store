'use client'

import { useState } from 'react'

import { useRouter } from 'next/navigation'

import { useDeleteStore, useStores } from '@/actions/hooks/store'
import { StorePagination } from '@/app/sites/[domain]/_components/Pagination'
import { PLAN_DETAILS } from '@/constants/plan'
import { StoreStatus } from '@/generated/prisma/enums'
import { useStoreFilter } from '@/stores/use-store-filter'
import { formatDateTime } from '@/utils/date'
import { getSubscriptionStatusInfo } from '@/utils/pricing'
import {
  IconAlertTriangle,
  IconCreditCard,
  IconExternalLink,
  IconHierarchy2,
  IconPackage,
  IconSettings,
} from '@tabler/icons-react'

import { DeleteButton } from '@/components/DeleteButton'
import { TableEmptyRow } from '@/components/TableEmptyRow'
import { TableLoadingRow } from '@/components/TableLoadingRow'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
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
              <TableHead>รหัสร้านค้า</TableHead>
              <TableHead>ร้านค้า</TableHead>
              <TableHead>แพลน</TableHead>
              <TableHead>สถานะ</TableHead>
              <TableHead>สถานะและระยะเวลาคงเหลือ</TableHead>
              <TableHead>สิทธิ์การใช้งาน (ปัจจุบัน)</TableHead>
              <TableHead>วันที่สร้างร้านค้า</TableHead>
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
                  ? formatDateTime(store.createdAt)
                  : '-'

                const { isPastDue, isCanceled, daysRemaining, progressValue } =
                  getSubscriptionStatusInfo(store.subscription)

                return (
                  <TableRow key={store.id}>
                    <TableCell>{store.id}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{store.name}</span>
                        <a
                          href={`https://${store.slug}.sitepow.store`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className=""
                        >
                          <div className="hover:text-primary flex items-center gap-1.5">
                            <span>sitepow.store/{store.slug}</span>
                            <IconExternalLink size={16} />
                          </div>
                        </a>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge>
                        {PLAN_DETAILS[store.plan]?.name || store.plan}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={isActive ? 'default' : 'outline'}>
                        {isActive
                          ? 'เปิดใช้งานอยู่'
                          : isMaintenance
                            ? 'ปิดปรับปรุงชั่วคราว'
                            : 'ถูกระงับการใช้งาน'}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-75">
                      {isPastDue ? (
                        <div className="flex flex-col space-y-1.5">
                          <div className="text-destructive flex items-center gap-1 text-sm">
                            <IconAlertTriangle size={16} />
                            <span>เกินกำหนดชำระ ({daysRemaining} วัน)</span>
                          </div>
                          <Progress value={progressValue} className="h-1" />
                        </div>
                      ) : (
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">
                            {isCanceled ? 'ยกเลิกแล้ว' : 'ใช้งานปกติ'}
                          </span>
                          <span className="text-muted-foreground text-xs">
                            คงเหลือ {daysRemaining} วัน
                          </span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="max-w-72 min-w-72 wrap-break-word whitespace-pre-line">
                      {PLAN_DETAILS[store.plan].features.join(', ')}
                    </TableCell>
                    <TableCell>{formattedDate}</TableCell>
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
                        onClick={() => {
                          setSelectedStoreId(store.id)
                          router.push('/merchant/organization-branches')
                        }}
                      >
                        <IconHierarchy2 />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon-lg"
                        onClick={() => {
                          setSelectedStoreId(store.id)
                          router.push('/merchant/billing-subscription')
                        }}
                      >
                        <IconCreditCard />
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
