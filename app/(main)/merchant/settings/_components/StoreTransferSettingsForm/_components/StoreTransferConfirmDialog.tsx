'use client'

import { useCreateTransferRequest } from '@/actions/store/ownership-transfer/hooks'
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
  const { user } = useSession()
  const createMutation = useCreateTransferRequest()

  const handleConfirm = () => {
    createMutation.mutate(
      { storeId, fromOwnerId: user?.id ?? '', toEmail },
      {
        onSuccess: (res) => {
          if (res.success) {
            onClose()
          }
        },
      },
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
            ยืนยันการส่งคำขอโอนร้านค้า
          </DialogTitle>
        </DialogHeader>

        <p className="text-muted-foreground text-sm">
          คุณกำลังจะส่งคำขอโอนความเป็นเจ้าของร้านค้าให้กับ{' '}
          <span className="text-foreground font-medium">{toEmail}</span>{' '}
          ผู้รับจะต้องยืนยันการรับโอนภายใน 24 ชั่วโมง
        </p>

        <DialogFooter className="flex gap-2 border-t pt-4">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={createMutation.isPending}
          >
            ยกเลิก
          </Button>
          <Button
            variant="destructive"
            disabled={createMutation.isPending}
            onClick={handleConfirm}
          >
            {createMutation.isPending ? (
              <>
                <Spinner /> กำลังส่งคำขอ...
              </>
            ) : (
              'ยืนยันส่งคำขอ'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
