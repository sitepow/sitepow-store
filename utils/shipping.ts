import { REGION_MAP, REMOTE_PROVINCES } from '@/constants/shipping'
import { ShippingZoneType } from '@/generated/prisma/enums'

import addressData from '@/lib/address/database/db.json'

type SubDistrictData = [string | number, number]
type DistrictData = [string | number, SubDistrictData[]]
type ProvinceData = [string, DistrictData[]]

interface AddressJsonStructure {
  data: ProvinceData[]
}

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
    return ShippingZoneType.REMOTE_AREA
  }
  if (from === to) {
    return ShippingZoneType.SAME_PROVINCE
  }

  const fromRegion = getRegionByProvinceName(from)
  const toRegion = getRegionByProvinceName(to)

  if (fromRegion === toRegion) {
    return ShippingZoneType.SAME_REGION
  }

  return ShippingZoneType.CROSS_REGION
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

  const destinations: Array<{
    zoneType: ShippingZoneType
    province: string
    postcode: number
    district: string
  }> = [
    {
      zoneType: ShippingZoneType.SAME_PROVINCE,
      province: from,
      ...sameProvinceDetails,
    },
    {
      zoneType: ShippingZoneType.REMOTE_AREA,
      province: 'แม่ฮ่องสอน',
      ...remoteDetails,
    },
  ]

  if (fromRegion === 'BKK') {
    const sameRegionTarget = from === 'นนทบุรี' ? 'ปทุมธานี' : 'นนทบุรี'
    destinations.push({
      zoneType: ShippingZoneType.SAME_REGION,
      province: sameRegionTarget,
      ...getRealProvinceDetails(sameRegionTarget),
    })
    destinations.push({
      zoneType: ShippingZoneType.CROSS_REGION,
      province: 'เชียงใหม่',
      ...getRealProvinceDetails('เชียงใหม่'),
    })
  } else if (fromRegion === 'NORTH') {
    const sameRegionTarget = from === 'เชียงราย' ? 'ลำปาง' : 'เชียงราย'
    destinations.push({
      zoneType: ShippingZoneType.SAME_REGION,
      province: sameRegionTarget,
      ...getRealProvinceDetails(sameRegionTarget),
    })
    destinations.push({
      zoneType: ShippingZoneType.CROSS_REGION,
      province: 'กรุงเทพมหานคร',
      ...getRealProvinceDetails('กรุงเทพมหานคร'),
    })
  } else if (fromRegion === 'NE') {
    const sameRegionTarget = from === 'ขอนแก่น' ? 'นครราชสีมา' : 'ขอนแก่น'
    destinations.push({
      zoneType: ShippingZoneType.SAME_REGION,
      province: sameRegionTarget,
      ...getRealProvinceDetails(sameRegionTarget),
    })
    destinations.push({
      zoneType: ShippingZoneType.CROSS_REGION,
      province: 'กรุงเทพมหานคร',
      ...getRealProvinceDetails('กรุงเทพมหานคร'),
    })
  } else if (fromRegion === 'CENTRAL') {
    const sameRegionTarget = from === 'พิษณุโลก' ? 'นครสวรรค์' : 'พิษณุโลก'
    destinations.push({
      zoneType: ShippingZoneType.SAME_REGION,
      province: sameRegionTarget,
      ...getRealProvinceDetails(sameRegionTarget),
    })
    destinations.push({
      zoneType: ShippingZoneType.CROSS_REGION,
      province: 'กรุงเทพมหานคร',
      ...getRealProvinceDetails('กรุงเทพมหานคร'),
    })
  } else if (fromRegion === 'WEST') {
    const sameRegionTarget = from === 'ราชบุรี' ? 'กาญจนบุรี' : 'ราชบุรี'
    destinations.push({
      zoneType: ShippingZoneType.SAME_REGION,
      province: sameRegionTarget,
      ...getRealProvinceDetails(sameRegionTarget),
    })
    destinations.push({
      zoneType: ShippingZoneType.CROSS_REGION,
      province: 'กรุงเทพมหานคร',
      ...getRealProvinceDetails('กรุงเทพมหานคร'),
    })
  } else if (fromRegion === 'SOUTH') {
    const sameRegionTarget =
      from === 'สุราษฎร์ธานี' ? 'นครศรีธรรมราช' : 'สุราษฎร์ธานี'
    destinations.push({
      zoneType: ShippingZoneType.SAME_REGION,
      province: sameRegionTarget,
      ...getRealProvinceDetails(sameRegionTarget),
    })
    destinations.push({
      zoneType: ShippingZoneType.CROSS_REGION,
      province: 'กรุงเทพมหานคร',
      ...getRealProvinceDetails('กรุงเทพมหานคร'),
    })
  } else {
    const sameRegionTarget = from === 'ชลบุรี' ? 'ระยอง' : 'ชลบุรี'
    destinations.push({
      zoneType: ShippingZoneType.SAME_REGION,
      province: sameRegionTarget,
      ...getRealProvinceDetails(sameRegionTarget),
    })
    destinations.push({
      zoneType: ShippingZoneType.CROSS_REGION,
      province: 'กรุงเทพมหานคร',
      ...getRealProvinceDetails('กรุงเทพมหานคร'),
    })
  }

  return destinations
}
