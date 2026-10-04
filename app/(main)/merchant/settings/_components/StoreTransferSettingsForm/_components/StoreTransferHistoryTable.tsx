'use client'

import { useTransferRequests } from '@/actions/store/ownership-transfer/hooks'
import { useCancelTransferRequest } from '@/actions/store/ownership-transfer/hooks'
import { TRANSFER_STATUS_TH } from '@/constants/i18n/translate'
import { TransferStatus } from '@/generated/prisma/enums'
import { useSession } from '@/hooks/use-session'
import { useStoreFilter } from '@/stores/use-store-filter'
import { formatDateTime } from '@/utils/formatting/date'

import { DeleteButton } from '@/components/shared/DeleteButton'
import { TableEmptyRow } from '@/components/table/TableEmptyRow'
import { TableLoadingRow } from '@/components/table/TableLoadingRow'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export function StoreTransferHistoryTable() {
  const { selectedStoreId } = useStoreFilter()
  const { user } = useSession()
  const cancelMutation = useCancelTransferRequest()

  const { data: requests = [], isLoading } = useTransferRequests(
    selectedStoreId as string,
  )

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>อีเมลผู้รับ</TableHead>
            <TableHead>สถานะ</TableHead>
            <TableHead>หมดอายุ</TableHead>
            <TableHead>วันที่ส่ง</TableHead>
            <TableHead className="text-right">จัดการ</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableLoadingRow colSpan={5} />
          ) : requests.length === 0 ? (
            <TableEmptyRow colSpan={5} title="ยังไม่มีประวัติการโอนร้านค้า" />
          ) : (
            requests.map((req) => (
              <TableRow key={req.id}>
                <TableCell className="font-medium">{req.toEmail}</TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {TRANSFER_STATUS_TH[req.status]}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {formatDateTime(req.expiresAt)}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {formatDateTime(req.createdAt)}
                </TableCell>
                <TableCell className="text-right">
                  {req.status === TransferStatus.PENDING && (
                    <DeleteButton
                      isPending={cancelMutation.isPending}
                      onDelete={() =>
                        cancelMutation.mutate({
                          requestId: req.id,
                          ownerId: user?.id ?? '',
                        })
                      }
                    />
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
