'use client'

import { REGION_MAP, REMOTE_AREAS } from '@/constants/shipping'
import { ShippingZoneType } from '@/generated/prisma/enums'

import { ThaiAddressFinder } from '@/lib/address/logic'

const addressFinder = new ThaiAddressFinder({ maxSearchResult: 200 })

function getRegionByProvinceName(provinceName: string): string {
  const cleanName = provinceName.trim().replace(/ /g, '')
  for (const [region, provinces] of Object.entries(REGION_MAP)) {
    if (provinces.includes(cleanName)) return region
  }
  return 'OTHER'
}

export function getProvinceDetails(
  provinceName: string,
  amphoeName?: string,
): { postcode: string; district: string; state: string } {
  const cleanProvince = provinceName.trim()

  const results = addressFinder.SearchAddressByProvince(cleanProvince)

  const targetAmphoe = amphoeName
    ? amphoeName.trim()
    : cleanProvince === 'กรุงเทพมหานคร'
      ? 'พระนคร'
      : `เมือง${cleanProvince}`

  const match =
    results.find(
      (item) =>
        item.amphoe.includes(targetAmphoe) ||
        targetAmphoe.includes(item.amphoe),
    ) || results[0]

  return {
    postcode: String(match.zipcode),
    district: String(match.district),
    state: String(match.amphoe),
  }
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
    ...getProvinceDetails(from),
  })

  const validRemoteArea =
    REMOTE_AREAS.find((area) => area.province !== from) || REMOTE_AREAS[0]

  destinations.push({
    zoneType: ShippingZoneType.REMOTE_AREA,
    province: validRemoteArea.province,
    postcode: validRemoteArea.postcode,
    state: validRemoteArea.state,
    district: validRemoteArea.district,
  })

  const siblingProvinces = REGION_MAP[fromRegion] || []
  const sameRegionProvince = siblingProvinces.find((p) => p !== from)
  if (sameRegionProvince) {
    destinations.push({
      zoneType: ShippingZoneType.SAME_REGION,
      province: sameRegionProvince,
      ...getProvinceDetails(sameRegionProvince),
    })
  } else {
    destinations.push({
      zoneType: ShippingZoneType.SAME_REGION,
      province: from,
      ...getProvinceDetails(from),
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
    ...getProvinceDetails(crossRegionProvince),
  })

  return destinations
}
