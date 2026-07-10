export const chatKeys = {
  all: ['chat'] as const,
  conversations: () => [...chatKeys.all, 'conversations'] as const,
  conversation: (userId: string, type: string, storeId?: string) =>
    storeId
      ? ([...chatKeys.all, 'conversation', userId, type, storeId] as const)
      : ([...chatKeys.all, 'conversation', userId, type] as const),
  supportConversations: (storeId?: string) =>
    storeId
      ? ([...chatKeys.all, 'support-conversations', storeId] as const)
      : ([...chatKeys.all, 'support-conversations'] as const),
  messages: (conversationId: string) =>
    [...chatKeys.all, 'messages', conversationId] as const,
  unreadCount: (userId?: string) =>
    [...chatKeys.all, 'unread-count', userId] as const,
  customerConversations: () =>
    [...chatKeys.all, 'customer-conversations'] as const,
  merchantConversations: (storeSlug: string) =>
    [...chatKeys.all, 'merchant-conversations', storeSlug] as const,
  storeConversation: (storeId: string) =>
    [...chatKeys.all, 'store-conversation', storeId] as const,
}
