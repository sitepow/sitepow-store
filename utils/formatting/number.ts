export const formatCurrency = (num: number) => {
  return num.toLocaleString('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    style: 'currency',
    currency: 'THB',
  })
}

export const formatNumber = (num: number) => {
  return num.toLocaleString()
}
