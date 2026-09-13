'use client'

import { useTranslations } from 'next-intl'

import { useBranchOptions } from '@/actions/hooks/branch'
import { useIsMounted } from '@/hooks/use-is-mounted'
import { ALL_BRANCHES, useBranchFilter } from '@/stores/use-branch-filter'
import { useStoreFilter } from '@/stores/use-store-filter'
import { IconFilter } from '@tabler/icons-react'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { Field, FieldLabel } from './ui/field'

export function BranchSelectField() {
  const t = useTranslations('merchant.shell')
  const isMounted = useIsMounted()
  const { selectedStoreId } = useStoreFilter()
  const { selectedBranchId, setSelectedBranchId } = useBranchFilter()
  const { data: branches = [], isLoading } = useBranchOptions(selectedStoreId)

  if (!isMounted) {
    return null
  }

  const currentBranch = branches.find((b) => b.id === selectedBranchId)
  const currentBranchTitle =
    selectedBranchId === ALL_BRANCHES
      ? t('allBranchesOption', { count: branches.length })
      : (currentBranch?.name ?? t('allBranchesPlaceholder'))

  return (
    <Field className="text-foreground w-full sm:w-fit">
      <FieldLabel>
        <IconFilter size={14} />
        {t('selectBranchLabel')}
      </FieldLabel>
      <Select
        value={selectedBranchId}
        onValueChange={setSelectedBranchId}
        disabled={isLoading || !selectedStoreId}
      >
        <SelectTrigger
          className="w-full *:data-[slot=select-value]:min-w-0 *:data-[slot=select-value]:flex-1 *:data-[slot=select-value]:truncate sm:w-64"
          title={currentBranchTitle}
        >
          <SelectValue placeholder={t('allBranchesPlaceholder')} />
        </SelectTrigger>
        <SelectContent className="w-full max-w-[calc(100vw-2rem)] min-w-48 sm:w-64 sm:max-w-xs">
          <SelectItem
            value={ALL_BRANCHES}
            className="w-full min-w-0 py-2.5 *:[span]:last:min-w-0 *:[span]:last:truncate"
          >
            <span className="block truncate">
              {t('allBranchesOption', { count: branches.length })}
            </span>
          </SelectItem>
          {branches.map((branch) => (
            <SelectItem
              key={branch.id}
              value={branch.id}
              className="w-full min-w-0 py-2.5 *:[span]:last:min-w-0 *:[span]:last:truncate"
              title={branch.name}
            >
              <span className="block truncate">{branch.name}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  )
}
