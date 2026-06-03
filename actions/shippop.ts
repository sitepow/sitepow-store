'use server'

import { COURIERS_LIST, COURIER_MAPPING } from '@/constants/shipping'
import {
  Courier,
  CourierService,
  ShippingZoneType,
} from '@/generated/prisma/client'
import axios from 'axios'

export interface GetPriceWeightRate {
  zoneType: ShippingZoneType
  minWeight: number
  maxWeight: number
  fee: number
}

export interface GetPriceZoneRate {
  zoneType: ShippingZoneType
  additionalFee: number
}

export interface GetPriceServiceResult extends Omit<
  CourierService,
  'createdAt' | 'updatedAt'
> {
  weightRates: GetPriceWeightRate[]
  zoneRates: GetPriceZoneRate[]
  currentFee: number | null
}

export interface GetPriceCourierResult extends Omit<
  Courier,
  'createdAt' | 'updatedAt'
> {
  services: GetPriceServiceResult[]
}

export interface GetPriceInput {
  zoneType: ShippingZoneType
  minWeight: number
  weight: number
  fromPostcode: string | number
  toPostcode: string | number
  fromProvince: string
  fromDistrict: string
  fromState: string
  toProvince: string
  toDistrict: string
  toState: string
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
  payload: GetPriceInput,
): Promise<GetPriceCourierResult[]> {
  try {
    const requestBody = {
      data: [
        {
          from: {
            name: '-',
            address: '-',
            district: payload.fromDistrict,
            state: payload.fromState,
            province: payload.fromProvince,
            postcode: String(payload.fromPostcode),
            tel: '-',
          },
          to: {
            name: '-',
            address: '-',
            district: payload.toDistrict,
            state: payload.toState,
            province: payload.toProvince,
            postcode: String(payload.toPostcode),
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

        shippopPriceMap.set(
          COURIER_MAPPING[rawCourierCode] || rawCourierCode,
          service,
        )
      })
    }

    const formattedResult: GetPriceCourierResult[] = COURIERS_LIST.map(
      (courier) => {
        const updatedServices: GetPriceServiceResult[] = courier.services.map(
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
                    zoneType: payload.zoneType,
                    minWeight: payload.minWeight,
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
    throw new Error('ไม่สามารถดึงข้อมูลราคาค่าจัดส่งจากระบบ Shippop ได้')
  }
}
