import { useStoreOptions } from '@/actions/hooks/store'
import { IconFilter } from '@tabler/icons-react'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { Field, FieldLabel } from './ui/field'

interface StoreSelectFieldProps {
  value: string
  onValueChange: (value: string) => void
}

export function StoreSelectField({
  value,
  onValueChange,
}: StoreSelectFieldProps) {
  const { data: stores = [], isLoading } = useStoreOptions()

  return (
    <Field className="w-full sm:w-fit">
      <FieldLabel>
        <IconFilter size={14} />
        กรองตามร้านค้า
      </FieldLabel>
      <Select value={value} onValueChange={onValueChange} disabled={isLoading}>
        <SelectTrigger className="w-full sm:w-64">
          <SelectValue placeholder="เลือกดูทุกร้านค้า" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">ทุกร้านค้า ({stores.length})</SelectItem>
          {stores.map((store) => (
            <SelectItem key={store.id} value={store.id}>
              {store.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  )
}
