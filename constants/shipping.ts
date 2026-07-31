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
    id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    name: 'ไปรษณีย์ไทย',
    description:
      'ไปรษณีย์ไทย บริการที่คุ้นเคย มีสาขาครอบคลุมทั่วประเทศถึงหน้าบ้าน',
    services: [
      {
        id: '3c893683-1259-42b7-a37a-4a51e687b1c2',
        courierId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        name: 'ส่งแบบด่วน',
        estimatedDays: '1-3 วัน',
        translations: null,
      },
    ],
    translations: null,
  },
  {
    id: '8a1278de-50c1-4b72-9112-8e7c10c9d413',
    name: 'Flash Express',
    description: 'ขนส่งที่เข้ารับพัสดุถึงที่ เน้นความเร็วและครอบคลุมทั่วไทย',
    services: [
      {
        id: '6f391a27-84bc-419b-b18c-3c58b182d011',
        courierId: '8a1278de-50c1-4b72-9112-8e7c10c9d413',
        name: 'ส่งแบบมาตรฐาน',
        estimatedDays: '1-3 วัน',
        translations: null,
      },
    ],
    translations: null,
  },
  {
    id: '2b49c101-72f8-4e63-95c1-3d7118ef8124',
    name: 'Kerry Express (KEX)',
    description: 'แบรนด์ขนส่งยอดนิยม การันตีความรวดเร็วและปลอดภัย',
    services: [
      {
        id: '9d217281-2244-4011-8e99-5f2148b11128',
        courierId: '2b49c101-72f8-4e63-95c1-3d7118ef8124',
        name: 'ส่งแบบมาตรฐาน',
        estimatedDays: '1-2 วัน',
        translations: null,
      },
    ],
    translations: null,
  },
  {
    id: '7b913122-3841-4569-b102-127c55aa8820',
    name: 'SPX Express',
    description: 'ขนส่งหลักของ Shopee เน้นจัดส่งรวดเร็วสำหรับขาช้อปออนไลน์',
    services: [
      {
        id: '1e884112-9932-4752-a421-6c7102b44455',
        courierId: '7b913122-3841-4569-b102-127c55aa8820',
        name: 'ส่งแบบมาตรฐาน',
        estimatedDays: '1-3 วัน',
        translations: null,
      },
    ],
    translations: null,
  },
  {
    id: '4c728391-1142-4912-8d77-2f88a9113309',
    name: 'Best Express',
    description: 'ขนส่งราคาประหยัดที่มีเครือข่ายจุดรับ-ส่งสินค้าทั่วประเทศ',
    services: [
      {
        id: '5f812399-4412-4019-9122-7e1029c33342',
        courierId: '4c728391-1142-4912-8d77-2f88a9113309',
        name: 'ส่งแบบมาตรฐาน',
        estimatedDays: '1-4 วัน',
        translations: null,
      },
    ],
    translations: null,
  },
  {
    id: '9e127384-5519-4821-b331-4c1182d00199',
    name: 'DHL Express',
    description: 'ผู้นำด้านโลจิสติกส์ระดับโลก มั่นใจในมาตรฐานความปลอดภัย',
    services: [
      {
        id: '7a229104-6632-4119-8221-1b9044c22210',
        courierId: '9e127384-5519-4821-b331-4c1182d00199',
        name: 'ส่งแบบด่วน',
        estimatedDays: '1-2 วัน',
        translations: null,
      },
    ],
    translations: null,
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
  INTERNATIONAL: {
    title: 'ระหว่างประเทศ',
    description: 'ส่งสินค้าข้ามพรมแดนหรือต่างประเทศ',
  },
}
