export interface AffiliateCustomerInfo {
  firstName?: string | null
  lastName?: string | null
  email?: string | null
  phone?: string | null
  avatar?: string | null
}

export interface AffiliateAccountItem {
  id: string
  referralCode: string
  balance: number | string
  totalEarned: number | string
  totalWithdrawn: number | string
  promptPayNumber?: string | null
  bankName?: string | null
  bankAccountNo?: string | null
  bankAccountName?: string | null
  customer?: AffiliateCustomerInfo | null
  _count?: {
    referrals: number
  }
}

export interface AffiliatePayoutItem {
  id: string
  createdAt: Date | string
  amount: number | string
  status: string
  promptPayNumber?: string | null
  bankName?: string | null
  bankAccountNo?: string | null
  bankAccountName?: string | null
  paymentProof?: string | null
  note?: string | null
  affiliateAccount?: {
    referralCode?: string
    customer?: AffiliateCustomerInfo | null
  } | null
}

export interface AffiliateReferralItem {
  id: string
  createdAt: Date | string
  orderAmount: number | string
  commissionRate: number | string
  commissionAmount: number | string
  status: string
  order?: {
    orderNumber?: string
  } | null
  affiliateAccount?: {
    referralCode?: string
    customer?: AffiliateCustomerInfo | null
  } | null
}
