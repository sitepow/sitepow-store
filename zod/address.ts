import { AddressType } from '@/generated/prisma/enums'
import { z } from 'zod'

export const addressSchema = z
  .object({
    name: z.string().min(1, 'กรุณาระบุป้ายกำกับที่อยู่'),
    type: z.enum(AddressType),
    phone: z
      .string()
      .transform((val) => val.replace(/\D/g, ''))
      .pipe(
        z
          .string()
          .regex(/^(0[689]\d{8}|0[2-9]\d{7})$/, 'เบอร์โทรศัพท์ไม่ถูกต้อง'),
      )
      .optional()
      .or(z.literal('')),
    addressLine: z.string().min(1, 'กรุณากรอกบ้านเลขที่'),
    subDistrict: z.string().min(1, 'กรุณาระบุตำบล/แขวง'),
    district: z.string().min(1, 'กรุณาระบุอำเภอ/เขต'),
    province: z.string().min(1, 'กรุณาระบุจังหวัด'),
    postalCode: z.string().length(5, 'รหัสไปรษณีย์ต้องมี 5 หลัก'),
    receiverName: z.string().optional(),
    taxName: z.string().optional(),
    taxId: z.string().optional(),
    branchCode: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const needsShipping =
      data.type === AddressType.SHIPPING || data.type === AddressType.BOTH
    const needsTax =
      data.type === AddressType.TAX || data.type === AddressType.BOTH

    if (needsShipping && !data.receiverName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['receiverName'],
        message: 'กรุณาระบุชื่อผู้รับพัสดุ',
      })
    }

    if (needsTax) {
      if (!data.taxName) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['taxName'],
          message: 'กรุณาระบุชื่อผู้เสียภาษี',
        })
      }
      if (!data.taxId || data.taxId.length !== 13) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['taxId'],
          message: 'เลขประจำตัวผู้เสียภาษีต้องมี 13 หลัก',
        })
      }
      if (!data.branchCode) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['branchCode'],
          message: 'กรุณาระบุรหัสสาขา',
        })
      }
    }
  })

export type AddressSchema = z.infer<typeof addressSchema>
