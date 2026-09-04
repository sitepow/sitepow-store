'use client'

import { useTranslations } from 'next-intl'

import { useCreateTransferRequest } from '@/actions/hooks/store-transfer'
import { useSession } from '@/hooks/use-session'
import { IconAlertTriangle } from '@tabler/icons-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
          <DialogTitle className="flex items-center gap-2">
            <IconAlertTriangle size={18} className="text-destructive" />
            {t('confirmTitle')}
          </DialogTitle>
        </DialogHeader>

        <p className="text-muted-foreground text-sm">
          {t('confirmDesc', { email: toEmail })}
        </p>

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
