'use client'

import { useTranslations } from 'next-intl'

import { StatsCard } from '@/components/StatsCard'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import {
  IconAlertTriangle,
  IconCheck,
  IconFileSpreadsheet,
} from '@tabler/icons-react'

import { FilterMode } from '../_hooks/use-bulk-import'
import { BulkProductRow } from '../_lib/bulk-import-csv'

interface BulkImportPreviewStepProps {
  branchOptions: { id: string; name: string; isMain?: boolean }[]
  activeBranchId: string
  onBranchChange: (branchId: string) => void
  parsedRows: BulkProductRow[]
  validCount: number
  errorCount: number
  filterMode: FilterMode
  onFilterModeChange: (mode: FilterMode) => void
  filteredDisplayRows: BulkProductRow[]
}

export function BulkImportPreviewStep({
  branchOptions,
  activeBranchId,
  onBranchChange,
  parsedRows,
  validCount,
  errorCount,
  filterMode,
  onFilterModeChange,
  filteredDisplayRows,
}: BulkImportPreviewStepProps) {
  const t = useTranslations('merchant.products.bulkImport')

  return (
    <div className="space-y-4">
      {branchOptions.length > 0 && (
        <div className="bg-muted/20 flex flex-col gap-2 rounded-xl border p-2.5 sm:flex-row sm:items-center sm:justify-between sm:px-3.5 sm:py-2.5">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-foreground font-semibold">
              {t('targetBranch')}:
            </span>
            <span className="text-muted-foreground text-[11px]">
              ({t('selectBranchFirst')})
            </span>
          </div>
          <div className="w-full sm:w-60">
            <Select
              value={activeBranchId}
              onValueChange={onBranchChange}
            >
              <SelectTrigger className="bg-background h-8 text-xs">
                <SelectValue placeholder={t('targetBranchPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                {branchOptions.map((b) => (
                  <SelectItem key={b.id} value={b.id} className="text-xs">
                    {b.name} {b.isMain ? `(${t('mainBranch')})` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <StatsCard
          title={t('statsTotal')}
          value={parsedRows.length}
          icon={IconFileSpreadsheet}
          valueClassName="text-lg sm:text-2xl font-bold"
          onClick={() => onFilterModeChange('all')}
          className={cn(
            'p-2.5 transition-all duration-200 sm:p-4',
            filterMode === 'all'
              ? 'border-primary ring-primary/25 bg-primary/5 shadow-sm ring-2'
              : 'hover:border-primary/40 opacity-85 hover:opacity-100',
          )}
        />
        <StatsCard
          title={t('statsValid')}
          value={validCount}
          icon={IconCheck}
          valueClassName="text-lg sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400"
          onClick={() => onFilterModeChange('valid')}
          className={cn(
            'p-2.5 transition-all duration-200 sm:p-4',
            filterMode === 'valid'
              ? 'border-emerald-500 bg-emerald-500/10 shadow-sm ring-2 ring-emerald-500/25'
              : 'opacity-85 hover:border-emerald-500/40 hover:opacity-100',
          )}
        />
        <StatsCard
          title={t('statsErrors')}
          value={errorCount}
          icon={IconAlertTriangle}
          valueClassName={cn(
            'text-lg sm:text-2xl font-bold',
            errorCount > 0 ? 'text-destructive' : 'text-muted-foreground',
          )}
          onClick={() => onFilterModeChange('errors')}
          className={cn(
            'p-2.5 transition-all duration-200 sm:p-4',
            filterMode === 'errors'
              ? 'border-destructive ring-destructive/25 bg-destructive/10 shadow-sm ring-2'
              : 'hover:border-destructive/40 opacity-85 hover:opacity-100',
          )}
        />
      </div>

      <div className="bg-card overflow-hidden rounded-xl border">
        <div className="max-h-72 overflow-x-auto overflow-y-auto">
          <table className="w-full min-w-[640px] border-collapse text-left text-xs">
            <thead className="bg-muted/60 sticky top-0 border-b backdrop-blur-sm">
              <tr>
                <th className="text-muted-foreground p-2 font-semibold whitespace-nowrap sm:p-2.5">
                  {t('colRow')}
                </th>
                <th className="text-muted-foreground p-2 font-semibold whitespace-nowrap sm:p-2.5">
                  {t('colTitle')}
                </th>
                <th className="text-muted-foreground p-2 font-semibold whitespace-nowrap sm:p-2.5">
                  {t('colSku')}
                </th>
                <th className="text-muted-foreground p-2 text-right font-semibold whitespace-nowrap sm:p-2.5">
                  {t('colPrice')}
                </th>
                <th className="text-muted-foreground p-2 text-right font-semibold whitespace-nowrap sm:p-2.5">
                  {t('colCost')}
                </th>
                <th className="text-muted-foreground p-2 font-semibold whitespace-nowrap sm:p-2.5">
                  {t('colCategory')}
                </th>
                <th className="text-muted-foreground p-2 text-center font-semibold whitespace-nowrap sm:p-2.5">
                  {t('colStock')}
                </th>
                <th className="text-muted-foreground p-2 text-center font-semibold whitespace-nowrap sm:p-2.5">
                  {t('colStatus')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredDisplayRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="text-muted-foreground p-8 text-center"
                  >
                    {t('emptyFilteredRows')}
                  </td>
                </tr>
              ) : (
                filteredDisplayRows.map((row) => (
                  <tr
                    key={row.index}
                    className={`transition-colors ${
                      row.error
                        ? 'bg-destructive/5 hover:bg-destructive/10'
                        : 'hover:bg-muted/30'
                    }`}
                  >
                    <td className="text-muted-foreground p-2 whitespace-nowrap sm:p-2.5">
                      #{row.index}
                    </td>
                    <td className="max-w-45 truncate p-2 font-medium sm:p-2.5">
                      {row.title || '—'}
                    </td>
                    <td className="text-muted-foreground p-2 whitespace-nowrap sm:p-2.5">
                      {row.sku || '—'}
                    </td>
                    <td className="p-2 text-right font-medium whitespace-nowrap sm:p-2.5">
                      ฿{row.price.toLocaleString()}
                    </td>
                    <td className="text-muted-foreground p-2 text-right whitespace-nowrap sm:p-2.5">
                      ฿{row.costPrice?.toLocaleString() || '0'}
                    </td>
                    <td className="p-2 whitespace-nowrap sm:p-2.5">
                      {row.categorySlug ? (
                        <Badge variant="outline" className="text-[10px]">
                          {row.categorySlug}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="p-2 text-center font-semibold whitespace-nowrap sm:p-2.5">
                      {row.initialStock ?? 0}
                    </td>
                    <td className="p-2 text-center whitespace-nowrap sm:p-2.5">
                      {row.error ? (
                        <span
                          className="bg-destructive/10 text-destructive inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium"
                          title={row.error}
                        >
                          <IconAlertTriangle className="h-3 w-3" />
                          {row.error}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-600">
                          <IconCheck className="h-3 w-3" /> {t('statusValid')}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

