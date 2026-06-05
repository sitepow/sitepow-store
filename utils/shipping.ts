import { REGION_MAP, REMOTE_AREAS } from '@/constants/shipping'
import { ShippingZoneType } from '@/generated/prisma/enums'

import { ThaiAddressFinder } from '@/lib/address/logic'

const addressFinder = new ThaiAddressFinder({ maxSearchResult: 200 })

export interface AggregatedRate {
  zoneType: ShippingZoneType
  minWeight: number
  maxWeight: number
  fee: number
}

export function getAllProvinces(): string[] {
  return addressFinder.GetAllProvinces()
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

export const getRegionKey = (province: string) => {
  return (
    Object.entries(REGION_MAP).find(([_, provinces]) =>
      provinces.includes(province),
    )?.[0] || 'BKK'
  )
}

export const getProvincesForZone = ({
  zoneType,
  originProvince,
  originRegion,
}: {
  zoneType: ShippingZoneType
  originProvince: string
  originRegion: string
}) => {
  switch (zoneType) {
    case ShippingZoneType.SAME_PROVINCE:
      return [originProvince]

    case ShippingZoneType.SAME_REGION:
      return REGION_MAP[originRegion].filter((p) => p !== originProvince)

    case ShippingZoneType.CROSS_REGION:
      const sameRegionProvinces = REGION_MAP[originRegion]
      return getAllProvinces().filter((p) => !sameRegionProvinces.includes(p))

    case ShippingZoneType.REMOTE_AREA:
      return Array.from(new Set(REMOTE_AREAS.map((a) => a.province)))

    default:
      return []
  }
}
