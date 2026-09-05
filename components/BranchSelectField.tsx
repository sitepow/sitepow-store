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
    return
  }

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
        <SelectTrigger className="w-full sm:w-64">
          <SelectValue placeholder={t('allBranchesPlaceholder')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_BRANCHES}>
            {t('allBranchesOption', { count: branches.length })}
          </SelectItem>
          {branches.map((branch) => (
            <SelectItem key={branch.id} value={branch.id}>
              {branch.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  )
}
