import type { Message as PrismaMessage } from '@/generated/prisma/browser'
import { UserRole } from '@/generated/prisma/enums'
import { useStoreData } from '@/stores/sites/use-store-data'
import { IconSparkles } from '@tabler/icons-react'

import { MarkdownRenderer } from '@/components/MarkdownRenderer'

import { cn } from '@/lib/utils'

interface MessageWithSender extends PrismaMessage {
  sender: {
    id: string
    role: UserRole
    name?: string | null
    image?: string | null
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

  const timeFormatted = new Date(msg.createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div
      className={cn(
        'group flex w-full flex-col',
        !isLeft ? 'items-end' : 'items-start',
      )}
      style={{ '--primary': store?.primaryColor } as React.CSSProperties}
    >
      {isBot && (
        <div className="mb-1 flex items-center gap-1.5 px-1 text-xs font-medium text-purple-600 dark:text-purple-400">
          <span className="flex size-4 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-950/60">
            <IconSparkles className="size-2.5 text-purple-600 dark:text-purple-300" />
          </span>
          <span>AI Assistant</span>
        </div>
      )}
      <div
        className={cn(
          'relative max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm transition-all sm:max-w-[75%]',
          !isLeft
            ? 'bg-primary text-primary-foreground rounded-tr-xs font-normal'
            : isBot
              ? 'rounded-tl-xs border border-purple-200/80 bg-purple-50/60 text-slate-800 dark:border-purple-900/50 dark:bg-purple-950/30 dark:text-purple-100'
              : 'border-border/60 bg-card text-card-foreground rounded-tl-xs border',
        )}
      >
        <MarkdownRenderer
          className="leading-relaxed text-inherit md:w-fit dark:text-inherit"
          content={msg.content}
        />
        <div
          className={cn(
            'mt-1 flex items-center justify-end gap-1 text-[10px] tracking-wider select-none',
            !isLeft
              ? 'text-primary-foreground/75'
              : isBot
                ? 'text-purple-600/75 dark:text-purple-300/75'
                : 'text-muted-foreground',
          )}
        >
          <span>{timeFormatted}</span>
        </div>
      </div>
    </div>
  )
}
