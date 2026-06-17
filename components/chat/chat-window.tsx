'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

import { ChatData, useMessages, useSendMessage } from '@/actions/hooks/chat'
import { chatKeys } from '@/actions/query-keys/chat'
import { Message } from '@/generated/prisma/client'
import { InfiniteData, useQueryClient } from '@tanstack/react-query'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'

import { cn } from '@/lib/utils'

export function ChatWindow({
  conversationId,
  currentUserId,
}: {
  conversationId: string
  currentUserId: string
}) {
  const [input, setInput] = useState('')
  const queryClient = useQueryClient()
  const { data } = useMessages(conversationId)
  const { mutate: sendMessage } = useSendMessage(conversationId)

  const scrollRef = useRef<HTMLDivElement>(null)

  const messages = useMemo(() => {
    const all = data?.pages.flatMap((p) => p.items) ?? []
    const seen = new Set<string>()
    const deduped: Message[] = []

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

  useEffect(() => {
    const eventSource = new EventSource(`/api/chat/stream/${conversationId}`)
    eventSource.onmessage = (event) => {
      const newMessage: Message = JSON.parse(event.data)
      queryClient.setQueryData(
        chatKeys.messages(conversationId),
        (old: InfiniteData<ChatData> | undefined) => {
          if (!old) return old

          const alreadyExists = old.pages.some((p) =>
            p.items.some((m) => m.id === newMessage.id),
          )

          if (alreadyExists) {
            return old
          }

          return {
            ...old,
            pages: old.pages.map((p, i) =>
              i === old.pages.length - 1
                ? { ...p, items: [...p.items, newMessage] }
                : p,
            ),
          }
        },
      )
    }
    return () => eventSource.close()
  }, [conversationId, queryClient])

  const handleSend = () => {
    if (input.trim() === '') {
      return
    }
    sendMessage(input)
    setInput('')
  }

  return (
    <div className="flex h-full flex-col">
      <ScrollArea className="min-h-0 flex-1 p-4">
        <div className="flex flex-col gap-4">
          {messages.map((msg) => {
            const isMe = msg.senderId === currentUserId
            return (
              <div
                key={msg.id}
                className={cn(
                  'flex w-full',
                  isMe ? 'justify-end' : 'justify-start',
                )}
              >
                <div
                  className={cn(
                    'max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-sm',
                    isMe
                      ? 'rounded-tr-none bg-blue-600 text-white'
                      : 'rounded-tl-none border border-slate-200 bg-white text-slate-800',
                  )}
                >
                  <p>{msg.content}</p>
                  <span
                    className={cn(
                      'mt-1 block text-[10px] opacity-70',
                      isMe ? 'text-blue-100' : 'text-slate-500',
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

      <div className="flex gap-2 border-t bg-white p-4">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSend()
            }
          }}
          placeholder="พิมพ์ข้อความ..."
        />
        <Button onClick={handleSend} disabled={!input.trim()}>
          ส่ง
        </Button>
      </div>
    </div>
  )
}
