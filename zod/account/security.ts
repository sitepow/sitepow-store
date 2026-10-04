import z from 'zod'

export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, { message: 'กรุณาระบุรหัสผ่านปัจจุบัน' }),
    newPassword: z
      .string()
      .min(8, { message: 'รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 8 ตัวอักษร' }),
    confirmPassword: z.string().min(1, { message: 'กรุณายืนยันรหัสผ่านใหม่' }),
  })
  .superRefine((data, ctx) => {
    if (data.newPassword !== data.confirmPassword) {
      ctx.addIssue({
        code: 'custom',
        message: 'รหัสผ่านใหม่และการยืนยันรหัสผ่านไม่ตรงกัน',
        path: ['confirmPassword'],
      })
    }
  })

export const twoFactorSchema = z.object({
  isTwoFactorEnabled: z.boolean(),
})

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>
export type TwoFactorFormValues = z.infer<typeof twoFactorSchema>
