'use client'

import { Message as PrismaMessage } from '@/generated/prisma/client'
import { UserRole } from '@/generated/prisma/enums'
import { useStoreData } from '@/stores/storefront/use-store-data'

import { MarkdownRenderer } from '@/components/editor/MarkdownRenderer'

import { cn } from '@/lib/utils'

interface MessageWithSender extends PrismaMessage {
  sender: {
    id: string
    role: UserRole
  } | null
}

interface MessageBubbleProps {
  msg: MessageWithSender
  isMySender: boolean
}

export function MessageBubble({ msg, isMySender }: MessageBubbleProps) {
  const { store } = useStoreData()
  const isBot = msg?.sender?.role === UserRole.BOT
  const isMe = isBot ? false : isMySender
  const isLeft = !isMe

  return (
    <div
      className={cn(
        'flex w-full flex-col',
        !isLeft ? 'items-end' : 'items-start',
      )}
      style={{ '--primary': store?.primaryColor } as React.CSSProperties}
    >
      {isBot && (
        <span className="text-muted-foreground mb-1 text-xs font-medium">
          AI Assistant
        </span>
      )}
      <div
        className={cn(
          'max-w-[80%] rounded-2xl px-4 py-2.5 text-sm shadow-xs leading-relaxed',
          !isLeft
            ? 'rounded-tr-none bg-primary text-primary-foreground'
            : isBot
              ? 'bg-secondary text-secondary-foreground border-border rounded-tl-none border'
              : 'bg-card text-card-foreground border-border rounded-tl-none border',
        )}
      >
        <MarkdownRenderer
          className="text-inherit md:w-fit dark:text-inherit"
          content={msg.content}
        />
        <span
          className={cn(
            'mt-1 block text-[10px] opacity-75',
            !isLeft ? 'text-primary-foreground/80' : 'text-muted-foreground',
          )}
        >
          {new Date(msg.createdAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      </div>
    </div>
  )
}
