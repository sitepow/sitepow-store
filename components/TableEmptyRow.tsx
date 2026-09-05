'use client'

import { useTranslations } from 'next-intl'

import { IconAlertCircle } from '@tabler/icons-react'

import { TableCell, TableRow } from './ui/table'

interface TableEmptyRowProps {
  title?: string
  description?: string
  colSpan: number
}

export function TableEmptyRow({
  title,
  description,
  colSpan,
}: TableEmptyRowProps) {
  const t = useTranslations('common.empty')

  const displayTitle = title ?? t('title')
  const displayDescription = description ?? t('description')

  return (
    <TableRow>
      <TableCell
        colSpan={colSpan}
        className="text-muted-foreground py-14 text-center text-xs"
      >
        <div className="flex flex-col items-center justify-center gap-2">
          <IconAlertCircle size={26} className="text-muted-foreground/40" />
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
