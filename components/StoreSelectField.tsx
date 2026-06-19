import { useStoreOptions } from '@/actions/hooks/store'
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

export function StoreSelectField() {
  const { data: stores = [], isLoading } = useStoreOptions()
  const { selectedStoreId, setSelectedStoreId, setSelectedStoreSlug } =
    useStoreFilter()

  return (
    <Field className="text-foreground w-full sm:w-fit">
      <FieldLabel>
        <IconFilter size={14} />
        เลือกร้านค้าของคุณ
      </FieldLabel>
      <Select
        value={selectedStoreId}
        onValueChange={(value) => {
          setSelectedStoreId(value)

          if (value === 'all') {
            setSelectedStoreSlug('')
          } else {
            const selectedStore = stores.find((s) => s.id === value)
            if (selectedStore) {
              setSelectedStoreSlug(selectedStore.slug)
            }
          }
        }}
        disabled={isLoading}
      >
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
