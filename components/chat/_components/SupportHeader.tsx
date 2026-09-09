import Link from 'next/link'

import { ArrowLeft, Maximize2, X } from 'lucide-react'

import { Button } from '@/components/ui/button'

interface SupportHeaderProps {
  title: string
  hasBack?: boolean
  onBack?: () => void
  onClose: () => void
  fullScreenUrl?: string
}

export function SupportHeader({
  title,
  hasBack,
  onBack,
  onClose,
  fullScreenUrl,
}: SupportHeaderProps) {
  return (
    <div className="bg-card/80 flex shrink-0 flex-row items-center justify-between border-b px-4 py-3 backdrop-blur-sm">
      <div className="flex items-center gap-2 text-sm font-semibold">
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
        <span className="truncate">{title}</span>
      </div>

      <div className="flex items-center gap-1">
        {fullScreenUrl && (
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground size-7"
            onClick={onClose}
            title="เปิดกล่องข้อความเต็มจอ"
          >
            <Link href={fullScreenUrl}>
              <Maximize2 className="size-3.5" />
            </Link>
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground size-7"
          onClick={onClose}
        >
          <X className="size-4" />
        </Button>
      </div>
    </div>
  )
}
