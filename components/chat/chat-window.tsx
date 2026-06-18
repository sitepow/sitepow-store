'use client'

import { useEffect, useMemo, useRef } from 'react'
import { useForm } from 'react-hook-form'

import {
  useMessages,
  useSendMessage,
  useToggleUserAi,
} from '@/actions/hooks/chat'
import { UserRole } from '@/generated/prisma/enums'
import { useChatStream } from '@/hooks/use-chat-stream'
import { useSession } from '@/hooks/use-session'
import { IconSend2 } from '@tabler/icons-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'

import { cn } from '@/lib/utils'

import { MarkdownRenderer } from '../MarkdownRenderer'
import { Label } from '../ui/label'
import { Switch } from '../ui/switch'

type ChatFormValues = {
  content: string
}

export function ChatWindow({
  conversationId,
  currentUserId,
  otherUserId,
  isAiEnabled,
}: {
  conversationId: string
  currentUserId: string
  otherUserId?: string
  isAiEnabled?: boolean
}) {
  const { data } = useMessages(conversationId)
  const { mutate: sendMessage } = useSendMessage(conversationId)
  const { user } = useSession()

  const { mutate: toggleAi } = useToggleUserAi()

  const { register, handleSubmit, reset, watch } = useForm<ChatFormValues>({
    defaultValues: { content: '' },
  })

  useChatStream(conversationId)
  const scrollRef = useRef<HTMLDivElement>(null)

  const messages = useMemo(() => {
    const all = data?.pages.flatMap((p) => p.items) ?? []
    const seen = new Set<string>()
    const deduped = []

    for (const msg of all) {
      if (!seen.has(msg.id)) {
        seen.add(msg.id)
        deduped.push(msg)
      }
    }

    return deduped
  }, [data])

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const onSubmit = ({ content }: ChatFormValues) => {
    if (content.trim() === '') return
    sendMessage(content)
    reset()
  }

  const hasContent = !!watch('content')?.trim()

  return (
    <div className="flex h-full flex-col">
      {user?.role === UserRole.SUPPORT && (
        <div className="flex items-center justify-between border-b bg-slate-50 p-3">
          <span className="text-xs font-semibold text-slate-600">
            ตั้งค่า AI สำหรับลูกค้ารายนี้
          </span>
          <div className="flex items-center space-x-2">
            <Label htmlFor="ai-mode" className="text-xs">
              เปิดใช้งาน AI
            </Label>
            <Switch
              id="ai-mode"
              checked={isAiEnabled}
              onCheckedChange={(checked) =>
                otherUserId &&
                toggleAi({ userId: otherUserId, enabled: checked })
              }
            />
          </div>
        </div>
      )}

      <ScrollArea className="min-h-0 flex-1 px-4">
        <div className="flex flex-col gap-4">
          {messages.map((msg) => {
            const isMe = msg.senderId === currentUserId
            const isLeft = !isMe

            return (
              <div
                key={msg.id}
                className={cn(
                  'flex w-full flex-col',
                  !isLeft ? 'items-end' : 'items-start',
                )}
              >
                <div
                  className={cn(
                    'max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-sm',
                    !isLeft
                      ? 'rounded-tr-none bg-blue-600 text-white'
                      : 'rounded-tl-none border border-slate-200 bg-white text-slate-800',
                  )}
                >
                  <MarkdownRenderer
                    className="text-inherit md:w-fit dark:text-inherit"
                    content={msg.content}
                  />
                  <span
                    className={cn(
                      'mt-1 block text-[10px] opacity-70',
                      !isLeft ? 'text-blue-100' : 'text-slate-500',
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
          })}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex gap-2 border-t bg-white p-4"
      >
        <Input
          {...register('content')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSubmit(onSubmit)()
            }
          }}
          placeholder="พิมพ์ข้อความ..."
        />
        <Button type="submit" disabled={!hasContent} className="shrink-0">
          <IconSend2 />
          ส่ง
        </Button>
      </form>
    </div>
  )
}
