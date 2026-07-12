import z from 'zod'

export const createBranchSchema = z.object({
  name: z.string().min(2, { message: 'ชื่อสาขาต้องระบุอย่างน้อย 2 ตัวอักษร' }),
  address: z.string().min(5, 'กรุณาระบุที่อยู่โดยละเอียด'),
  province: z.string().min(1, 'กรุณาเลือกจังหวัด'),
  district: z.string().min(1, 'กรุณาเลือกอำเภอ'),
  subDistrict: z.string().min(1, 'กรุณาเลือกตำบล'),
  postcode: z.string().length(5, 'รหัสไปรษณีย์ต้องมี 5 หลัก'),
  mapUrl: z.url('URL แผนที่ไม่ถูกต้อง').optional().or(z.literal('')),
  openingHours: z
    .array(
      z.object({
        day: z.string(),
        open: z.string().default('09:00'),
        close: z.string().default('18:00'),
        isOpen: z.boolean().default(false),
      }),
    )
    .optional(),
})

export type CreateBranchFormValues = z.input<typeof createBranchSchema>
