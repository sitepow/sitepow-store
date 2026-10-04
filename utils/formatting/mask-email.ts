export const maskEmail = (email: string | undefined | null): string => {
  if (!email || typeof email !== 'string') {
    return ''
  }

  const atIndex = email.indexOf('@')
  if (atIndex === -1) {
    return email
  }

  const namePart = email.substring(0, atIndex)
  const domainPart = email.substring(atIndex)

  if (namePart.length <= 1) {
    return email
  }

  return namePart[0] + '*'.repeat(namePart.length - 1) + domainPart
}
