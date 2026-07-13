export enum CheckoutType {
  SUBSCRIPTION = 'SUBSCRIPTION',
  CREDIT = 'CREDIT',
  OTHER = 'OTHER',
}

export enum PaymentMethod {
  CARD = 'card',
  PROMPTPAY = 'promptpay',
}

export interface CheckoutParams {
  amount: number
  description: string
  successUrl: string
  cancelUrl: string
  metadata: {
    type: CheckoutType
    relatedId: string
    [key: string]: string
  }
}
