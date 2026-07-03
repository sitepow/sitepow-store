'use client'

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
  const originRegion = getRegionKey(originProvince)

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
                <div className="mt-1 text-xs opacity-60">
                  {label.description}
                </div>
              </TableCell>
              <TableCell className="max-w-md min-w-md">
                <div className="text-sm leading-relaxed wrap-break-word whitespace-normal opacity-60">
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
