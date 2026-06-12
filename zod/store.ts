import { Plan } from '@/generated/prisma/enums'
import z from 'zod'

export const createStoreSchema = z
  .object({
    name: z
      .string()
      .min(2, { message: 'ชื่อร้านค้าต้องระบุอย่างน้อย 2 ตัวอักษร' }),
    slug: z
      .string()
      .min(3, { message: 'URL Slug ต้องระบุอย่างน้อย 3 ตัวอักษร' })
      .regex(/^[a-zA-Z0-9-ก-๙]+$/, {
        message: 'URL ต้องประกอบด้วยตัวอักษร ตัวเลข หรือเครื่องหมายขีดเท่านั้น',
      }),
    description: z.string().optional().or(z.literal('')),
    phone: z
      .string()
      .optional()
      .or(z.literal(''))
      .refine((val) => !val || /^[0-9]{9,10}$/.test(val), {
        message: 'เบอร์โทรศัพท์ต้องเป็นตัวเลข 9-10 หลัก',
      }),
    lineId: z.string().optional().or(z.literal('')),
    facebookPage: z.string().optional().or(z.literal('')),
    // address: z.string().optional().or(z.literal('')),
    taxId: z
      .string()
      .optional()
      .or(z.literal(''))
      .refine((val) => !val || val.length === 13, {
        message: 'เลขผู้เสียภาษีต้องมีความยาว 13 หลักพอดี',
      }),
    isVatRegistered: z.boolean().default(false),
    vatRate: z
      .number()
      .min(0, { message: 'อัตราภาษีต้องไม่ต่ำกว่า 0%' })
      .default(7.0),
    isPointsEnabled: z.boolean().default(false),
    pointEarningRate: z
      .number()
      .min(0, { message: 'อัตราแต้มที่ได้รับต้องมากกว่าหรือเท่ากับ 0' })
      .optional(),
    pointRedeemRate: z
      .number()
      .min(0, { message: 'มูลค่าของแต้มต้องมากกว่าหรือเท่ากับ 0' })
      .optional(),
    plan: z.enum(Plan).default(Plan.STARTER),
  })
  .superRefine((data, ctx) => {
    if (data.isPointsEnabled && data.plan !== Plan.ULTIMATE) {
      ctx.addIssue({
        code: 'custom',
        message: 'ระบบสมาชิก & สะสมแต้ม รองรับเฉพาะแพลน Ultimate เท่านั้น',
        path: ['isPointsEnabled'],
      })
    }

    if (data.isPointsEnabled) {
      if (!data.pointEarningRate || data.pointEarningRate <= 0) {
        ctx.addIssue({
          code: 'custom',
          message: 'กรุณาระบุยอดซื้อเพื่อรับแต้ม',
          path: ['pointEarningRate'],
        })
      }
      if (!data.pointRedeemRate || data.pointRedeemRate <= 0) {
        ctx.addIssue({
          code: 'custom',
          message: 'กรุณาระบุมูลค่าส่วนลดต่อแต้ม',
          path: ['pointRedeemRate'],
        })
      }
    }
  })

export type CreateStoreFormValues = z.input<typeof createStoreSchema>
