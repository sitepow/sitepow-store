import { ShippingZoneType } from '@/generated/prisma/enums'
import * as z from 'zod'

export const weightRateSchema = z.object({
  id: z.string().optional(),
  minWeight: z.number({ message: 'กรุณาระบุน้ำหนักเริ่มต้น' }),
  maxWeight: z.number({ message: 'กรุณาระบุน้ำหนักสิ้นสุด' }),
  fee: z.number({ message: 'กรุณาระบุราคาค่าส่ง' }),
})

export const zoneRateSchema = z.object({
  zoneType: z.enum(ShippingZoneType),
  additionalFee: z.number({ message: 'กรุณาระบุค่าบริการเพิ่มเติม' }),
})

export const courierServiceFormSchema = z.object({
  courierServiceId: z.string(),
  isEnabled: z.boolean(),
  weightRates: z.array(weightRateSchema),
  zoneRates: z.array(zoneRateSchema),
})

export const shippingSettingsFormSchema = z.object({
  freeShipMin: z.number({ message: 'กรุณาระบุยอดส่งฟรีขั้นต่ำ' }),
  services: z.array(courierServiceFormSchema),
})

export type ShippingSettingsFormValues = z.infer<
  typeof shippingSettingsFormSchema
>
