'use server'

import { COURIERS_LIST } from '@/constants/shipping'
import {
  Courier,
  CourierService,
  ShippingZoneType,
} from '@/generated/prisma/client'
import axios from 'axios'

export interface CheckPriceWeightRate {
  zoneType: ShippingZoneType
  minWeight: number
  maxWeight: number
  fee: number
}

export interface CheckPriceZoneRate {
  zoneType: ShippingZoneType
  additionalFee: number
}

export interface CheckPriceServiceResult extends Omit<
  CourierService,
  'createdAt' | 'updatedAt'
> {
  weightRates: CheckPriceWeightRate[]
  zoneRates: CheckPriceZoneRate[]
  currentFee: number | null
}

export interface CheckPriceCourierResult extends Omit<
  Courier,
  'createdAt' | 'updatedAt'
> {
  services: CheckPriceServiceResult[]
}

export interface CheckPriceInput {
  weight: number
  fromPostcode: number
  toPostcode: number
  fromProvince?: string
  fromDistrict?: string
  toProvince?: string
  toDistrict?: string
  width?: number
  length?: number
  height?: number
}

interface ShippopServiceResponse {
  courierCode?: string
  price?: string | number
  error?: string | boolean
  durationString?: string
  timeMin?: number | string
  timeMax?: number | string
}

export async function getShippingPrice(
  payload: CheckPriceInput,
): Promise<CheckPriceCourierResult[]> {
  try {
    const requestBody = {
      data: [
        {
          from: {
            name: '-',
            address: '-',
            district: payload.fromDistrict,
            state: payload.fromDistrict,
            province: payload.fromProvince,
            postcode: payload.fromPostcode,
            tel: '-',
          },
          to: {
            name: '-',
            address: '-',
            district: payload.toDistrict,
            state: payload.toDistrict,
            province: payload.toProvince,
            postcode: payload.toPostcode,
            tel: '-',
          },
          parcel: {
            name: '-',
            weight: payload.weight,
            width: payload.width,
            length: payload.length,
            height: payload.height,
          },
          showall: 1,
        },
      ],
      lang: 'th',
    }

    const response = await axios.post(
      'https://www.shippop.com/api/checkprice/fetch',
      requestBody,
    )

    const shippopServices = (response.data || []) as ShippopServiceResponse[]
    const shippopPriceMap = new Map<string, ShippopServiceResponse>()

    if (Array.isArray(shippopServices)) {
      shippopServices.forEach((service) => {
        const rawCourierCode = service.courierCode?.toUpperCase() || ''
        let uniqueKey = rawCourierCode

        if (rawCourierCode === 'EMST') uniqueKey = 'THAIPOST_EMS'
        else if (rawCourierCode === 'FLE') uniqueKey = 'FLASH_STANDARD'
        else if (rawCourierCode === 'KRYD') uniqueKey = 'KERRY_STANDARD'
        else if (rawCourierCode === 'SPX') uniqueKey = 'SPX_STANDARD'
        else if (rawCourierCode === 'BEST') uniqueKey = 'BEST_STANDARD'
        else if (rawCourierCode === 'DHL') uniqueKey = 'DHL_STANDARD'

        shippopPriceMap.set(uniqueKey, service)
      })
    }

    const formattedResult: CheckPriceCourierResult[] = COURIERS_LIST.map(
      (courier) => {
        const updatedServices: CheckPriceServiceResult[] = courier.services.map(
          (service) => {
            const shippopData = shippopPriceMap.get(service.code.toUpperCase())

            if (
              shippopData &&
              shippopData.price !== '-' &&
              !shippopData.error
            ) {
              const price = Number(shippopData.price || 0)
              return {
                ...service,
                estimatedDays:
                  shippopData.durationString ||
                  (shippopData.timeMin && shippopData.timeMax
                    ? `${shippopData.timeMin}-${shippopData.timeMax} วัน`
                    : service.estimatedDays),
                currentFee: price,
                weightRates: [
                  {
                    zoneType: 'SAME_PROVINCE' as ShippingZoneType,
                    minWeight: 0,
                    maxWeight: payload.weight,
                    fee: price,
                  },
                ],
                zoneRates: [],
              }
            }

            return {
              ...service,
              currentFee: null,
              weightRates: [],
              zoneRates: [],
            }
          },
        )

        return { ...courier, services: updatedServices }
      },
    )

    return formattedResult.filter((courier) =>
      courier.services.some((s) => s.currentFee !== null),
    )
  } catch {
    throw new Error('ไม่สามารถดึงข้อมูลราคาจากระบบหลังบ้าน Shippop ได้')
  }
}
