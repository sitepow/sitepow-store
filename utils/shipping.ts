'use client'

import { REGION_MAP, REMOTE_AREAS } from '@/constants/shipping'
import { ShippingZoneType } from '@/generated/prisma/enums'

import { ThaiAddressFinder } from '@/lib/address/logic'

const addressFinder = new ThaiAddressFinder({ maxSearchResult: 200 })

export interface ProvinceAmphoePair {
  province: string
  amphoe: string
}

export interface RepresentativeDestination {
  zoneType: ShippingZoneType
  province: string
  postcode: string
  district: string
  state: string
}

type RateGroupKey = `${ShippingZoneType}-${number}-${number}`

export interface AggregatedRate {
  zoneType: ShippingZoneType
  minWeight: number
  maxWeight: number
  fee: number
}

export function getAllProvinceAmphoePairs() {
  return addressFinder.GetAllProvinceAmphoePairs()
}

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

export function getRepresentativeDestinations(
  fromProvince: string,
): RepresentativeDestination[] {
  const from = fromProvince.trim().replace(/ /g, '')
  const fromRegion = getRegionByProvinceName(from)
  const destinations: RepresentativeDestination[] = []

  destinations.push({
    zoneType: ShippingZoneType.SAME_PROVINCE,
    province: from,
    ...getProvinceDetails(from),
  })

  const siblings = (REGION_MAP[fromRegion] || []).filter((p) => p !== from)
  siblings.slice(0, 2).forEach((p) => {
    destinations.push({
      zoneType: ShippingZoneType.SAME_REGION,
      province: p,
      ...getProvinceDetails(p),
    })
  })

  if (siblings.length === 0) {
    destinations.push({
      zoneType: ShippingZoneType.SAME_REGION,
      province: from,
      ...getProvinceDetails(from),
    })
  }

  const crossCandidates: string[] =
    fromRegion === 'BKK' || fromRegion === 'CENTRAL'
      ? ['อุบลราชธานี', 'เชียงราย']
      : fromRegion === 'NORTH' || fromRegion === 'NE'
        ? ['สมุทรปราการ', 'สงขลา']
        : ['กรุงเทพมหานคร', 'อุดรธานี']

  crossCandidates
    .filter((p) => p !== from)
    .forEach((p) => {
      destinations.push({
        zoneType: ShippingZoneType.CROSS_REGION,
        province: p,
        ...getProvinceDetails(p),
      })
    })

  const remoteTargets = REMOTE_AREAS.filter((area) => area.province !== from)
  const remoteList =
    remoteTargets.length > 0 ? remoteTargets : REMOTE_AREAS.slice(0, 1)

  remoteList.forEach((area) => {
    destinations.push({
      zoneType: ShippingZoneType.REMOTE_AREA,
      province: area.province,
      postcode: area.postcode,
      state: area.state,
      district: area.district,
    })
  })

  return destinations
}

export function aggregateRatesByMaxFee(
  rawRates: AggregatedRate[],
): AggregatedRate[] {
  const maxMap = new Map<RateGroupKey, AggregatedRate>()

  for (const rate of rawRates) {
    const key: RateGroupKey = `${rate.zoneType}-${rate.minWeight}-${rate.maxWeight}`
    const existing = maxMap.get(key)
    if (!existing || rate.fee > existing.fee) {
      maxMap.set(key, rate)
    }
  }

  const zoneOrder: ShippingZoneType[] = [
    ShippingZoneType.SAME_PROVINCE,
    ShippingZoneType.SAME_REGION,
    ShippingZoneType.CROSS_REGION,
    ShippingZoneType.REMOTE_AREA,
  ]

  return Array.from(maxMap.values()).sort((a, b) => {
    const zoneDiff =
      zoneOrder.indexOf(a.zoneType) - zoneOrder.indexOf(b.zoneType)
    return zoneDiff !== 0 ? zoneDiff : a.minWeight - b.minWeight
  })
}
