'use client'

import { useTranslations } from 'next-intl'

import { IconLoader2 } from '@tabler/icons-react'

import { TableCell, TableRow } from './ui/table'

interface TableLoadingRowProps {
  title?: string
  description?: string
  colSpan: number
}

export function TableLoadingRow({
  title,
  description,
  colSpan,
}: TableLoadingRowProps) {
  const t = useTranslations('common.loadingRow')

  const displayTitle = title ?? t('title')
  const displayDescription = description ?? t('description')

  return (
    <TableRow>
      <TableCell
        colSpan={colSpan}
        className="text-muted-foreground py-14 text-center text-xs"
      >
        <div className="flex flex-col items-center justify-center gap-2">
          <IconLoader2 className="text-primary animate-spin" size={28} />
          <span className="text-foreground mt-1 font-semibold">
            {displayTitle}
          </span>
          {displayDescription && (
            <span className="text-muted-foreground text-[11px]">
              {displayDescription}
            </span>
          )}
        </div>
      </TableCell>
    </TableRow>
  )
}
