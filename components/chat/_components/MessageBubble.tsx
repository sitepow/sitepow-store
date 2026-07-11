'use client'

import { Message as PrismaMessage } from '@/generated/prisma/client'
import { UserRole } from '@/generated/prisma/enums'

import { MarkdownRenderer } from '@/components/MarkdownRenderer'

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
  const isBot = msg?.sender?.role === UserRole.BOT
  const isMe = isBot ? false : isMySender
  const isLeft = !isMe

  return (
    <div
      className={cn(
        'flex w-full flex-col',
        !isLeft ? 'items-end' : 'items-start',
      )}
    >
      {isBot && <span className="mb-1 text-xs">AI Assistant</span>}
      <div
        className={cn(
          'max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-sm',
          !isLeft
            ? 'rounded-tr-none bg-blue-600 text-white'
            : isBot
              ? 'bg-primary dark:bg-primary/50 rounded-tl-none border text-white'
              : 'dark:bg-foreground/5 dark:text-foreground border-border rounded-tl-none border bg-white text-slate-800',
        )}
      >
        <MarkdownRenderer
          className="text-inherit md:w-fit dark:text-inherit"
          content={msg.content}
        />
        <span
          className={cn(
            'mt-1 block text-[10px] opacity-70',
            !isLeft ? 'text-blue-100' : isBot ? 'text-white' : 'text-slate-500',
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
