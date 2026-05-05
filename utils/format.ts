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
