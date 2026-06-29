export const storefrontAddressKeys = {
  all: ['addresses'] as const,
  lists: () => [...storefrontAddressKeys.all, 'list'] as const,
  options: () => [...storefrontAddressKeys.all, 'options'] as const,
}
