import { BankAccountType } from '@/generated/prisma/enums'
import * as z from 'zod'

export const bankAccountSchema = z.object({
  type: z.enum(BankAccountType).default(BankAccountType.STANDARD_TRANSFER),
  bankName: z.string().min(1, { message: 'กรุณาระบุชื่อธนาคาร' }),
  accountNumber: z.string().min(1, { message: 'กรุณาระบุเลขบัญชี' }),
  accountName: z.string().min(1, { message: 'กรุณาระบุชื่อบัญชี' }),
  promptPayId: z.string().optional(),
  qrImage: z.string().optional(),
  isDefault: z.boolean().default(false),
})

export const paymentSettingSchema = z.object({
  isBankTransferEnabled: z.boolean().default(true),
  isStripeEnabled: z.boolean().default(false),
  stripeSecretKey: z.string().optional(),
  stripePublicKey: z.string().optional(),
})

export type BankAccountFormValues = z.input<typeof bankAccountSchema>
export type PaymentSettingFormValues = z.input<typeof paymentSettingSchema>
