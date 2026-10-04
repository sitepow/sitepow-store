export interface BankAccountLike {
  bankName?: string | null
  accountNumber?: string | null
  accountName?: string | null
}

export function formatFullBankAccount(
  bankAccount?: BankAccountLike | null,
): string {
  if (!bankAccount) {
    return ''
  }

  const { bankName, accountNumber, accountName } = bankAccount
  const details = [bankName, accountNumber].filter(Boolean).join(' ')

  if (!details) {
    return ''
  }

  return accountName ? `${details} (${accountName})` : details
}
