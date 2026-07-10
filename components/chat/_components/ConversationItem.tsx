import { IconSparkles2 } from '@tabler/icons-react'
import { User2 } from 'lucide-react'

import { Avatar, AvatarBadge, AvatarFallback } from '@/components/ui/avatar'

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
      className="flex w-full flex-col gap-1 border-b p-4 text-left transition-colors"
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
            <p className="text-sm font-medium">{conv.merchantName}</p>
            <p className="text-muted-foreground line-clamp-2 text-sm">
              {conv.lastMessage ?? 'ยังไม่มีข้อความ'}
            </p>
          </div>
          {conv.unreadCount > 0 && (
            <span className="bg-primary text-primary-foreground flex size-6 shrink-0 items-center justify-center rounded-full text-[10px]">
              {conv.unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  )
}
