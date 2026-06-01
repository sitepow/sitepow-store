import { IconX } from '@tabler/icons-react'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'

interface CancelSubscriptionButtonProps {
  isPending: boolean
  onCancel: () => void
}

export function CancelSubscriptionButton({
  isPending,
  onCancel,
}: CancelSubscriptionButtonProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="icon-lg" disabled={isPending}>
          <IconX />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>ยืนยันการยกเลิกแพลน?</AlertDialogTitle>
          <AlertDialogDescription>
            หลังยกเลิก คุณจะถูกปรับลงเป็นแพลน Free
            และจะไม่สามารถใช้ฟีเจอร์พรีเมียมได้อีกต่อไป
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>ไม่ยกเลิก</AlertDialogCancel>
          <AlertDialogAction onClick={onCancel}>
            ยืนยันยกเลิกแพลน
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
