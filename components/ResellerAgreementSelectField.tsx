'use client'

import { useEffect } from 'react'

import { useResellerAgreements } from '@/actions/hooks/reseller'
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
}

export function ResellerAgreementSelectField({
  value,
  onValueChange,
  disabled = false,
}: ResellerAgreementSelectFieldProps) {
  const isMounted = useIsMounted()
  const { selectedStoreId } = useStoreFilter()
  const { selectedAgreementId, setSelectedAgreementId } = useResellerFilter()

  const storeId = selectedStoreId !== ALL_STORES ? selectedStoreId : ''

  const { data: agreementsRes, isLoading } = useResellerAgreements(storeId)
  const agreements = agreementsRes?.data || []

  const currentValue = value ?? selectedAgreementId
  const handleValueChange = onValueChange ?? setSelectedAgreementId

  useEffect(() => {
    if (isLoading) {
      return
    }

    if (agreements.length > 0) {
      const isValid = agreements.some((item) => item.id === currentValue)
      if (!isValid) {
        handleValueChange(agreements[0].id)
      }
    } else {
      handleValueChange('')
    }
  }, [selectedStoreId, agreementsRes?.data, isLoading])

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
        value={currentValue || undefined}
        onValueChange={handleValueChange}
        disabled={isLoading || disabled || agreements.length === 0}
      >
        <SelectTrigger className="w-full sm:w-64">
          <SelectValue
            placeholder={isLoading ? 'กำลังโหลด...' : 'เลือกสัญญาตัวแทน'}
          />
        </SelectTrigger>
        <SelectContent>
          {agreements.length === 0 ? (
            <SelectItem value="none" disabled>
              ไม่พบสัญญาตัวแทน
            </SelectItem>
          ) : (
            agreements.map((agreement) => {
              const userName =
                agreement.resellerUser?.name || agreement.resellerUser?.email

              const resellerName =
                agreement.resellerStore?.name ||
                userName ||
                `สัญญา ID: ${agreement.id.slice(0, 8)}...`

              return (
                <SelectItem key={agreement.id} value={agreement.id}>
                  {resellerName}
                </SelectItem>
              )
            })
          )}
        </SelectContent>
      </Select>
    </Field>
  )
}
