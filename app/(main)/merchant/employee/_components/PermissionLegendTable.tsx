'use client'

import { useCurrentStore } from '@/hooks/use-current-store'

import { useMemo } from 'react'

import { useTranslations } from 'next-intl'

import {
  PERMISSION_DESCRIPTIONS,
  PERMISSION_MAPPING,
} from '@/constants/permission'
import { PermissionKey } from '@/types/permission'
import { IconKey } from '@tabler/icons-react'

import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function PermissionLegendTable() {
  const { currentStore, store } = useCurrentStore()
  const t = useTranslations('merchant.employee.permissionLegend')
  const permissionEntries = Object.entries(PERMISSION_MAPPING) as [
    PermissionKey,
    { domain: string; action: string },
  ][]

  const groupedByDomain = useMemo(() => {
    const groups: Record<string, typeof permissionEntries> = {}

    permissionEntries.forEach((entry) => {
      const [, value] = entry
      const domain = value.domain
      if (!groups[domain]) {
        groups[domain] = []
      }
      groups[domain].push(entry)
    })

    return groups
  }, [permissionEntries])

  const domains = Object.keys(groupedByDomain)
  const defaultDomain = domains[0] || ''

  if (domains.length === 0) {
    return null
  }

  return (
    <Tabs
      style={{
        '--primary': currentStore?.primaryColor ?? store?.primaryColor,
      } as React.CSSProperties} defaultValue={defaultDomain} className="w-full">
      <TabsList className="mb-4 flex w-full justify-start overflow-x-auto whitespace-nowrap">
        {domains.map((domain) => (
          <TabsTrigger key={domain} value={domain}>
            {domain}
          </TabsTrigger>
        ))}
      </TabsList>
      {domains.map((domain) => (
        <TabsContent key={domain} value={domain}>
          <Table className="border">
            <TableHeader>
              <TableRow>
                <TableHead>{t('domainAction')}</TableHead>
                <TableHead>{t('description')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {groupedByDomain[domain].map(([key, value]) => (
                <TableRow key={key}>
                  <TableCell>
                    <Badge variant="outline">
                      <IconKey className="size-4" />
                      {value.domain}_{value.action}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-primary max-w-72 min-w-72 wrap-break-word whitespace-pre-line">
                    - {PERMISSION_DESCRIPTIONS[key] || '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>
      ))}
    </Tabs>
  )
}
