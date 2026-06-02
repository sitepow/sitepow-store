import { Courier, CourierService } from '@/generated/prisma/client'

export interface CourierWithServices extends Omit<
  Courier,
  'createdAt' | 'updatedAt'
> {
  services: Omit<CourierService, 'createdAt' | 'updatedAt'>[]
}

export const COURIERS_LIST: CourierWithServices[] = [
  {
    id: 'c-thaipost',
    code: 'THAIPOST',
    name: 'ไปรษณีย์ไทย (Thailand Post)',
    description:
      'บริการจัดส่งพัสดุผ่านรัฐวิสาหกิจไทย มีเครือข่ายครอบคลุมทั่วประเทศ',
    services: [
      {
        id: 'cs-ems',
        courierId: 'c-thaipost',
        code: 'THAIPOST_EMS',
        name: 'EMS (ส่งด่วนพิเศษ)',
        estimatedDays: '1-2 วัน',
      },
    ],
  },
  {
    id: 'c-flash',
    code: 'FLASH',
    name: 'Flash Express',
    description: 'บริการเข้ารับและจัดส่งพัสดุด่วนครอบคลุม 77 จังหวัดทั่วประเทศ',

    services: [
      {
        id: 'cs-flash-std',
        courierId: 'c-flash',
        code: 'FLASH_STANDARD',
        name: 'Flash Speed (ส่งด่วนปกติ)',
        estimatedDays: '1-3 วัน',
      },
    ],
  },
  {
    id: 'c-kerry',
    code: 'KERRY',
    name: 'Kerry Express (KEX)',
    description:
      'บริการจัดส่งพัสดุด่วนชั้นนำ รวดเร็ว ปลอดภัย ได้รับความนิยมสูง',

    services: [
      {
        id: 'cs-kerry-std',
        courierId: 'c-kerry',
        code: 'KERRY_STANDARD',
        name: 'Kerry Parcel Delivery',
        estimatedDays: '1-2 วัน',
      },
    ],
  },
  {
    id: 'c-spx',
    code: 'SPX',
    name: 'SPX Express',
    description:
      'บริการขนส่งพัสดุด่วนที่เติบโตอย่างรวดเร็ว เน้นตอบโจทย์ e-Commerce',

    services: [
      {
        id: 'cs-spx-std',
        courierId: 'c-spx',
        code: 'SPX_STANDARD',
        name: 'SPX Standard Delivery',
        estimatedDays: '1-3 วัน',
      },
    ],
  },
  {
    id: 'c-best',
    code: 'BEST',
    name: 'Best Express',
    description:
      'บริการรับ-ส่งพัสดุถึงที่ทั่วไทย มีเครือข่ายแฟรนไชส์ที่แข็งแกร่ง',

    services: [
      {
        id: 'cs-best-std',
        courierId: 'c-best',
        code: 'BEST_STANDARD',
        name: 'Best Express Delivery',
        estimatedDays: '1-3 วัน',
      },
    ],
  },
  {
    id: 'c-dhl',
    code: 'DHL',
    name: 'DHL Express (Domestic)',
    description:
      'บริการขนส่งพัสดุมาตรฐานระดับโลก มั่นใจเรื่องความปลอดภัยและเป็นระบบ',

    services: [
      {
        id: 'cs-dhl-std',
        courierId: 'c-dhl',
        code: 'DHL_STANDARD',
        name: 'DHL eCommerce Premium',
        estimatedDays: '1-2 วัน',
      },
    ],
  },
]

export const SHIPPING_WEIGHT_TIERS = [
  { minWeight: 0, maxWeight: 1000, width: 14, length: 20, height: 6 },
  { minWeight: 1001, maxWeight: 2000, width: 17, length: 25, height: 9 },
  { minWeight: 2001, maxWeight: 3000, width: 20, length: 30, height: 11 },
  { minWeight: 3001, maxWeight: 5000, width: 22, length: 35, height: 14 },
]
