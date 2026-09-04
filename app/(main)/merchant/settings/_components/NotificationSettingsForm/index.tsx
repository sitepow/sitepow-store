'use client'

import { useCallback, useEffect } from 'react'
import { FormProvider, useForm } from 'react-hook-form'

import { useTranslations } from 'next-intl'

import {
  useNotificationSettings,
  useUpdateNotificationSettings,
} from '@/actions/hooks/notification-settings'
import { ALL_STORES, useStoreFilter } from '@/stores/use-store-filter'
import {
  NotificationSettingsFormValues,
  notificationSettingsSchema,
} from '@/zod/notification-settings'
import { zodResolver } from '@hookform/resolvers/zod'
import { IconBell } from '@tabler/icons-react'

import { ActionRequiredAlert } from '@/components/ActionRequiredAlert'
import { PageTabHeader } from '@/components/PageTabHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'

import { NotificationRow } from './_components/NotificationRow'

export function NotificationSettingsForm() {
  const t = useTranslations('merchant.settings.notifications')
  const { selectedStoreId } = useStoreFilter()
  const { data: notificationSettings } = useNotificationSettings(
    selectedStoreId as string,
  )
  const updateMutation = useUpdateNotificationSettings()

  const methods = useForm<NotificationSettingsFormValues>({
    resolver: zodResolver(notificationSettingsSchema),
    defaultValues: {
      notifyLowStock: true,
      notifyDailySummary: true,
      notifyBillingAlert: true,
    },
  })

  const {
    handleSubmit,
    reset,
    formState: { isDirty },
  } = methods

  const resetForm = useCallback(() => {
    if (notificationSettings) {
      reset({
        ...notificationSettings,
      })
    }
  }, [notificationSettings, reset])

  useEffect(() => {
    if (notificationSettings) {
      resetForm()
    }
  }, [notificationSettings, reset, resetForm])

  const onSubmit = (values: NotificationSettingsFormValues) => {
    updateMutation.mutate({
      storeId: selectedStoreId,
      input: values,
    })
  }

  return (
    <Card>
      <CardHeader>
        <PageTabHeader
          variant="secondary"
          title={t('title')}
          description={t('description')}
          icon={IconBell}
        />
      </CardHeader>

      {selectedStoreId !== ALL_STORES && (
        <>
          <CardContent className="divide-border divide-y">
            <FormProvider {...methods}>
              <NotificationRow
                name="notifyLowStock"
                title={t('lowStockTitle')}
                description={t('lowStockDesc')}
              />
              <NotificationRow
                name="notifyDailySummary"
                title={t('dailySummaryTitle')}
                description={t('dailySummaryDesc')}
              />
              <NotificationRow
                name="notifyBillingAlert"
                title={t('billingAlertTitle')}
                description={t('billingAlertDesc')}
              />
            </FormProvider>
          </CardContent>

          <CardFooter className="flex flex-wrap justify-end gap-2.5 border-t">
            {isDirty && (
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
              disabled={updateMutation.isPending}
              onClick={handleSubmit(onSubmit)}
            >
              {updateMutation.isPending ? (
                <>
                  <Spinner />
                  {t('saving')}
                </>
              ) : (
                t('save')
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
