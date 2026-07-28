import { StoreShippingPayload } from '@/actions/shipping'
import { REGION_MAP, REMOTE_AREAS } from '@/constants/shipping'
import { Prisma } from '@/generated/prisma/client'
import { ShippingZoneType } from '@/generated/prisma/enums'
import { ShippingFormValues } from '@/zod/shipping'

import { ThaiAddressFinder } from '@/lib/address/logic'

import { DecimalToNumber } from './decimal'

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

export const mapStoreToShippingForm = (
  store: DecimalToNumber<StoreShippingPayload>,
): Partial<ShippingFormValues> | null => {
  return {
    storeProvince: store.branch?.province || '',
    storeDistrict: store.branch?.district || '',
    storePostcode: store.branch?.postcode ? Number(store.branch.postcode) : 0,

    isFreeShipEnabled: store.shippingSetting?.isFreeShipEnabled ?? false,
    freeShipMin: store.shippingSetting?.freeShipMin
      ? Number(store.shippingSetting.freeShipMin)
      : 1,

    services: store.storeCourierServices.map((scs) => ({
      ...scs,
      zoneRates: [],
    })),
  }
}

export async function syncStoreServiceWeightRates(
  tx: Prisma.TransactionClient,
  storeCourierServiceId: string,
  rates: {
    zoneType: ShippingZoneType
    minWeight: number
    maxWeight: number
    fee: number
  }[],
) {
  await tx.storeServiceWeightRate.deleteMany({
    where: { storeCourierServiceId },
  })

  if (rates.length > 0) {
    await tx.storeServiceWeightRate.createMany({
      data: rates.map((rate) => ({
        storeCourierServiceId,
        zoneType: rate.zoneType,
        minWeight: rate.minWeight,
        maxWeight: rate.maxWeight,
        fee: rate.fee,
      })),
    })
  }
}
