export { formatCurrency, formatNumber } from './pricing'

export const stringToArray = (
  value: string | undefined | null,
  separator = ',',
): string[] => {
  if (!value) {
    return []
  }

  return value
    .split(separator)
    .map((item) => item.trim())
    .filter((item) => item !== '')
}

export const arrayToString = (
  list: string[] | undefined | null,
  separator = ', ',
  suffix = ' - ',
): string => {
  if (!list || list.length === 0) {
    return ''
  }

  return `${list.join(separator)}${suffix}`
}

export const cleanTag = (text: React.ReactNode, tagTarget: string) => {
  if (typeof text === 'string') {
    const regex = new RegExp(`<\/?${tagTarget}>`, 'g')
    return text.replace(regex, '')
  }
  return text
}

/**
 * Combines firstName and lastName into a cleaned full name, with fallback.
 */
export function formatFullName(
  firstName?: string | null,
  lastName?: string | null,
  fallback = '-',
): string {
  const full = [firstName?.trim(), lastName?.trim()].filter(Boolean).join(' ')
  return full || fallback
}
