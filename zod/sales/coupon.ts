import { DiscountType } from '@/generated/prisma/enums'
import z from 'zod'

export const createCouponSchema = z
  .object({
    code: z
      .string()
      .min(3, { message: 'รหัสคูปองต้องมีอย่างน้อย 3 ตัวอักษร' })
      .regex(/^[A-Z0-9_-]+$/, {
        message: 'รหัสคูปองต้องเป็นตัวพิมพ์ใหญ่ ตัวเลข หรือ _ - เท่านั้น',
      }),
    description: z.string().optional().or(z.literal('')),
    discountType: z.enum(DiscountType, {
      message: 'กรุณาเลือกประเภทส่วนลด',
    }),
    discountAmount: z
      .number({ message: 'กรุณาระบุมูลค่าส่วนลด' })
      .positive({ message: 'มูลค่าส่วนลดต้องมากกว่า 0' }),
    minOrderAmount: z
      .number({ message: 'กรุณาระบุยอดขั้นต่ำ' })
      .min(0, { message: 'ยอดขั้นต่ำต้องไม่ติดลบ' })
      .default(0),
    maxDiscount: z
      .number({ message: 'กรุณาระบุส่วนลดสูงสุด' })
      .positive({ message: 'ส่วนลดสูงสุดต้องมากกว่า 0' })
      .nullable(),
    startDate: z.string().min(1, { message: 'กรุณาเลือกวันเริ่มต้น' }),
    endDate: z.string().min(1, { message: 'กรุณาเลือกวันสิ้นสุด' }),
    usageLimit: z
      .number({ message: 'กรุณาระบุจำนวนสิทธิ์' })
      .int({ message: 'จำนวนสิทธิ์ต้องเป็นจำนวนเต็ม' })
      .positive({ message: 'จำนวนสิทธิ์ต้องมากกว่า 0' })
      .optional()
      .nullable(),
    branchId: z.string().optional().nullable(),
  })
  .superRefine((data, ctx) => {
    if (data.endDate <= data.startDate) {
      ctx.addIssue({
        code: 'custom',
        message: 'วันสิ้นสุดต้องมาหลังวันเริ่มต้น',
        path: ['endDate'],
      })
    }
    if (data.discountType === DiscountType.PERCENTAGE) {
      if (data.discountAmount > 100) {
        ctx.addIssue({
          code: 'custom',
          message: 'ส่วนลดแบบเปอร์เซ็นต์ต้องไม่เกิน 100%',
          path: ['discountAmount'],
        })
      }
    }
  })

export type CreateCouponFormValues = z.input<typeof createCouponSchema>
