export const storefrontNotificationKeys = {
  all: ['notification'] as const,
  detail: () => [...storefrontNotificationKeys.all, 'detail'] as const,
}
