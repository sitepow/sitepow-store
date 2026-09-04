'use client'

import { useTranslations } from 'next-intl'

import { useTransferRequests } from '@/actions/hooks/store-transfer'
import { useCancelTransferRequest } from '@/actions/hooks/store-transfer'
import { TransferStatus } from '@/generated/prisma/enums'
import { useSession } from '@/hooks/use-session'
import { useStoreFilter } from '@/stores/use-store-filter'
import { formatDateTime } from '@/utils/date'

import { DeleteButton } from '@/components/DeleteButton'
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

export function StoreTransferHistoryTable() {
  const t = useTranslations('merchant.settings.transfer')
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
            <TableHead>{t('recipientEmail')}</TableHead>
            <TableHead>{t('status')}</TableHead>
            <TableHead>{t('expiresAt')}</TableHead>
            <TableHead>{t('sentAt')}</TableHead>
            <TableHead className="text-right">{t('actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableLoadingRow colSpan={5} />
          ) : requests.length === 0 ? (
            <TableEmptyRow colSpan={5} title={t('empty')} />
          ) : (
            requests.map((req) => (
              <TableRow key={req.id}>
                <TableCell className="font-medium">{req.toEmail}</TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {t(`statuses.${req.status}` as any)}
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
