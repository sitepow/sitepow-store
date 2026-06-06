import z from 'zod'

export const notificationSettingsSchema = z.object({
  notifyLowStock: z.boolean().default(true),
  notifyDailySummary: z.boolean().default(true),
  notifyBillingAlert: z.boolean().default(true),
})

export type NotificationSettingsFormValues = z.input<
  typeof notificationSettingsSchema
>
