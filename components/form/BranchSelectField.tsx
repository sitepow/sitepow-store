import { useBranchOptions } from '@/actions/store/branch/hooks'
import { useIsMounted } from '@/hooks/use-is-mounted'
import { ALL_BRANCHES, useBranchFilter } from '@/stores/merchant/use-branch-filter'
import { useStoreFilter } from '@/stores/merchant/use-store-filter'
import { IconFilter } from '@tabler/icons-react'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { Field, FieldLabel } from '@/components/ui/field'

export function BranchSelectField() {
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
        เลือกสาขาของร้านค้า
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
