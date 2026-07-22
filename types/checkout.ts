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
