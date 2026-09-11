'use client'

import { useCurrentStore } from '@/hooks/use-current-store'

import { useCallback, useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'

import { useTranslations } from 'next-intl'

import { useTaxSetting, useUpdateTaxSetting } from '@/actions/hooks/tax'
import { ALL_STORES, useStoreFilter } from '@/stores/use-store-filter'
import { TaxSettingFormValues, taxSettingSchema } from '@/zod/tax'
import { zodResolver } from '@hookform/resolvers/zod'
import { IconDeviceFloppy, IconReceiptTax } from '@tabler/icons-react'

import { ActionRequiredAlert } from '@/components/ActionRequiredAlert'
import { PageTabHeader } from '@/components/PageTabHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { Switch } from '@/components/ui/switch'

export function TaxSettingsForm() {
  const { currentStore, store } = useCurrentStore()
  const t = useTranslations('merchant.settings.tax')
  const { selectedStoreId } = useStoreFilter()
  const { data: taxSetting } = useTaxSetting(selectedStoreId)

  const { mutate: updateTax, isPending: isSaving } = useUpdateTaxSetting()

  const form = useForm<TaxSettingFormValues>({
    resolver: zodResolver(taxSettingSchema),
    defaultValues: {
      isVatRegistered: true,
      vatRate: '7.0',
      taxId: '',
    },
  })

  const resetForm = useCallback(() => {
    if (taxSetting) {
      form.reset({
        ...taxSetting,
        taxId: taxSetting.taxId?.toString(),
        vatRate: taxSetting.vatRate.toString(),
      })
    }
  }, [taxSetting, form])

  useEffect(() => {
    if (taxSetting) {
      form.reset({
        ...taxSetting,
        taxId: taxSetting.taxId?.toString(),
        vatRate: taxSetting.vatRate.toString(),
      })
    }
  }, [taxSetting, form])

  const onSubmit = (data: TaxSettingFormValues) => {
    if (selectedStoreId === ALL_STORES) {
      return
    }

    updateTax({ storeId: selectedStoreId, data })
  }

  const isVatRegistered = form.watch('isVatRegistered')

  return (
    <Card
      style={{
        '--primary': currentStore?.primaryColor ?? store?.primaryColor,
      } as React.CSSProperties}
    >
      <CardHeader>
        <PageTabHeader
          variant="secondary"
          icon={IconReceiptTax}
          title={t('title')}
          description={t('description')}
        />
      </CardHeader>
      {selectedStoreId !== ALL_STORES && (
        <>
          <CardContent>
            <div className="grid gap-5 lg:grid-cols-2">
              <Field>
                <div className="flex items-center gap-2.5">
                  <Controller
                    control={form.control}
                    name="isVatRegistered"
                    render={({ field }) => (
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                  <FieldLabel>{t('vatRate')}</FieldLabel>
                </div>
                <div className="mt-1 flex items-center">
                  <Input
                    id="vat-rate"
                    type="number"
                    step="0.1"
                    placeholder="7.0"
                    disabled={!isVatRegistered}
                    {...form.register('vatRate')}
                    className="rounded-r-none"
                  />
                  <span className="border-input bg-muted text-muted-foreground flex h-9 items-center rounded-r-md border border-l-0 px-3 text-sm select-none">
                    %
                  </span>
                </div>
                <FieldDescription>{t('vatRateDesc')}</FieldDescription>
              </Field>
              <Field>
                <FieldLabel>{t('taxId')}</FieldLabel>
                <Input
                  placeholder={t('taxIdPlaceholder')}
                  {...form.register('taxId')}
                  maxLength={13}
                />
              </Field>
            </div>
          </CardContent>
          <CardFooter className="flex flex-wrap justify-end gap-2.5 border-t">
            {form.formState.isDirty && (
              <Button
                type="button"
                variant="outline"
                onClick={() => resetForm()}
              >
                {t('reset')}
              </Button>
            )}
            <Button
              size="sm"
              onClick={form.handleSubmit(onSubmit)}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Spinner /> {t('saving')}
                </>
              ) : (
                <>
                  <IconDeviceFloppy size={14} /> {t('save')}
                </>
              )}
            </Button>
          </CardFooter>
        </>
      )}
      {selectedStoreId === ALL_STORES && (
        <CardContent>
          <ActionRequiredAlert />
        </CardContent>
      )}
    </Card>
  )
}
