import { z } from 'zod'

export const notificationSettingsSchema = z.object({
  orderNotify: z.boolean(),
  marketingNotify: z.boolean(),
})

export type NotificationSettingsFormValues = z.infer<
  typeof notificationSettingsSchema
>
