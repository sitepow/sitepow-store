export const addressKeys = {
  all: ['addresses'] as const,
  lists: () => [...addressKeys.all, 'list'] as const,
  options: () => [...addressKeys.all, 'options'] as const,
}
