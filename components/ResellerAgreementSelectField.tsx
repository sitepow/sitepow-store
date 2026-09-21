'use client'

import { useEffect } from 'react'

import {
  useAllResellerAgreements,
  useResellerAgreements,
} from '@/actions/hooks/reseller'
import { useIsMounted } from '@/hooks/use-is-mounted'
import { useResellerFilter } from '@/stores/use-reseller-filter'
import { ALL_STORES, useStoreFilter } from '@/stores/use-store-filter'
import { IconFileText } from '@tabler/icons-react'

import { Field, FieldLabel } from '@/components/ui/field'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface ResellerAgreementSelectFieldProps {
  value?: string
  onValueChange?: (value: string) => void
  disabled?: boolean
  mode?: 'default' | 'all'
}

export function ResellerAgreementSelectField({
  value,
  onValueChange,
  disabled = false,
  mode = 'default',
}: ResellerAgreementSelectFieldProps) {
  const isMounted = useIsMounted()
  const { selectedStoreId } = useStoreFilter()
  const { selectedAgreementId, setSelectedAgreementId } = useResellerFilter()

  const storeId = selectedStoreId !== ALL_STORES ? selectedStoreId : ''

  const defaultQuery = useResellerAgreements(mode === 'default' ? storeId : '')
  const allQuery = useAllResellerAgreements(mode === 'all' ? storeId : '')

  const activeQuery = mode === 'all' ? allQuery : defaultQuery
  const agreements = activeQuery.data?.data || []
  const isLoading = activeQuery.isLoading

  const currentValue = value ?? (selectedAgreementId || ALL_STORES)
  const handleValueChange = onValueChange ?? setSelectedAgreementId

  useEffect(() => {
    if (isLoading) {
      return
    }

    if (currentValue !== ALL_STORES) {
      const isValid = agreements.some((item) => item.id === currentValue)
      if (!isValid) {
        handleValueChange(ALL_STORES)
      }
    }
  }, [selectedStoreId, activeQuery.data?.data, isLoading])

  if (!isMounted) {
    return null
  }

  return (
    <Field className="text-foreground w-full sm:w-fit">
      <FieldLabel>
        <IconFileText size={14} />
        เลือกสัญญาตัวแทน
      </FieldLabel>
      <Select
        value={currentValue}
        onValueChange={handleValueChange}
        disabled={isLoading || disabled}
      >
        <SelectTrigger className="w-full sm:w-64">
          <SelectValue
            placeholder={isLoading ? 'กำลังโหลด...' : 'เลือกสัญญาตัวแทน'}
          />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_STORES}>ไม่เลือกสัญญา</SelectItem>
          {agreements.map((agreement) => {
            const isSupplier = agreement.supplierStoreId === storeId
            const userName =
              agreement.resellerUser?.name || agreement.resellerUser?.email

            const displayName = isSupplier
              ? agreement.resellerStore?.name ||
                userName ||
                `สัญญา ID: ${agreement.id.slice(0, 8)}...`
              : agreement.supplierStore?.name ||
                `สัญญา ID: ${agreement.id.slice(0, 8)}...`

            return (
              <SelectItem key={agreement.id} value={agreement.id}>
                {displayName}
              </SelectItem>
            )
          })}
        </SelectContent>
      </Select>
    </Field>
  )
}
