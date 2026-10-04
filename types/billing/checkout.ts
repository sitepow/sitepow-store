export enum CheckoutType {
  SUBSCRIPTION = 'SUBSCRIPTION',
  CREDIT = 'CREDIT',
  OTHER = 'OTHER',
  UPGRADE = 'UPGRADE',
}

export enum PaymentMethod {
  CARD = 'card',
  PROMPTPAY = 'promptpay',
}

export enum UpgradeType {
  NORMAL = 'NORMAL',
  UPGRADE = 'UPGRADE',
}

export interface CheckoutParams {
  customerEmail: string
  amount: number
  description: string
  successUrl: string
  cancelUrl: string
  metadata: {
    type: CheckoutType
    relatedId?: string
    newPlan?: string
    storeId?: string
    billingCycle?: string
  }
}

export interface CreateStoreCheckoutParams {
  storeId: string
  orderId?: string | null
  orderIds?: string
  description: string
  amount: number
  customerEmail?: string
  successUrl: string
  cancelUrl: string
  metadata?: Record<string, string>
}

