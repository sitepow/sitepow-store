export const WEBHOOK_EVENTS = [
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

export type WebhookEventId = (typeof WEBHOOK_EVENTS)[number]['id']
