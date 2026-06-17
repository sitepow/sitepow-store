export const chatKeys = {
  all: ['chat'] as const,
  conversations: () => [...chatKeys.all, 'conversations'] as const,
  conversation: (userId: string, type: string) =>
    [...chatKeys.all, 'conversation', userId, type] as const,
  supportConversations: () =>
    [...chatKeys.all, 'support-conversations'] as const,
  messages: (conversationId: string) =>
    [...chatKeys.all, 'messages', conversationId] as const,
  unreadCount: () => [...chatKeys.all, 'unread-count'] as const,
}
