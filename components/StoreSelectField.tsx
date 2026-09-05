'use client'

import { useEffect } from 'react'

import { useTranslations } from 'next-intl'

import { useMerchantStoreSetup, useStoreOptions } from '@/actions/hooks/store'
import { useIsMounted } from '@/hooks/use-is-mounted'
import { useMerchantStoreSetupStore } from '@/stores/use-merchant-store-setup-store'
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

export function StoreSelectField() {
  const t = useTranslations('merchant.shell')
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
        {t('selectStoreLabel')}
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
          <SelectValue placeholder={t('allStoresPlaceholder')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_STORES}>
            {t('allStoresOption', { count: stores.length })}
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
