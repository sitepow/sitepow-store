export const WEBHOOK_EVENTS_TH = [
  {
    id: 'order.created',
    label: 'ออเดอร์ถูกสร้างใหม่ (order.created)',
    description:
      'ส่งเมื่อลูกค้ากด Checkout สั่งซื้อสินค้าผ่านหน้าร้าน หรือ POS',
  },
  {
    id: 'order.paid',
    label: 'ออเดอร์ชำระเงินสำเร็จ (order.paid)',
    description:
      'ส่งเมื่อคำสั่งซื้อได้รับการชำระเงินเรียบร้อยแล้ว (สำคัญสำหรับระบบเติมเงิน/เติมเกมอัตโนมัติ)',
  },
  {
    id: 'order.cancelled',
    label: 'ออเดอร์ถูกยกเลิก (order.cancelled)',
    description: 'ส่งเมื่อคำสั่งซื้อถูกยกเลิก',
  },
] as const

export const WEBHOOK_EVENTS_EN = [
  {
    id: 'order.created',
    label: 'Order Created (order.created)',
    description: 'Triggered when a customer checks out via storefront or POS',
  },
  {
    id: 'order.paid',
    label: 'Order Paid (order.paid)',
    description:
      'Triggered when an order payment succeeds (crucial for digital goods / top-up automation)',
  },
  {
    id: 'order.cancelled',
    label: 'Order Cancelled (order.cancelled)',
    description: 'Triggered when an order is cancelled',
  },
] as const

export const WEBHOOK_EVENTS = WEBHOOK_EVENTS_TH

export type WebhookEventId = (typeof WEBHOOK_EVENTS)[number]['id']

export const WEBHOOK_EVENTS_BY_LOCALE = {
  th: WEBHOOK_EVENTS_TH,
  en: WEBHOOK_EVENTS_EN,
}

export function getWebhookEvents(locale: string = 'th') {
  return locale === 'en' ? WEBHOOK_EVENTS_EN : WEBHOOK_EVENTS_TH
}
