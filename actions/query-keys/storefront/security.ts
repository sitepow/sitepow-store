export const storefrontSecurityKeys = {
  all: ['security'] as const,
  settings: () => [...storefrontSecurityKeys.all, 'settings'] as const,
}
