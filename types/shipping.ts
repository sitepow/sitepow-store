export interface WeightRate {
  id?: string
  minWeight: number
  maxWeight: number
  fee: number
}

export interface ZoneRate {
  zoneType: 'NORMAL' | 'REMOTE_AREA' | 'BORDER_PROVINCES'
  additionalFee: number
}

export interface CourierServiceMock {
  id: string
  code: string
  name: string
  estimatedDays: string
}

export interface CourierMock {
  id: string
  code: string
  name: string
  description: string
  services: CourierServiceMock[]
}

export const COURIERS_LIST: CourierMock[] = [
  {
    id: 'c-thaipost',
    code: 'THAIPOST',
    name: 'ไปรษณีย์ไทย (Thailand Post)',
    description:
      'บริการจัดส่งพัสดุผ่านรัฐวิสาหกิจไทย มีเครือข่ายครอบคลุมทั่วประเทศ',
    services: [
      {
        id: 'cs-ems',
        code: 'THAIPOST_EMS',
        name: 'EMS (ส่งด่วนพิเศษ)',
        estimatedDays: '1-2 วัน',
      },
      {
        id: 'cs-reg',
        code: 'THAIPOST_REG',
        name: 'ลงทะเบียน (ส่งปกติ)',
        estimatedDays: '3-5 วัน',
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
        code: 'FLASH_STANDARD',
        name: 'Flash Speed (ส่งด่วนปกติ)',
        estimatedDays: '1-3 วัน',
      },
      {
        id: 'cs-flash-blk',
        code: 'FLASH_BULKY',
        name: 'Flash Bulky (สินค้าขนาดใหญ่)',
        estimatedDays: '2-4 วัน',
      },
    ],
  },
  {
    id: 'c-jnt',
    code: 'JNT',
    name: 'J&T Express',
    description:
      'บริการจัดส่งพัสดุด่วน 365 วัน ไม่มีวันหยุด ตอบโจทย์ร้านค้าออนไลน์',
    services: [
      {
        id: 'cs-jnt-std',
        code: 'JNT_STANDARD',
        name: 'J&T Standard Delivery',
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
        code: 'SPX_STANDARD',
        name: 'SPX Standard Delivery',
        estimatedDays: '1-3 วัน',
      },
    ],
  },
  {
    id: 'c-ninjavan',
    code: 'NINJAVAN',
    name: 'Ninja Van',
    description: 'บริการขนส่งพัสดุด่วนเทคโนโลยีล้ำสมัย ครอบคลุมพื้นที่ทั่วไทย',
    services: [
      {
        id: 'cs-ninja-std',
        code: 'NINJAVAN_STANDARD',
        name: 'Ninja Easy',
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
        code: 'DHL_STANDARD',
        name: 'DHL eCommerce Premium',
        estimatedDays: '1-2 วัน',
      },
    ],
  },
  {
    id: 'c-nim',
    code: 'NIM',
    name: 'Nim Express',
    description:
      'ผู้เชี่ยวชาญด้านการขนส่งพัสดุขนาดใหญ่ สินค้าหนัก และควบคุมอุณหภูมิ',
    services: [
      {
        id: 'cs-nim-std',
        code: 'NIM_STANDARD',
        name: 'Nim Express ทั่วไป',
        estimatedDays: '1-3 วัน',
      },
      {
        id: 'cs-nim-chilled',
        code: 'NIM_CHILLED',
        name: 'Nim Chilled (ขนส่งแบบแช่เย็น/แช่แข็ง)',
        estimatedDays: '1-2 วัน',
      },
    ],
  },
]
