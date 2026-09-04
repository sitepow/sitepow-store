'use client'

import { useTranslations } from 'next-intl'

import { ZONE_LABELS } from '@/constants/shipping'
import { ShippingZoneType } from '@/generated/prisma/enums'
import { getProvincesForZone, getRegionKey } from '@/utils/shipping'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export function ShippingZoneTable({
  originProvince,
}: {
  originProvince: string
}) {
  const t = useTranslations('merchant.settings.shipping')
  const originRegion = getRegionKey(originProvince)

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-50">{t('zoneTable.zoneType')}</TableHead>
            <TableHead>{t('zoneTable.provinces')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Object.entries(ZONE_LABELS).map(([key]) => (
            <TableRow key={key}>
              <TableCell className="align-top font-medium">
                <div className="font-semibold">
                  {t(`zones.${key}.title` as any)}
                </div>
                <div className="mt-1 text-xs opacity-60">
                  {t(`zones.${key}.description` as any)}
                </div>
              </TableCell>
              <TableCell className="max-w-md min-w-md">
                <div className="text-primary text-sm leading-relaxed wrap-break-word whitespace-normal">
                  {getProvincesForZone({
                    zoneType: key as ShippingZoneType,
                    originProvince,
                    originRegion,
                  }).join(', ')}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
