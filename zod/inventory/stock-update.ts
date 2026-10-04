import z from 'zod'

export const updateStockSchema = z.object({
  // quantity: z
  //   .number({ message: 'กรุณาระบุจำนวน' })
  //   .int({ message: 'จำนวนต้องเป็นจำนวนเต็ม' })
  //   .min(0, { message: 'จำนวนต้องไม่ต่ำกว่า 0' }),
  minStock: z
    .number({ message: 'กรุณาระบุจำนวนขั้นต่ำ' })
    .int({ message: 'จำนวนต้องเป็นจำนวนเต็ม' })
    .min(0, { message: 'จำนวนขั้นต่ำต้องไม่ต่ำกว่า 0' }),
})

export type UpdateStockFormValues = z.input<typeof updateStockSchema>
