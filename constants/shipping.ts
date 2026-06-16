import {
  Courier,
  CourierService,
  ShippingZoneType,
} from '@/generated/prisma/client'

export interface CourierWithServices extends Omit<
  Courier,
  'createdAt' | 'updatedAt'
> {
  services: Omit<CourierService, 'createdAt' | 'updatedAt'>[]
}

export const DEFAULT_WEIGHT_STEP = 1000
export const DEFAULT_SHIPPING_FEE = 45
export const INITIAL_MIN_WEIGHT = 0

export const COURIERS_LIST: CourierWithServices[] = [
  {
    id: 'c-thaipost',
    code: 'THAIPOST',
    name: 'ไปรษณีย์ไทย (Thailand Post)',
    description:
      'ไปรษณีย์ไทย บริการที่คุ้นเคย มีสาขาครอบคลุมทั่วประเทศถึงหน้าบ้าน',
    services: [
      {
        id: 'cs-ems',
        courierId: 'c-thaipost',
        code: 'THAIPOST_EMS',
        name: 'EMS ไปรษณีย์ด่วนพิเศษ',
        estimatedDays: '1-3 วัน',
      },
    ],
  },
  {
    id: 'c-flash',
    code: 'FLASH',
    name: 'Flash Express',
    description: 'ขนส่งที่เข้ารับพัสดุถึงที่ เน้นความเร็วและครอบคลุมทั่วไทย',
    services: [
      {
        id: 'cs-flash-std',
        courierId: 'c-flash',
        code: 'FLASH_STANDARD',
        name: 'Flash ส่งด่วนปกติ',
        estimatedDays: '1-3 วัน',
      },
    ],
  },
  {
    id: 'c-kerry',
    code: 'KERRY',
    name: 'Kerry Express (KEX)',
    description: 'แบรนด์ขนส่งยอดนิยม การันตีความรวดเร็วและปลอดภัย',
    services: [
      {
        id: 'cs-kerry-std',
        courierId: 'c-kerry',
        code: 'KERRY_STANDARD',
        name: 'Kerry ส่งด่วนทั่วไป',
        estimatedDays: '1-2 วัน',
      },
    ],
  },
  {
    id: 'c-spx',
    code: 'SPX',
    name: 'SPX Express',
    description: 'ขนส่งหลักของ Shopee เน้นจัดส่งรวดเร็วสำหรับขาช้อปออนไลน์',
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
    description: 'ขนส่งราคาประหยัดที่มีเครือข่ายจุดรับ-ส่งสินค้าทั่วประเทศ',
    services: [
      {
        id: 'cs-best-std',
        courierId: 'c-best',
        code: 'BEST_STANDARD',
        name: 'Best Express ปกติ',
        estimatedDays: '1-4 วัน',
      },
    ],
  },
  {
    id: 'c-dhl',
    code: 'DHL',
    name: 'DHL Express (Domestic)',
    description: 'ผู้นำด้านโลจิสติกส์ระดับโลก มั่นใจในมาตรฐานความปลอดภัย',
    services: [
      {
        id: 'cs-dhl-std',
        courierId: 'c-dhl',
        code: 'DHL_STANDARD',
        name: 'DHL Domestic Express',
        estimatedDays: '1-2 วัน',
      },
    ],
  },
]

export const REGION_MAP: Record<string, string[]> = {
  BKK: [
    'กรุงเทพมหานคร',
    'นนทบุรี',
    'ปทุมธานี',
    'สมุทรปราการ',
    'นครปฐม',
    'สมุทรสาคร',
  ],
  NORTH: [
    'เชียงใหม่',
    'เชียงราย',
    'ลำพูน',
    'ลำปาง',
    'แพร่',
    'น่าน',
    'พะเยา',
    'แม่ฮ่องสอน',
    'อุตรดิตถ์',
  ],
  NE: [
    'ขอนแก่น',
    'นครราชสีมา',
    'อุดรธานี',
    'อุบลราชธานี',
    'บุรีรัมย์',
    'ศรีสะเกษ',
    'สุรินทร์',
    'ร้อยเอ็ด',
    'ชัยภูมิ',
    'สกลนคร',
    'กาฬสินธุ์',
    'มหาสารคาม',
    'นครพนม',
    'เลย',
    'ยโสธร',
    'หนองคาย',
    'หนองบัวลำภู',
    'บึงกาฬ',
    'อำนาจเจริญ',
    'มุกดาหาร',
  ],
  CENTRAL: [
    'พิษณุโลก',
    'นครสวรรค์',
    'สุพรรณบุรี',
    'พระนครศรีอยุธยา',
    'ลพบุรี',
    'กำแพงเพชร',
    'สุโขทัย',
    'พิจิตร',
    'เพชรบูรณ์',
    'อุทัยธานี',
    'สระบุรี',
    'อ่างทอง',
    'สิงห์บุรี',
    'ชัยนาท',
  ],
  EAST: [
    'ชลบุรี',
    'ระยอง',
    'ฉะเชิงเทรา',
    'จันทบุรี',
    'ปราจีนบุรี',
    'สระแก้ว',
    'ตราด',
    'นครนายก',
  ],
  WEST: [
    'ตาก',
    'ราชบุรี',
    'กาญจนบุรี',
    'เพชรบุรี',
    'ประจวบคีรีขันธ์',
    'สมุทรสงคราม',
  ],
  SOUTH: [
    'ภูเก็ต',
    'สงขลา',
    'สุราษฎร์ธานี',
    'นครศรีธรรมราช',
    'กระบี่',
    'พังงา',
    'ตรัง',
    'พัทลุง',
    'ชุมพร',
    'ระนอง',
    'สตูล',
    'ยะลา',
    'ปัตตานี',
    'นราธิวาส',
  ],
}

