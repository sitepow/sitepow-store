export const securityKeys = {
  all: ['security'] as const,
  settings: () => [...securityKeys.all, 'settings'] as const,
}
