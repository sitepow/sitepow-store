import z from 'zod'

export const createBranchSchema = z.object({
  name: z.string().min(2, { message: 'ชื่อสาขาต้องระบุอย่างน้อย 2 ตัวอักษร' }),
  address: z.string().min(5, 'กรุณาระบุที่อยู่โดยละเอียด'),
  province: z.string().min(1, 'กรุณาเลือกจังหวัด'),
  district: z.string().min(1, 'กรุณาเลือกอำเภอ'),
  subDistrict: z.string().min(1, 'กรุณาเลือกตำบล'),
  postcode: z.string().length(5, 'รหัสไปรษณีย์ต้องมี 5 หลัก'),
})

export type CreateBranchFormValues = z.input<typeof createBranchSchema>
