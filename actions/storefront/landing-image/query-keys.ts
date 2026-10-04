export const landingImageKeys = {
  all: ['landing'] as const,
  folder: (folder: string) =>
    [...landingImageKeys.all, 'images', folder] as const,
}
