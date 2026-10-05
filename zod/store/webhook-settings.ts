import { z } from 'zod'

export const WEBHOOK_AVAILABLE_EVENTS = [
  {
    value: 'order.created',
    label: 'สร้างคำสั่งซื้อใหม่ (order.created)',
    description: 'ส่งเมื่อลูกค้าสร้างคำสั่งซื้อใหม่เข้ามาในระบบ',
  },
  {
    value: 'order.paid',
    label: 'ชำระเงินสำเร็จ (order.paid)',
    description:
      'ส่งเมื่อคำสั่งซื้อได้รับการชำระเงินเรียบร้อยแล้ว (แนะนำสำหรับระบบบอทเติมเกม / API อัตโนมัติ)',
  },
  {
    value: 'order.shipped',
    label: 'จัดส่งสินค้าสำเร็จ (order.shipped)',
    description: 'ส่งเมื่อคำสั่งซื้อเปลี่ยนสถานะเป็นจัดส่งแล้วหรือส่งมอบสำเร็จ',
  },
  {
    value: 'order.cancelled',
    label: 'ยกเลิกคำสั่งซื้อ (order.cancelled)',
    description: 'ส่งเมื่อคำสั่งซื้อถูกยกเลิก',
  },
] as const

export type WebhookEventValue =
  (typeof WEBHOOK_AVAILABLE_EVENTS)[number]['value']

export const webhookEndpointSchema = z.object({
  url: z
    .string({ message: 'กรุณากรอก Webhook URL' })
    .url({ message: 'รูปแบบ URL ไม่ถูกต้อง' })
    .refine(
      (url) =>
        url.startsWith('https://') ||
        url.startsWith('http://localhost') ||
        url.startsWith('http://127.0.0.1'),
      {
        message: 'Webhook URL ต้องเป็น HTTPS (หรือ localhost สำหรับทดสอบ)',
      },
    ),
  secret: z
    .string({ message: 'กรุณากรอก Secret Key' })
    .min(16, { message: 'Secret Key ต้องมีความยาวอย่างน้อย 16 ตัวอักษร' }),
  description: z.string().optional().nullable(),
  isActive: z.boolean(),
  events: z
    .array(z.string())
    .min(1, { message: 'กรุณาเลือกเหตุการณ์ (Events) อย่างน้อย 1 รายการ' }),
})

export type WebhookEndpointFormValues = z.infer<typeof webhookEndpointSchema>
