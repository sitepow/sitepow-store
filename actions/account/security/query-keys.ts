export const securitySettingsKeys = {
  all: ['security-settings'] as const,
  detail: (userId: string) => [...securitySettingsKeys.all, userId] as const,
}
