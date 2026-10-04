import slugify from 'slugify'

export function formatSlug(text: string): string {
  return slugify(text, {
    replacement: '-',
    remove: /[*+~.()'"!:@]/g,
    lower: true,
    strict: false,
    trim: true,
  })
}
