export const resellerKeys = {
  all: ['reseller'] as const,
  agreements: () => [...resellerKeys.all, 'agreements'] as const,
  agreementList: (storeId: string, userId?: string) =>
    [...resellerKeys.agreements(), 'list', { storeId, userId }] as const,
  activeAgreement: (storeId: string) =>
    [...resellerKeys.agreements(), 'active', { storeId }] as const,
  agreementDetail: (id: string) =>
    [...resellerKeys.agreements(), 'detail', id] as const,
  stocks: () => [...resellerKeys.all, 'stocks'] as const,
  stockList: (agreementId: string) =>
    [...resellerKeys.stocks(), 'list', { agreementId }] as const,
  payouts: () => [...resellerKeys.all, 'payouts'] as const,
  payoutList: (agreementId: string) =>
    [...resellerKeys.payouts(), 'list', { agreementId }] as const,
  summary: (agreementId: string) =>
    [...resellerKeys.all, 'summary', agreementId] as const,
  allAgreementList: (storeId: string, userId?: string) =>
    [...resellerKeys.agreements(), 'all-list', { storeId, userId }] as const,
}
