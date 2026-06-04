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
