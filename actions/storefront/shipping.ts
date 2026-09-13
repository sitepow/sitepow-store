'use server'

import { DEFAULT_INTERNATIONAL_ZONES } from '@/constants/shipping'
import { Prisma } from '@/generated/prisma/client'
import { CountryCode, ShippingZoneType } from '@/generated/prisma/enums'
import { serializeDecimal } from '@/utils/decimal'

import { prisma } from '@/lib/prisma'

const storefrontCourierSelect = {
  id: true,
  isEnabled: true,
  courierService: {
    select: {
      id: true,
      name: true,
      estimatedDays: true,
      courier: {
        select: { name: true },
      },
    },
  },
  weightRates: {
    select: {
      zoneType: true,
      minWeight: true,
      maxWeight: true,
      fee: true,
    },
  },
} satisfies Prisma.StoreCourierServiceSelect

export type StorefrontCourierOption = Prisma.StoreCourierServiceGetPayload<{
  select: typeof storefrontCourierSelect
}>

export async function getStorefrontShippingOptions(
  storeSlug: string,
  country: CountryCode = CountryCode.TH,
) {
  try {
    const store = await prisma.store.findUnique({
      where: { slug: storeSlug },
      select: { id: true },
    })

    if (!store) {
      return []
    }

    if (country === CountryCode.TH) {
      return serializeDecimal(
        await prisma.storeCourierService.findMany({
          where: { storeId: store.id, isEnabled: true },
          select: storefrontCourierSelect,
          orderBy: { createdAt: 'asc' },
        }),
      )
    }

    // International shipping options:
    const customZone = await prisma.shippingZone.findFirst({
      where: {
        storeId: store.id,
        countries: { has: country },
      },
      include: {
        rates: true,
      },
    })

    if (customZone && customZone.rates.length > 0) {
      return serializeDecimal(
        customZone.rates.map((rate) => ({
          id: rate.id,
          isEnabled: true,
          courierService: {
            id: rate.id,
            name: rate.name,
            estimatedDays: rate.estimatedDays || '7-14 days',
            courier: {
              name: 'International Shipping',
            },
          },
          weightRates: [
            {
              zoneType: ShippingZoneType.INTERNATIONAL,
              minWeight: rate.minWeight,
              maxWeight: rate.maxWeight,
              fee: rate.fee,
            },
          ],
        })),
      )
    }

    // Default global shipping presets
    const defaultPreset =
      DEFAULT_INTERNATIONAL_ZONES.find((z) => z.countries.includes(country)) ??
      DEFAULT_INTERNATIONAL_ZONES[DEFAULT_INTERNATIONAL_ZONES.length - 1]

    return serializeDecimal(
      defaultPreset.services.map((srv) => ({
        id: srv.id,
        isEnabled: true,
        courierService: {
          id: srv.id,
          name: srv.name,
          estimatedDays: srv.estimatedDays,
          courier: {
            name: 'International Courier',
          },
        },
        weightRates: srv.weightRates.map((wr) => ({
          zoneType: ShippingZoneType.INTERNATIONAL,
          minWeight: new Prisma.Decimal(wr.minWeight),
          maxWeight: new Prisma.Decimal(wr.maxWeight),
          fee: new Prisma.Decimal(wr.fee),
        })),
      })),
    )
  } catch {
    return []
  }
}
