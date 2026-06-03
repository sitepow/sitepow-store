import {
  Courier,
  CourierService,
  ShippingZoneType,
} from '@/generated/prisma/client'
import { ShippingFormValues } from '@/zod/shipping'

export interface CourierWithServices extends Omit<
  Courier,
  'createdAt' | 'updatedAt'
> {
  services: Omit<CourierService, 'createdAt' | 'updatedAt'>[]
}

export const DEFAULT_WEIGHT_STEP = 1000
export const DEFAULT_SHIPPING_FEE = 45
export const INITIAL_MIN_WEIGHT = 0

export const COURIER_MAPPING: Record<string, string> = {
  EMST: 'THAIPOST_EMS',
  FLE: 'FLASH_STANDARD',
  KRYD: 'KERRY_STANDARD',
  SPX: 'SPX_STANDARD',
  BEST: 'BEST_STANDARD',
  DHL: 'DHL_STANDARD',
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

export const REMOTE_PROVINCES = ['แม่ฮ่องสอน', 'ยะลา', 'ปัตตานี', 'นราธิวาส']

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

export const PROVINCES_POOL = [
  // { name: 'กรุงเทพมหานคร', district: 'เขตพระนคร', postcode: 10200 },
  { name: 'สมุทรปราการ', district: 'เมืองสมุทรปราการ', postcode: 10270 },
  // { name: 'นนทบุรี', district: 'เมืองนนทบุรี', postcode: 11000 },
  // { name: 'ปทุมธานี', district: 'เมืองปทุมธานี', postcode: 12000 },
  // { name: 'พระนครศรีอยุธยา', district: 'พระนครศรีอยุธยา', postcode: 13000 },
  // { name: 'อ่างทอง', district: 'เมืองอ่างทอง', postcode: 14000 },
  // { name: 'ลพบุรี', district: 'เมืองลพบุรี', postcode: 15000 },
  // { name: 'สิงห์บุรี', district: 'เมืองสิงห์บุรี', postcode: 16000 },
  // { name: 'ชัยนาท', district: 'เมืองชัยนาท', postcode: 17000 },
  // { name: 'สระบุรี', district: 'เมืองสระบุรี', postcode: 18000 },
  // { name: 'ชลบุรี', district: 'เมืองชลบุรี', postcode: 20000 },
  // { name: 'ระยอง', district: 'เมืองระยอง', postcode: 21000 },
  // { name: 'จันทบุรี', district: 'เมืองจันทบุรี', postcode: 22000 },
  // { name: 'ตราด', district: 'เมืองตราด', postcode: 23000 },
  // { name: 'ฉะเชิงเทรา', district: 'เมืองฉะเชิงเทรา', postcode: 24000 },
  // { name: 'นครนายก', district: 'เมืองนครนายก', postcode: 26000 },
  // { name: 'ปราจีนบุรี', district: 'เมืองปราจีนบุรี', postcode: 25000 },
  // { name: 'สระแก้ว', district: 'เมืองสระแก้ว', postcode: 27000 },
  // { name: 'นครราชสีมา', district: 'เมืองนครราชสีมา', postcode: 30000 },
  // { name: 'บุรีรัมย์', district: 'เมืองบุรีรัมย์', postcode: 31000 },
  // { name: 'สุรินทร์', district: 'เมืองสุรินทร์', postcode: 32000 },
  // { name: 'ศรีสะเกษ', district: 'เมืองศรีสะเกษ', postcode: 33000 },
  // { name: 'อุบลราชธานี', district: 'เมืองอุบลราชธานี', postcode: 34000 },
  // { name: 'ยโสธร', district: 'เมืองยโสธร', postcode: 35000 },
  // { name: 'ชัยภูมิ', district: 'เมืองชัยภูมิ', postcode: 36000 },
  // { name: 'อำนาจเจริญ', district: 'เมืองอำนาจเจริญ', postcode: 37000 },
  // { name: 'บึงกาฬ', district: 'เมืองบึงกาฬ', postcode: 38000 },
  // { name: 'หนองบัวลำภู', district: 'เมืองหนองบัวลำภู', postcode: 39000 },
  // { name: 'ขอนแก่น', district: 'เมืองขอนแก่น', postcode: 40000 },
  // { name: 'อุดรธานี', district: 'เมืองอุดรธานี', postcode: 41000 },
  // { name: 'เลย', district: 'เมืองเลย', postcode: 42000 },
  // { name: 'หนองคาย', district: 'เมืองหนองคาย', postcode: 43000 },
  // { name: 'มหาสารคาม', district: 'เมืองมหาสารคาม', postcode: 44000 },
  // { name: 'ร้อยเอ็ด', district: 'เมืองร้อยเอ็ด', postcode: 45000 },
  // { name: 'กาฬสินธุ์', district: 'เมืองกาฬสินธุ์', postcode: 46000 },
  // { name: 'สกลนคร', district: 'เมืองสกลนคร', postcode: 47000 },
  // { name: 'นครพนม', district: 'เมืองนครพนม', postcode: 48000 },
  // { name: 'มุกดาหาร', district: 'เมืองมุกดาหาร', postcode: 49000 },
  // { name: 'เชียงใหม่', district: 'เมืองเชียงใหม่', postcode: 50000 },
  // { name: 'ลำพูน', district: 'เมืองลำพูน', postcode: 51000 },
  // { name: 'ลำปาง', district: 'เมืองลำปาง', postcode: 52000 },
  // { name: 'อุตรดิตถ์', district: 'เมืองอุตรดิตถ์', postcode: 53000 },
  // { name: 'แพร่', district: 'เมืองแพร่', postcode: 54000 },
  // { name: 'น่าน', district: 'เมืองน่าน', postcode: 55000 },
  // { name: 'พะเยา', district: 'เมืองพะเยา', postcode: 56000 },
  // { name: 'เชียงราย', district: 'เมืองเชียงราย', postcode: 57000 },
  // { name: 'แม่ฮ่องสอน', district: 'เมืองแม่ฮ่องสอน', postcode: 58000 },
  // { name: 'นครสวรรค์', district: 'เมืองนครสวรรค์', postcode: 60000 },
  // { name: 'อุทัยธานี', district: 'เมืองอุทัยธานี', postcode: 61000 },
  // { name: 'กำแพงเพชร', district: 'เมืองกำแพงเพชร', postcode: 62000 },
  // { name: 'ตาก', district: 'เมืองตาก', postcode: 63000 },
  // { name: 'สุโขทัย', district: 'เมืองสุโขทัย', postcode: 64000 },
  // { name: 'พิษณุโลก', district: 'เมืองพิษณุโลก', postcode: 65000 },
  // { name: 'พิจิตร', district: 'เมืองพิจิตร', postcode: 66000 },
  // { name: 'เพชรบูรณ์', district: 'เมืองเพชรบูรณ์', postcode: 67000 },
  // { name: 'ราชบุรี', district: 'เมืองราชบุรี', postcode: 70000 },
  // { name: 'กาญจนบุรี', district: 'เมืองกาญจนบุรี', postcode: 71000 },
  // { name: 'สุพรรณบุรี', district: 'เมืองสุพรรณบุรี', postcode: 72000 },
  // { name: 'นครปฐม', district: 'เมืองนครปฐม', postcode: 73000 },
  // { name: 'สมุทรสาคร', district: 'เมืองสมุทรสาคร', postcode: 74000 },
  // { name: 'สมุทรสงคราม', district: 'เมืองสมุทรสงคราม', postcode: 75000 },
  // { name: 'เพชรบุรี', district: 'เมืองเพชรบุรี', postcode: 76000 },
  // {
  //   name: 'ประจวบคีรีขันธ์',
  //   district: 'เมืองประจวบคีรีขันธ์',
  //   postcode: 77000,
  // },
  // { name: 'นครศรีธรรมราช', district: 'เมืองนครศรีธรรมราช', postcode: 80000 },
  // { name: 'กระบี่', district: 'เมืองกระบี่', postcode: 81000 },
  // { name: 'พังงา', district: 'เมืองพังงา', postcode: 82000 },
  // { name: 'ภูเก็ต', district: 'เมืองภูเก็ต', postcode: 83000 },
  // { name: 'สุราษฎร์ธานี', district: 'เมืองสุราษฎร์ธานี', postcode: 84000 },
  // { name: 'ระนอง', district: 'เมืองระนอง', postcode: 85000 },
  // { name: 'ชุมพร', district: 'เมืองชุมพร', postcode: 86000 },
  // { name: 'สงขลา', district: 'เมืองสงขลา', postcode: 90000 },
  // { name: 'สตูล', district: 'เมืองสตูล', postcode: 91000 },
  // { name: 'ตรัง', district: 'เมืองตรัง', postcode: 92000 },
  // { name: 'พัทลุง', district: 'เมืองพัทลุง', postcode: 93000 },
  // { name: 'ปัตตานี', district: 'เมืองปัตตานี', postcode: 94000 },
  // { name: 'ยะลา', district: 'เมืองยะลา', postcode: 95000 },
  // { name: 'นราธิวาส', district: 'เมืองนราธิวาส', postcode: 96000 },
]

export const SHIPPING_WEIGHT_TIERS = [
  { minWeight: 0, maxWeight: 1000, width: 14, length: 20, height: 6 },
  { minWeight: 1001, maxWeight: 2000, width: 17, length: 25, height: 9 },
  { minWeight: 2001, maxWeight: 3000, width: 20, length: 30, height: 11 },
  { minWeight: 3001, maxWeight: 5000, width: 22, length: 35, height: 14 },
  { minWeight: 5001, maxWeight: 7000, width: 24, length: 40, height: 17 },
  { minWeight: 7001, maxWeight: 10000, width: 30, length: 45, height: 20 },
  { minWeight: 10001, maxWeight: 15000, width: 35, length: 50, height: 25 },
  { minWeight: 15001, maxWeight: 20000, width: 40, length: 50, height: 30 },
]

export const DEFAULT_PRESET_VALUES: ShippingFormValues = {
  freeShipMin: 299,
  storeProvince: 'สมุทรปราการ',
  storeDistrict: 'เมืองสมุทรปราการ',
  storePostcode: 10270,
  services: COURIERS_LIST.flatMap((c) =>
    c.services.map((s) => ({
      courierServiceId: s.id,
      isEnabled: true,
      weightRates: [],
      zoneRates: [],
    })),
  ),
}
