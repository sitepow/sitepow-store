import { AddressType, CountryCode } from '@/generated/prisma/enums'
import { z } from 'zod'

export const addressSchema = z
  .object({
    country: z.enum(CountryCode),
    name: z.string().min(1, 'กรุณาระบุป้ายกำกับที่อยู่'),
    type: z.enum(AddressType),
    phone: z.string().optional().or(z.literal('')),
    addressLine: z.string().min(1, 'กรุณากรอกที่อยู่ / บ้านเลขที่'),
    subDistrict: z.string().optional(),
    district: z.string().min(1, 'กรุณาระบุอำเภอ/เขต หรือเมือง (City)'),
    province: z.string().min(1, 'กรุณาระบุจังหวัด หรือ State/Province'),
    postalCode: z
      .string()
      .min(2, 'กรุณาระบุรหัสไปรษณีย์')
      .max(12, 'รหัสไปรษณีย์ไม่ถูกต้อง'),
    receiverName: z.string().optional(),
    taxName: z.string().optional(),
    taxId: z.string().optional(),
    branchCode: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const isThai = data.country === CountryCode.TH

    if (data.phone && data.phone.trim() !== '') {
      const cleanPhone = data.phone.replace(/[\s-]/g, '')
      if (isThai) {
        const rawDigits = cleanPhone.replace(/\D/g, '')
        if (!/^(0[689]\d{8}|0[2-9]\d{7})$/.test(rawDigits)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['phone'],
            message: 'เบอร์โทรศัพท์ในไทยไม่ถูกต้อง (เช่น 0812345678)',
          })
        }
      } else {
        if (!/^\+?[0-9]{7,15}$/.test(cleanPhone)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['phone'],
            message: 'เบอร์โทรศัพท์ระหว่างประเทศไม่ถูกต้อง',
          })
        }
      }
    }

    if (isThai) {
      if (!data.subDistrict || data.subDistrict.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['subDistrict'],
          message: 'กรุณาระบุตำบล/แขวง',
        })
      }
      if (!data.postalCode || data.postalCode.length !== 5) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['postalCode'],
          message: 'รหัสไปรษณีย์ในไทยต้องมี 5 หลัก',
        })
      }
    }
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
