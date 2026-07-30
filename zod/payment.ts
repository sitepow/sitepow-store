import { FORBIDDEN_TITLES, THAI_NAME_REGEX } from '@/constants/system'
import { BankAccountType } from '@/generated/prisma/enums'
import * as z from 'zod'

export const bankAccountSchema = z
  .object({
    type: z.enum(BankAccountType),
    bankName: z.string().min(1, { message: 'กรุณาระบุชื่อธนาคาร' }),
    accountNumber: z.string().optional(),
    accountName: z
      .string()
      .min(1, { message: 'กรุณาระบุชื่อบัญชี' })
      .refine(
        (val) => {
          const trimmed = val.trim()
          return THAI_NAME_REGEX.test(trimmed)
        },
        {
          message: 'กรุณากรอกชื่อบัญชีเป็นภาษาไทยเท่านั้น',
        },
      )
      .refine(
        (val) => {
          const trimmed = val.trim()
          return !FORBIDDEN_TITLES.some((title) => trimmed.startsWith(title))
        },
        {
          message:
            'ห้ามใส่คำนำหน้า (เช่น นาย, นาง, นางสาว, บริษัท) กรุณากรอกเฉพาะ ชื่อ-นามสกุล',
        },
      ),
    promptPayId: z.string().optional(),
    qrImage: z.string().optional(),
    isDefault: z.boolean().default(false),
  })
  .superRefine((data, ctx) => {
    if (data.type === BankAccountType.PROMPTPAY) {
      if (!data.promptPayId || data.promptPayId.length < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'กรุณาระบุหมายเลขพร้อมเพย์',
          path: ['promptPayId'],
        })
      } else {
        const cleanedPromptPay = data.promptPayId.replace(/\D/g, '')
        if (cleanedPromptPay.length !== 10 && cleanedPromptPay.length !== 13) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message:
              'หมายเลขพร้อมเพย์ต้องมี 10 หลัก (เบอร์โทร) หรือ 13 หลัก (บัตรประชาชน)',
            path: ['promptPayId'],
          })
        }
      }
    } else {
      if (!data.accountNumber || data.accountNumber.length < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'กรุณาระบุเลขบัญชี',
          path: ['accountNumber'],
        })
      } else {
        const cleanedAccNumber = data.accountNumber.replace(/\D/g, '')
        if (cleanedAccNumber.length !== 10) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'เลขบัญชีธนาคารต้องมี 10 หลัก',
            path: ['accountNumber'],
          })
        }
      }
    }
  })

export const paymentSettingSchema = z.object({
  isBankTransferEnabled: z.boolean().default(true),
  isStripeEnabled: z.boolean().default(false),
  stripeSecretKey: z.string().optional(),
  stripeWebhookSecret: z.string().optional(),
})

export type BankAccountFormValues = z.input<typeof bankAccountSchema>
export type PaymentSettingFormValues = z.input<typeof paymentSettingSchema>
