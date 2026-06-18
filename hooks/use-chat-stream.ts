'use client'

import { useEffect } from 'react'

import { ChatData } from '@/actions/hooks/chat'
import { chatKeys } from '@/actions/query-keys/chat'
import { useQueryClient } from '@tanstack/react-query'
import { InfiniteData } from '@tanstack/react-query'

export function useChatStream(conversationId: string) {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!conversationId) {
      return
    }

    const eventSource = new EventSource(`/api/chat/stream/${conversationId}`)

    eventSource.onmessage = (event) => {
      const newMessage = JSON.parse(event.data)

      queryClient.setQueryData(
        chatKeys.messages(conversationId),
        (old: InfiniteData<ChatData> | undefined) => {
          if (!old) return old
          const alreadyExists = old.pages.some((p) =>
            p.items.some((m) => m.id === newMessage.id),
          )
          if (alreadyExists) return old

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

      queryClient.invalidateQueries({ queryKey: chatKeys.conversations() })
      queryClient.invalidateQueries({ queryKey: chatKeys.unreadCount() })
    }

    return () => eventSource.close()
  }, [conversationId, queryClient])
}
