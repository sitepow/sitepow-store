import { ShippingZoneType } from '@/generated/prisma/enums'
import * as z from 'zod'

const shippingZoneEnumValues = Object.values(ShippingZoneType) as [
  string,
  ...string[],
]

export const weightRateSchema = z.object({
  id: z.string().optional(),

  zoneType: z.enum(shippingZoneEnumValues, {
    message: 'กรุณาระบุประเภทโซนความสัมพันธ์เส้นทาง',
  }),

  minWeight: z.number({ message: 'กรุณาระบุน้ำหนักเริ่มต้น' }),
  maxWeight: z.number({ message: 'กรุณาระบุน้ำหนักสิ้นสุด' }),
  fee: z.number({ message: 'กรุณาระบุราคาค่าส่ง' }),
})

export const zoneRateSchema = z.object({
  zoneType: z.enum(shippingZoneEnumValues),
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

  storeProvince: z
    .string()
    .min(1, { message: 'กรุณาระบุจังหวัดต้นทางของร้านค้า' }),
  storeDistrict: z
    .string()
    .min(1, { message: 'กรุณาระบุอำเภอ/เขตต้นทางของร้านค้า' }),
  storePostcode: z.number({ message: 'กรุณาระบุรหัสไปรษณีย์ต้นทาง' }),

  services: z.array(courierServiceFormSchema),
})

export type ShippingSettingsFormValues = z.infer<
  typeof shippingSettingsFormSchema
>
