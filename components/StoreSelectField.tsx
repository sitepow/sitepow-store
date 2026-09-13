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

  // Fallback to ALL_STORES if selected store is invalid or no longer exists in stores list
  useEffect(() => {
    if (isLoading) return

    const isValidStore =
      selectedStoreId === ALL_STORES ||
      stores.some((s) => s.id === selectedStoreId)

    if (!isValidStore) {
      setSelectedStoreId(ALL_STORES)
      setSelectedStoreSlug('')
    }
  }, [
    isLoading,
    stores,
    selectedStoreId,
    setSelectedStoreId,
    setSelectedStoreSlug,
  ])

  if (!isMounted) {
    return null
  }

  const currentStore = stores.find((s) => s.id === selectedStoreId)
  const currentStoreTitle =
    selectedStoreId === ALL_STORES
      ? t('allStoresOption', { count: stores.length })
      : (currentStore?.name ?? t('allStoresPlaceholder'))

  return (
    <Field className="text-foreground w-full max-w-full min-w-0 sm:w-64 sm:max-w-64">
      <FieldLabel className="max-w-full min-w-0">
        <IconFilter size={14} className="shrink-0" />
        <span className="truncate">{t('selectStoreLabel')}</span>
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
        <SelectTrigger
          className="w-full max-w-full min-w-0 overflow-hidden *:data-[slot=select-value]:min-w-0 *:data-[slot=select-value]:flex-1 *:data-[slot=select-value]:truncate *:data-[slot=select-value]:overflow-hidden sm:w-64 sm:max-w-64 [&_[data-slot=select-value]_span]:block [&_[data-slot=select-value]_span]:min-w-0 [&_[data-slot=select-value]_span]:truncate"
          title={currentStoreTitle}
        >
          <SelectValue placeholder={t('allStoresPlaceholder')} />
        </SelectTrigger>
        <SelectContent className="w-[calc(100vw-2rem)] max-w-xs min-w-48 sm:w-64 sm:max-w-64">
          <SelectItem
            value={ALL_STORES}
            className="w-full max-w-full min-w-0 overflow-hidden py-2.5 *:[span]:last:min-w-0 *:[span]:last:truncate *:[span]:last:overflow-hidden"
          >
            <span className="block min-w-0 truncate">
              {t('allStoresOption', { count: stores.length })}
            </span>
          </SelectItem>
          {stores.map((store) => (
            <SelectItem
              key={store.id}
              value={store.id}
              className="w-full max-w-full min-w-0 overflow-hidden py-2.5 *:[span]:last:min-w-0 *:[span]:last:truncate *:[span]:last:overflow-hidden"
              title={store.name}
            >
              <span className="block min-w-0 truncate">{store.name}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  )
}
