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
