import { User2 } from 'lucide-react'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'

interface CustomerInfoProps {
  title?: string | null
  description?: string | null
  lastContent?: string | null
}

export const CustomerInfo = ({
  title,
  description,
  lastContent,
}: CustomerInfoProps) => {
  return (
    <div className="flex items-center">
      <Avatar className="size-8 border">
        <AvatarFallback>
          <User2 size={16} />
        </AvatarFallback>
      </Avatar>
      <div className="ml-4 max-w-72 space-y-1 wrap-break-word whitespace-pre-line">
        <p className="text-sm leading-none font-medium">{title || 'ลูกค้า'}</p>
        {description && (
          <p className="text-muted-foreground text-sm">{description}</p>
        )}
        {lastContent && (
          <p className="text-muted-foreground text-[10px]">{lastContent}</p>
        )}
      </div>
    </div>
  )
}
