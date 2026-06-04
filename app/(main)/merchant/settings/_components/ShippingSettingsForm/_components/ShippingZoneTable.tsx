'use client'

import {
  PROVINCES_POOL,
  REGION_MAP,
  REMOTE_AREAS,
  ZONE_LABELS,
} from '@/constants/shipping'
import { ShippingZoneType } from '@/generated/prisma/enums'

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
  const getRegionKey = (province: string) => {
    return (
      Object.entries(REGION_MAP).find(([_, provinces]) =>
        provinces.includes(province),
      )?.[0] || 'BKK'
    )
  }

  const originRegion = getRegionKey(originProvince)

  const getProvincesForZone = (key: string) => {
    switch (key) {
      case ShippingZoneType.SAME_PROVINCE:
        return [originProvince]

      case ShippingZoneType.SAME_REGION:
        return REGION_MAP[originRegion].filter((p) => p !== originProvince)

      case ShippingZoneType.CROSS_REGION:
        const sameRegionProvinces = REGION_MAP[originRegion]
        return PROVINCES_POOL.filter((p) => !sameRegionProvinces.includes(p))

      case ShippingZoneType.REMOTE_AREA:
        return Array.from(new Set(REMOTE_AREAS.map((a) => a.province)))

      default:
        return []
    }
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-50">ประเภทโซน</TableHead>
            <TableHead>จังหวัดในกลุ่ม</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Object.entries(ZONE_LABELS).map(([key, label]) => (
            <TableRow key={key}>
              <TableCell className="align-top font-medium">
                <div className="font-semibold">{label.title}</div>
                <div className="text-muted-foreground mt-1 text-xs">
                  {label.description}
                </div>
              </TableCell>
              <TableCell className="max-w-md min-w-md">
                <div className="text-sm leading-relaxed wrap-break-word whitespace-normal text-neutral-700">
                  {getProvincesForZone(key).join(', ')}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
