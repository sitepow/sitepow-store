export const notificationSettingsKeys = {
  all: ['notification-settings'] as const,
  detail: (storeId: string) =>
    [...notificationSettingsKeys.all, storeId] as const,
}