export const REMOTE_AREAS = [
  {
    province: 'แม่ฮ่องสอน',
    postcode: '58130',
    state: 'ปาย',
    district: 'เวียงใต้',
  },
  {
    province: 'แม่ฮ่องสอน',
    postcode: '58000',
    state: 'เมืองแม่ฮ่องสอน',
    district: 'จองคำ',
  },
  {
    province: 'เชียงใหม่',
    postcode: '50310',
    state: 'อมก๋อย',
    district: 'อมก๋อย',
  },
  {
    province: 'เชียงราย',
    postcode: '57110',
    state: 'แม่ฟ้าหลวง',
    district: 'แม่สลองนอก',
  },
  { province: 'ยะลา', postcode: '95110', state: 'เบตง', district: 'เบตง' },
  {
    province: 'พังงา',
    postcode: '82160',
    state: 'เกาะยาว',
    district: 'เกาะยาวน้อย',
  },
  {
    province: 'สุราษฎร์ธานี',
    postcode: '84280',
    state: 'เกาะสมุย',
    district: 'อ่างทอง',
  },
  {
    province: 'สุราษฎร์ธานี',
    postcode: '84360',
    state: 'เกาะพะงัน',
    district: 'เกาะพะงัน',
  },
  {
    province: 'กระบี่',
    postcode: '81150',
    state: 'เกาะลันตา',
    district: 'เกาะลันตาใหญ่',
  },
  {
    province: 'สตูล',
    postcode: '91000',
    state: 'เมืองสตูล',
    district: 'เกาะหลีเป๊ะ',
  },
  {
    province: 'ตราด',
    postcode: '23170',
    state: 'เกาะช้าง',
    district: 'เกาะช้างใต้',
  },
  {
    province: 'เชียงใหม่',
    postcode: '50240',
    state: 'เวียงแหง',
    district: 'เปียงหลวง',
  },
  {
    province: 'เชียงใหม่',
    postcode: '50280',
    state: 'แม่อาย',
    district: 'แม่อาย',
  },
  {
    province: 'น่าน',
    postcode: '55220',
    state: 'บ่อเกลือ',
    district: 'บ่อเกลือใต้',
  },
  {
    province: 'น่าน',
    postcode: '55130',
    state: 'เฉลิมพระเกียรติ',
    district: 'ห้วยโก๋น',
  },
  {
    province: 'แม่ฮ่องสอน',
    postcode: '58120',
    state: 'ปางมะผ้า',
    district: 'ปางมะผ้า',
  },
  {
    province: 'ภูเก็ต',
    postcode: '83110',
    state: 'ถลาง',
    district: 'เกาะยาว (บางพื้นที่ที่ข้ามไป)',
  },
  { province: 'ระนอง', postcode: '85120', state: 'สุขสำราญ', district: 'นาคา' },
  {
    province: 'สุราษฎร์ธานี',
    postcode: '84310',
    state: 'เกาะเต่า',
    district: 'เกาะเต่า',
  },
  {
    province: 'ปัตตานี',
    postcode: '94150',
    state: 'ไม้แก่น',
    district: 'ไม้แก่น',
  },
  {
    province: 'นราธิวาส',
    postcode: '96160',
    state: 'สุคิริน',
    district: 'สุคิริน',
  },
]

export const ZONE_LABELS: Record<
  ShippingZoneType,
  { title: string; description: string }
> = {
  SAME_PROVINCE: {
    title: 'จังหวัดเดียวกัน',
    description: 'ส่งภายในจังหวัดต้นทาง',
  },
  SAME_REGION: {
    title: 'ภูมิภาคเดียวกัน',
    description: 'ส่งไปจังหวัดอื่นภายในภาคเดียวกัน',
  },
  CROSS_REGION: {
    title: 'ข้ามภูมิภาค',
    description: 'ส่งต่างภาค หรือพื้นที่ระยะไกลปกติ',
  },
  REMOTE_AREA: {
    title: 'พื้นที่ห่างไกลพิเศษ',
    description: 'เกาะ ดอย สูง หรือ 3 จังหวัดชายแดนใต้',
  },
}
