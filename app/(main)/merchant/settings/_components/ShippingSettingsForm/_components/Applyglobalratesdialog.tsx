'use client'

import { useCurrentStore } from '@/hooks/use-current-store'

import { useState } from 'react'
import toast from 'react-hot-toast'

import { useTranslations } from 'next-intl'

import {
  useApplyGlobalRates,
  useGlobalShippingMetadata,
  useGlobalShippingRateMatrixProvinces,
} from '@/actions/hooks/global-shipping-rate-matrix'
import { useBranchFilter } from '@/stores/use-branch-filter'
import { useStoreFilter } from '@/stores/use-store-filter'
import { formatDateTime } from '@/utils/date'
import { IconCloudDownload } from '@tabler/icons-react'

import { DialogHeaderIcon } from '@/components/DialogHeaderIcon'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'

export function ApplyGlobalRatesDialog() {
  const { currentStore, store } = useCurrentStore()
  const t = useTranslations('merchant.settings.shipping.applyGlobal')
  const [open, setOpen] = useState(false)
  const [selectedProvince, setSelectedProvince] = useState<string>('')

  const { selectedStoreId } = useStoreFilter()
  const { selectedBranchId } = useBranchFilter()

  const { mutate: applyRates, isPending: isApplying } = useApplyGlobalRates()
  const { data: provinces } = useGlobalShippingRateMatrixProvinces()
  const { data: matrixMeta } = useGlobalShippingMetadata(selectedProvince)

  const handleApply = () => {
    if (!selectedProvince || !selectedStoreId) {
      return
    }

    applyRates(
      {
        storeId: selectedStoreId,
        branchId: selectedBranchId,
        fromProvince: selectedProvince,
      },
      {
        onSuccess: () => {
          setOpen(false)
        },
        onError: (err) => {
          toast.error(err.message)
        },
      },
    )
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) {
          setSelectedProvince('')
        }
        setOpen(v)
      }}
    >
      <DialogTrigger asChild>
        <Button type="button" variant="outline">
          <IconCloudDownload />
          {t('trigger')}
        </Button>
      </DialogTrigger>

      <DialogContent
        style={{
        '--primary': currentStore?.primaryColor ?? store?.primaryColor,
      } as React.CSSProperties}>
        <DialogHeader>
          <DialogHeaderIcon
            icon={IconCloudDownload}
            title={t('title')}
            description={t('description')}
          />
        </DialogHeader>

        <Field>
          <FieldLabel>{t('provinceLabel')}</FieldLabel>
          <Select value={selectedProvince} onValueChange={setSelectedProvince}>
            <SelectTrigger>
              <SelectValue placeholder={t('provincePlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              {provinces?.map((matrix) => (
                <SelectItem
                  key={matrix?.fromProvince}
                  value={matrix?.fromProvince}
                >
                  {matrix?.fromProvince}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedProvince && (
            <FieldDescription>
              {t('updatedAt', {
                date: matrixMeta?.updatedAt
                  ? formatDateTime(matrixMeta?.updatedAt)
                  : '-',
              })}
            </FieldDescription>
          )}
        </Field>

        <DialogFooter>
          <Button
            type="button"
            disabled={!selectedProvince || isApplying}
            onClick={handleApply}
          >
            {isApplying ? (
              <>
                <Spinner />
                {t('updating')}
              </>
            ) : (
              <>
                <IconCloudDownload size={14} />
                {t('apply')}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
