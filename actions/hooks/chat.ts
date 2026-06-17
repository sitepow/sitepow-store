'use client'

import { fetchMessages, sendMessage } from '@/actions/chat'
import { Message } from '@/generated/prisma/client'
import {
  InfiniteData,
  infiniteQueryOptions,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'

import { chatKeys } from '../query-keys/chat'

type ChatData = {
  items: Message[]
  nextCursor?: string
}

const messageOptions = (conversationId: string) =>
  infiniteQueryOptions({
    queryKey: chatKeys.messages(conversationId),
    queryFn: ({ pageParam }) =>
      fetchMessages(conversationId, pageParam as string),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  })

export function useMessages(conversationId: string) {
  return useInfiniteQuery(messageOptions(conversationId))
}

export function useSendMessage(conversationId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (content: string) => {
      return sendMessage(conversationId, content)
    },
    onSuccess: (result) => {
      if (!result.success || !result.data) {
        return
      } else {
        const newMessage = result.data

        queryClient.setQueryData(
          chatKeys.messages(conversationId),
          (old: InfiniteData<ChatData> | undefined) => {
            if (!old) {
              return old
            } else {
              return {
                ...old,
                pages: old.pages.map((p, i) => {
                  if (i === old.pages.length - 1) {
                    return { ...p, items: [...p.items, newMessage] }
                  } else {
                    return p
                  }
                }),
              }
            }
          },
        )
      }
    },
  })
}
