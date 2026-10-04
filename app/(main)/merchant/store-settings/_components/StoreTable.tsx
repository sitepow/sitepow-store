'use client'

import { useState } from 'react'

import { useRouter } from 'next/navigation'

import { useEmployeePermission } from '@/actions/store/employee/hooks'
import { useDeleteStore, useStores } from '@/actions/store/management/hooks'
import { StorePagination } from '@/app/sites/[domain]/_components/Pagination'
import { PLAN_DETAILS } from '@/constants/billing/plan'
import { StoreStatus } from '@/generated/prisma/enums'
import { useStoreFilter } from '@/stores/use-store-filter'
import { formatDateTime } from '@/utils/formatting/date'
import { getSubscriptionStatusInfo } from '@/utils/billing/subscription-pricing'
import {
  IconAlertTriangle,
  IconCreditCard,
  IconExternalLink,
  IconHierarchy2,
  IconPackage,
  IconSettings,
} from '@tabler/icons-react'

import { DeleteButton } from '@/components/shared/DeleteButton'
import { TableEmptyRow } from '@/components/table/TableEmptyRow'
import { TableLoadingRow } from '@/components/table/TableLoadingRow'
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

function StoreRowActions({
  storeId,
  onDelete,
}: {
  storeId: string
  onDelete: () => void
}) {
  const router = useRouter()
  const { setSelectedStoreId } = useStoreFilter()

  const {
    canUpdateStore,
    canViewBranches,
    canViewSubscription,
    canViewProducts,
    canDeleteStore,
  } = useEmployeePermission(storeId)

  return (
    <div className="space-x-2 text-right">
      {canUpdateStore && (
        <Button
          variant="outline"
          size="icon-lg"
          onClick={() => {
            setSelectedStoreId(storeId)
            router.push('/merchant/settings')
          }}
        >
          <IconSettings />
        </Button>
      )}
      {canViewBranches && (
        <Button
          variant="outline"
          size="icon-lg"
          onClick={() => {
            setSelectedStoreId(storeId)
            router.push('/merchant/organization-branches')
          }}
        >
          <IconHierarchy2 />
        </Button>
      )}
      {canViewSubscription && (
        <Button
          variant="outline"
          size="icon-lg"
          onClick={() => {
            setSelectedStoreId(storeId)
            router.push('/merchant/billing-subscription')
          }}
        >
          <IconCreditCard />
        </Button>
      )}
      {canViewProducts && (
        <Button
          variant="outline"
          size="icon-lg"
          onClick={() => {
            setSelectedStoreId(storeId)
            router.push('/merchant/store-settings/products')
          }}
        >
          <IconPackage />
        </Button>
      )}

      {canDeleteStore && <DeleteButton isPending={false} onDelete={onDelete} />}
    </div>
  )
}

export function StoreTable() {
  const [page, setPage] = useState(1)

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
              <TableLoadingRow colSpan={8} />
            )}
            {!isLoading && stores.length === 0 && (
              <TableEmptyRow colSpan={8} title="ไม่พบข้อมูลร้านค้าของคุณ" />
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
                    <TableCell>
                      <StoreRowActions
                        storeId={store.id}
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
