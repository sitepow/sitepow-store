import { AddressType } from '@/generated/prisma/enums'
import z from 'zod'

export const addressSchema = z
  .object({
    name: z.string().min(1, 'กรุณาระบุป้ายกำกับที่อยู่'),
    phone: z.string().min(9, 'กรุณาระบุเบอร์โทรศัพท์ที่ถูกต้อง'),
    addressLine: z.string().min(1, 'กรุณาระบุที่อยู่'),
    subDistrict: z.string().min(1, 'กรุณาระบุตำบล'),
    district: z.string().min(1, 'กรุณาระบุอำเภอ'),
    province: z.string().min(1, 'กรุณาระบุจังหวัด'),
    postalCode: z.string().length(5, 'รหัสไปรษณีย์ต้องมี 5 หลัก'),
    type: z.enum(AddressType),
    taxName: z.string().optional(),
    taxId: z.string().optional(),
    branchCode: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.type === AddressType.TAX || data.type === AddressType.BOTH) {
        return (
          !!data.taxName &&
          !!data.taxId &&
          data.taxId.length === 13 &&
          !!data.branchCode
        )
      }
      return true
    },
    {
      message: 'กรุณากรอกข้อมูลภาษีให้ครบถ้วน (เลขผู้เสียภาษี 13 หลัก)',
      path: ['taxId'],
    },
  )

export type AddressFormValues = z.infer<typeof addressSchema>
