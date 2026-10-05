import crypto from 'crypto'

export function generateWebhookSecret(): string {
  return `whsec_${crypto.randomBytes(24).toString('hex')}`
}

export function generateWebhookSignature(
  payloadString: string,
  secret: string,
): string {
  return crypto.createHmac('sha256', secret).update(payloadString).digest('hex')
}
