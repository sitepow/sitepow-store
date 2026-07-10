import { ArrowLeft, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface SupportHeaderProps {
  title: string
  hasBack?: boolean
  onBack?: () => void
  onClose: () => void
}

export function SupportHeader({
  title,
  hasBack,
  onBack,
  onClose,
}: SupportHeaderProps) {
  return (
    <DialogHeader className="flex shrink-0 flex-row items-center justify-between space-y-0 border-b p-4">
      <DialogTitle className="flex items-center gap-2 text-lg">
        {hasBack && (
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={onBack}
          >
            <ArrowLeft className="size-4" />
          </Button>
        )}
        {title}
      </DialogTitle>
      <Button variant="ghost" size="icon" className="size-8" onClick={onClose}>
        <X className="size-4" />
      </Button>
    </DialogHeader>
  )
}
