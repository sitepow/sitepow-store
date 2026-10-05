'use client'

import { useEffect } from 'react'

import { useMerchantStoreSetup, useStoreOptions } from '@/actions/store/management/hooks'
import { useIsMounted } from '@/hooks/use-is-mounted'
import { useMerchantStoreSetupStore } from '@/stores/merchant/use-merchant-setup'
import { ALL_STORES, useStoreFilter } from '@/stores/merchant/use-store-filter'
import { IconFilter } from '@tabler/icons-react'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { Field, FieldLabel } from '@/components/ui/field'

export function StoreSelectField() {
  const isMounted = useIsMounted()
  const { data: stores = [], isLoading } = useStoreOptions()
  const { selectedStoreId, setSelectedStoreId, setSelectedStoreSlug } =
    useStoreFilter()

  const { data: setupStatus } = useMerchantStoreSetup(selectedStoreId)

  const setSetupStatus = useMerchantStoreSetupStore(
    (state) => state.setSetupStatus,
  )

  useEffect(() => {
    if (setupStatus) {
      setSetupStatus({
        hasShipping: setupStatus.hasShipping,
        hasPayment: setupStatus.hasPayment,
      })
    } else if (selectedStoreId === ALL_STORES) {
      setSetupStatus({
        hasShipping: true,
        hasPayment: true,
      })
    }
  }, [setupStatus, selectedStoreId, setSetupStatus])

  if (!isMounted) {
    return
  }

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

          if (value === ALL_STORES) {
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
          <SelectItem value={ALL_STORES}>
            ทุกร้านค้า ({stores.length})
          </SelectItem>
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
