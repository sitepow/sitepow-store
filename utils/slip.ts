export const formatPromptPay = (id: string | null | undefined) => {
  if (!id) {
    return ''
  }

  const cleaned = id.replace(/\D/g, '')

  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3')
  }

  if (cleaned.length === 13) {
    return cleaned.replace(
      /(\d{1})(\d{4})(\d{5})(\d{2})(\d{1})/,
      '$1-$2-$3-$4-$5',
    )
  }

  return id
}

export const formatBankAccount = (accountNumber: string | null | undefined) => {
  if (!accountNumber) {
    return ''
  }

  const cleaned = accountNumber.replace(/\D/g, '')

  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{3})(\d{1})(\d{5})(\d{1})/, '$1-$2-$3-$4')
  }

  return accountNumber
}
