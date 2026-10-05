import { IconSparkles2 } from '@tabler/icons-react'
import { User2 } from 'lucide-react'

import { Avatar, AvatarBadge, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

interface Conversation {
  id: string
  merchantName: string
  lastMessage: string | null
  isAiEnabled?: boolean
  unreadCount: number
}

interface ConversationItemProps {
  conv: Conversation
  onClick: () => void
}

export function ConversationItem({ conv, onClick }: ConversationItemProps) {
  return (
    <button
      onClick={onClick}
      className="border-border hover:bg-muted/50 flex w-full flex-col gap-1 border-b p-4 text-left transition-colors cursor-pointer"
    >
      <div className="flex items-center gap-2">
        <Avatar className="size-8 border">
          <AvatarFallback>
            <User2 size={16} />
          </AvatarFallback>
          {conv.isAiEnabled && (
            <AvatarBadge>
              <IconSparkles2 />
            </AvatarBadge>
          )}
        </Avatar>
        <div className="flex w-full items-center justify-between">
          <div className="flex flex-col space-y-1">
            <p className="text-foreground text-sm font-medium">{conv.merchantName}</p>
            <p className="text-muted-foreground line-clamp-2 text-xs">
              {conv.lastMessage ?? 'ยังไม่มีข้อความ'}
            </p>
          </div>
          {conv.unreadCount > 0 && (
            <Badge
              variant="default"
              className="flex size-5.5 shrink-0 items-center justify-center rounded-full p-0 text-[10px]"
            >
              {conv.unreadCount}
            </Badge>
          )}
        </div>
      </div>
    </button>
  )
}
