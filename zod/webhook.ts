import z from 'zod'

export const webhookEndpointSchema = z.object({
  url: z
    .string()
    .min(1, 'กรุณาระบุ URL')
    .refine(
      (val) =>
        val.startsWith('https://') ||
        val.startsWith('http://localhost') ||
        val.startsWith('http://127.0.0.1'),
      'URL ต้องขึ้นต้นด้วย https:// (หรือ http://localhost สำหรับทดสอบในเครื่อง)',
    ),
  description: z.string().optional().nullable(),
  events: z.array(z.string()).min(1, 'กรุณาเลือกอย่างน้อย 1 Event'),
  isActive: z.boolean().default(true),
})

export type WebhookEndpointFormValues = z.input<typeof webhookEndpointSchema>
