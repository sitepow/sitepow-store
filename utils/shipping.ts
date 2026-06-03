import { REGION_MAP } from '@/constants/shipping'
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

export function getRealProvinceDetails(provinceName: string): {
  postcode: string
  district: string
  state: string
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
      const subDistrictName = subDistricts[0][0]
      const zipCode = subDistricts[0][1]

      return {
        postcode: String(zipCode),
        district: String(
          subDistrictName === 0 ? districtName : subDistrictName,
        ),
        state: String(districtName),
      }
    }
  }

  return { postcode: '10300', district: 'ดุสิต', state: 'ดุสิต' }
}

export function getRepresentativeDestinations(fromProvince: string) {
  const from = fromProvince.trim().replace(/ /g, '')
  const fromRegion = getRegionByProvinceName(from)

  const destinations: Array<{
    zoneType: ShippingZoneType
    province: string
    postcode: string
    district: string
    state: string
  }> = []

  destinations.push({
    zoneType: ShippingZoneType.SAME_PROVINCE,
    province: from,
    ...getRealProvinceDetails(from),
  })

  const remoteTarget = from === 'แม่ฮ่องสอน' ? 'ยะลา' : 'แม่ฮ่องสอน'
  destinations.push({
    zoneType: ShippingZoneType.REMOTE_AREA,
    province: remoteTarget,
    ...getRealProvinceDetails(remoteTarget),
  })

  const siblingProvinces = REGION_MAP[fromRegion] || []
  const sameRegionProvince = siblingProvinces.find((p) => p !== from)
  if (sameRegionProvince) {
    destinations.push({
      zoneType: ShippingZoneType.SAME_REGION,
      province: sameRegionProvince,
      ...getRealProvinceDetails(sameRegionProvince),
    })
  } else {
    destinations.push({
      zoneType: ShippingZoneType.SAME_REGION,
      province: from,
      ...getRealProvinceDetails(from),
    })
  }

  let crossRegionProvince = 'กรุงเทพมหานคร'
  if (fromRegion === 'BKK' || fromRegion === 'CENTRAL') {
    crossRegionProvince = 'อุบลราชธานี'
  } else {
    crossRegionProvince = 'สมุทรปราการ'
  }

  destinations.push({
    zoneType: ShippingZoneType.CROSS_REGION,
    province: crossRegionProvince,
    ...getRealProvinceDetails(crossRegionProvince),
  })

  return destinations
}
