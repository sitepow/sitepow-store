'use client'

import {
  PERMISSION_DESCRIPTIONS,
  PERMISSION_MAPPING,
} from '@/constants/permission'
import { PermissionKey } from '@/types/permission'
import { IconLock } from '@tabler/icons-react'

import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export function PermissionLegendTable() {
  const permissionEntries = Object.entries(PERMISSION_MAPPING) as [
    PermissionKey,
    { domain: string; action: string },
  ][]

  return (
    <Table className="border">
      <TableHeader>
        <TableRow>
          <TableHead className="w-1/3">Permission Key</TableHead>
          <TableHead className="w-1/3">Domain / Action</TableHead>
          <TableHead className="w-1/3">คำอธิบาย</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {permissionEntries.map(([key, value]) => (
          <TableRow key={key}>
            <TableCell className="text-primary flex items-center gap-1">
              <IconLock className="size-4" />
              {key}
            </TableCell>
            <TableCell>
              <Badge variant="outline">
                {value.domain}_{value.action}
              </Badge>
            </TableCell>
            <TableCell className="text-primary max-w-72 min-w-72 wrap-break-word whitespace-pre-line">
              {PERMISSION_DESCRIPTIONS[key] || '-'}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
