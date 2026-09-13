'use client'

import { useEffect } from 'react'

import { useTranslations } from 'next-intl'

import { useBranchOptions } from '@/actions/hooks/branch'
import { useIsMounted } from '@/hooks/use-is-mounted'
import { ALL_BRANCHES, useBranchFilter } from '@/stores/use-branch-filter'
import { ALL_STORES, useStoreFilter } from '@/stores/use-store-filter'
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

  // Fallback to ALL_BRANCHES if selected branch is invalid or no longer exists in branches list
  useEffect(() => {
    if (isLoading) return

    if (!selectedStoreId || selectedStoreId === ALL_STORES) {
      if (selectedBranchId !== ALL_BRANCHES) {
        setSelectedBranchId(ALL_BRANCHES)
      }
      return
    }

    const isValidBranch =
      selectedBranchId === ALL_BRANCHES ||
      branches.some((b) => b.id === selectedBranchId)

    if (!isValidBranch) {
      setSelectedBranchId(ALL_BRANCHES)
    }
  }, [
    isLoading,
    selectedStoreId,
    branches,
    selectedBranchId,
    setSelectedBranchId,
  ])

  if (!isMounted) {
    return null
  }

  const currentBranch = branches.find((b) => b.id === selectedBranchId)
  const currentBranchTitle =
    selectedBranchId === ALL_BRANCHES
      ? t('allBranchesOption', { count: branches.length })
      : (currentBranch?.name ?? t('allBranchesPlaceholder'))

  return (
    <Field className="text-foreground w-full max-w-full min-w-0 sm:w-64 sm:max-w-64">
      <FieldLabel className="max-w-full min-w-0">
        <IconFilter size={14} className="shrink-0" />
        <span className="truncate">{t('selectBranchLabel')}</span>
      </FieldLabel>
      <Select
        value={selectedBranchId}
        onValueChange={setSelectedBranchId}
        disabled={
          isLoading || !selectedStoreId || selectedStoreId === ALL_STORES
        }
      >
        <SelectTrigger
          className="w-full max-w-full min-w-0 overflow-hidden *:data-[slot=select-value]:min-w-0 *:data-[slot=select-value]:flex-1 *:data-[slot=select-value]:truncate *:data-[slot=select-value]:overflow-hidden sm:w-64 sm:max-w-64 [&_[data-slot=select-value]_span]:block [&_[data-slot=select-value]_span]:min-w-0 [&_[data-slot=select-value]_span]:truncate"
          title={currentBranchTitle}
        >
          <SelectValue placeholder={t('allBranchesPlaceholder')} />
        </SelectTrigger>
        <SelectContent className="w-[calc(100vw-2rem)] max-w-xs min-w-48 sm:w-64 sm:max-w-64">
          <SelectItem
            value={ALL_BRANCHES}
            className="w-full max-w-full min-w-0 overflow-hidden py-2.5 *:[span]:last:min-w-0 *:[span]:last:truncate *:[span]:last:overflow-hidden"
          >
            <span className="block min-w-0 truncate">
              {t('allBranchesOption', { count: branches.length })}
            </span>
          </SelectItem>
          {branches.map((branch) => (
            <SelectItem
              key={branch.id}
              value={branch.id}
              className="w-full max-w-full min-w-0 overflow-hidden py-2.5 *:[span]:last:min-w-0 *:[span]:last:truncate *:[span]:last:overflow-hidden"
              title={branch.name}
            >
              <span className="block min-w-0 truncate">{branch.name}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  )
}
