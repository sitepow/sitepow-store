'use client'

import { useTranslations } from 'next-intl'

import { useCreateTransferRequest } from '@/actions/hooks/store-transfer'
import { useSession } from '@/hooks/use-session'
import { IconAlertTriangle } from '@tabler/icons-react'

import { DialogHeaderIcon } from '@/components/DialogHeaderIcon'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from '@/components/ui/dialog'
import { Spinner } from '@/components/ui/spinner'

interface StoreTransferConfirmDialogProps {
  open: boolean
  toEmail: string
  storeId: string
  onClose: () => void
}

export function StoreTransferConfirmDialog({
  open,
  toEmail,
  storeId,
  onClose,
}: StoreTransferConfirmDialogProps) {
  const t = useTranslations('merchant.settings.transfer')
  const { user } = useSession()
  const createMutation = useCreateTransferRequest()

  const handleConfirm = () => {
    createMutation.mutate(
      { storeId, fromOwnerId: user?.id ?? '', toEmail },
      { onSuccess: () => onClose() },
    )
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v && !createMutation.isPending) onClose()
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogHeaderIcon
            icon={IconAlertTriangle}
            iconClassName="border-destructive/20 bg-destructive/10 text-destructive"
            title={t('confirmTitle')}
            description={t('confirmDesc', { email: toEmail })}
          />
        </DialogHeader>

        <DialogFooter className="flex gap-2 border-t pt-4">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={createMutation.isPending}
          >
            {t('cancel')}
          </Button>
          <Button
            variant="destructive"
            disabled={createMutation.isPending}
            onClick={handleConfirm}
          >
            {createMutation.isPending ? (
              <>
                <Spinner /> {t('sending')}
              </>
            ) : (
              t('confirm')
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
