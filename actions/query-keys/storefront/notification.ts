export const notificationKeys = {
  all: ['notification'] as const,
  detail: () => [...notificationKeys.all, 'detail'] as const,
}
