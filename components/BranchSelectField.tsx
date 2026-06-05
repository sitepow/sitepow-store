import { useBranchOptions } from '@/actions/hooks/branch'
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
  const { selectedStoreId } = useStoreFilter()
  const { selectedBranchId, setSelectedBranchId } = useBranchFilter()
  const { data: branches = [], isLoading } = useBranchOptions(selectedStoreId)

  return (
    <Field className="w-full sm:w-fit">
      <FieldLabel>
        <IconFilter size={14} />
        เลือกสาขา
      </FieldLabel>
      <Select
        value={selectedBranchId}
        onValueChange={setSelectedBranchId}
        disabled={isLoading || !selectedStoreId}
      >
        <SelectTrigger className="w-full sm:w-64">
          <SelectValue placeholder="เลือกดูทุกสาขา" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_BRANCHES}>
            ทุกสาขา ({branches.length})
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
