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

export const formatDecimal = (num: number | string | null | undefined): string => {
  const n = Number(num)
  if (isNaN(n)) return '0.00'
  return n.toLocaleString('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}
