import { ShippingZoneType } from '@/generated/prisma/client'

import addressData from '@/lib/address/database/db.json'

type SubDistrictData = [string | number, number]
type DistrictData = [string | number, SubDistrictData[]]
type ProvinceData = [string, DistrictData[]]

interface AddressJsonStructure {
  data: ProvinceData[]
}

const REGION_MAP: Record<string, string[]> = {
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

function getRegionByProvinceName(provinceName: string): string {
  const cleanName = provinceName.trim().replace(/ /g, '')
  for (const [region, provinces] of Object.entries(REGION_MAP)) {
    if (provinces.includes(cleanName)) return region
  }
  return 'OTHER'
}

export function determineShippingZone(
  fromProvince: string,
  toProvince: string,
): ShippingZoneType {
  const from = fromProvince.trim().replace(/ /g, '')
  const to = toProvince.trim().replace(/ /g, '')

  if (REMOTE_PROVINCES.includes(to)) {
    return 'REMOTE_AREA'
  }
  if (from === to) {
    return 'SAME_PROVINCE'
  }

  const fromRegion = getRegionByProvinceName(from)
  const toRegion = getRegionByProvinceName(to)

  if (fromRegion === toRegion) {
    return 'SAME_REGION'
  }

  return 'CROSS_REGION'
}

export function getRealProvinceDetails(provinceName: string): {
  postcode: number
  district: string
} {
  const cleanName = provinceName.trim().replace(/ /g, '')

  const typedAddressData = addressData as unknown as AddressJsonStructure
  const provincesList =
    typedAddressData.data || (typedAddressData as unknown as ProvinceData[])

  const targetProvince = provincesList.find((p) => p[0] === cleanName)

  if (targetProvince && targetProvince[1] && targetProvince[1][0]) {
    const firstDistrictGroup = targetProvince[1][0]
    const districtName = firstDistrictGroup[0]

    const subDistricts = firstDistrictGroup[1]
    if (subDistricts && subDistricts[0]) {
      const zipCode = subDistricts[0][1]

      return {
        postcode: zipCode,
        district: String(districtName),
      }
    }
  }

  return { postcode: 10100, district: 'เขตปทุมวัน' }
}

export function getRepresentativeDestinations(fromProvince: string) {
  const from = fromProvince.trim().replace(/ /g, '')
  const fromRegion = getRegionByProvinceName(from)

  const sameProvinceDetails = getRealProvinceDetails(from)
  const remoteDetails = getRealProvinceDetails('แม่ฮ่องสอน')

  const destinations = [
    {
      zoneType: 'SAME_PROVINCE' as ShippingZoneType,
      province: from,
      ...sameProvinceDetails,
    },
    {
      zoneType: 'REMOTE_AREA' as ShippingZoneType,
      province: 'แม่ฮ่องสอน',
      ...remoteDetails,
    },
  ]

  if (fromRegion === 'BKK') {
    destinations.push({
      zoneType: 'SAME_REGION' as ShippingZoneType,
      province: 'นนทบุรี',
      ...getRealProvinceDetails('นนทบุรี'),
    })
    destinations.push({
      zoneType: 'CROSS_REGION' as ShippingZoneType,
      province: 'เชียงใหม่',
      ...getRealProvinceDetails('เชียงใหม่'),
    })
  } else if (fromRegion === 'NORTH') {
    destinations.push({
      zoneType: 'SAME_REGION' as ShippingZoneType,
      province: 'เชียงราย',
      ...getRealProvinceDetails('เชียงราย'),
    })
    destinations.push({
      zoneType: 'CROSS_REGION' as ShippingZoneType,
      province: 'กรุงเทพมหานคร',
      ...getRealProvinceDetails('กรุงเทพมหานคร'),
    })
  } else {
    const sameRegionTarget = from === 'ชลบุรี' ? 'ระยอง' : 'ชลบุรี'
    destinations.push({
      zoneType: 'SAME_REGION' as ShippingZoneType,
      province: sameRegionTarget,
      ...getRealProvinceDetails(sameRegionTarget),
    })
    destinations.push({
      zoneType: 'CROSS_REGION' as ShippingZoneType,
      province: 'กรุงเทพมหานคร',
      ...getRealProvinceDetails('กรุงเทพมหานคร'),
    })
  }

  return destinations
}
