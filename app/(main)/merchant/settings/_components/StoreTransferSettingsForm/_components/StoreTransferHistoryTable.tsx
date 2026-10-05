'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'

import {
  useCancelTransferRequest,
  useResendTransferEmail,
  useTransferRequests,
} from '@/actions/store/ownership-transfer/hooks'
import { TRANSFER_STATUS_TH } from '@/constants/i18n/translate'
import { TransferStatus } from '@/generated/prisma/enums'
import { useSession } from '@/hooks/use-session'
import { useStoreFilter } from '@/stores/merchant/use-store-filter'
import { formatDateTime } from '@/utils/formatting/date'
import {
  IconCheck,
  IconCopy,
  IconLoader2,
  IconMailForward,
} from '@tabler/icons-react'

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

export function StoreTransferHistoryTable() {
  const { selectedStoreId } = useStoreFilter()
  const { user } = useSession()
  const cancelMutation = useCancelTransferRequest()
  const resendMutation = useResendTransferEmail()
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [resendingId, setResendingId] = useState<string | null>(null)

  const { data: requests = [], isLoading } = useTransferRequests(
    selectedStoreId as string,
  )

  const handleCopyLink = (token: string, reqId: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    const link = `${origin}/merchant/transfer/${token}`
    navigator.clipboard.writeText(link)
    setCopiedId(reqId)
    toast.success('คัดลอกลิงก์คำขอโอนร้านค้าแล้ว')
    setTimeout(() => setCopiedId(null), 2000)
  }

  const renderStatusBadge = (status: TransferStatus) => {
    switch (status) {
      case TransferStatus.PENDING:
        return (
          <Badge
            variant="outline"
            className="border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400"
          >
            {TRANSFER_STATUS_TH[status]}
          </Badge>
        )
      case TransferStatus.ACCEPTED:
        return (
          <Badge
            variant="secondary"
            className="bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400"
          >
            {TRANSFER_STATUS_TH[status]}
          </Badge>
        )
      case TransferStatus.DECLINED:
      case TransferStatus.CANCELLED:
        return (
          <Badge
            variant="destructive"
            className="bg-destructive/10 text-destructive"
          >
            {TRANSFER_STATUS_TH[status]}
          </Badge>
        )
      case TransferStatus.EXPIRED:
      default:
        return (
          <Badge variant="outline" className="text-muted-foreground">
            {TRANSFER_STATUS_TH[status]}
          </Badge>
        )
    }
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow className="text-xs">
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
              <TableRow key={req.id} className="text-xs">
                <TableCell className="font-medium">{req.toEmail}</TableCell>
                <TableCell>{renderStatusBadge(req.status)}</TableCell>
                <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
                  {formatDateTime(req.expiresAt)}
                </TableCell>
                <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
                  {formatDateTime(req.createdAt)}
                </TableCell>
                <TableCell className="text-right">
                  {req.status === TransferStatus.PENDING && (
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-foreground h-7 gap-1 px-2 text-xs"
                        title="คัดลอกลิงก์คำขอรับโอน"
                        onClick={() => handleCopyLink(req.token, req.id)}
                      >
                        {copiedId === req.id ? (
                          <>
                            <IconCheck className="h-3.5 w-3.5 text-emerald-600" />
                            <span className="hidden sm:inline">คัดลอกแล้ว</span>
                          </>
                        ) : (
                          <>
                            <IconCopy className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">
                              คัดลอกลิงก์
                            </span>
                          </>
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-foreground h-7 gap-1 px-2 text-xs"
                        title="ส่งอีเมลแจ้งเตือนอีกครั้ง"
                        disabled={resendingId === req.id || resendMutation.isPending}
                        onClick={async () => {
                          setResendingId(req.id)
                          try {
                            await resendMutation.mutateAsync({
                              requestId: req.id,
                              ownerId: user?.id ?? '',
                            })
                          } finally {
                            setResendingId(null)
                          }
                        }}
                      >
                        {resendingId === req.id ? (
                          <IconLoader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <IconMailForward className="h-3.5 w-3.5" />
                        )}
                        <span className="hidden sm:inline">ส่งเมลซ้ำ</span>
                      </Button>
                      <DeleteButton
                        isPending={cancelMutation.isPending}
                        onDelete={() =>
                          cancelMutation.mutate({
                            requestId: req.id,
                            ownerId: user?.id ?? '',
                          })
                        }
                      />
                    </div>
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
