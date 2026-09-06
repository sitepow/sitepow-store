'use client'

import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

import { useLocale, useTranslations } from 'next-intl'

import {
  useCreateWebhookEndpoint,
  useUpdateWebhookEndpoint,
} from '@/actions/hooks/webhook'
import { StoreWebhookEndpointItem } from '@/actions/webhook'
import { WEBHOOK_EVENTS, getWebhookEvents } from '@/constants/webhook'
import { ALL_STORES, useStoreFilter } from '@/stores/use-store-filter'
import { WebhookEndpointFormValues, webhookEndpointSchema } from '@/zod/webhook'
import { zodResolver } from '@hookform/resolvers/zod'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { Switch } from '@/components/ui/switch'

interface WebhookEndpointDialogProps {
  open: boolean
  setOpen: (open: boolean) => void
  endpoint?: StoreWebhookEndpointItem | null
}

export function WebhookEndpointDialog({
  open,
  setOpen,
  endpoint,
}: WebhookEndpointDialogProps) {
  const t = useTranslations('merchant.settings.webhook.dialog')
  const tEvents = useTranslations('merchant.settings.webhook.events')
  const locale = useLocale()
  const fallbackEvents = getWebhookEvents(locale)
  const { selectedStoreId } = useStoreFilter()
  const isEditing = !!endpoint

  const { mutate: createEndpoint, isPending: isCreating } =
    useCreateWebhookEndpoint()
  const { mutate: updateEndpoint, isPending: isUpdating } =
    useUpdateWebhookEndpoint()

  const isPending = isCreating || isUpdating

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<WebhookEndpointFormValues>({
    resolver: zodResolver(webhookEndpointSchema),
    defaultValues: {
      url: '',
      description: '',
      events: ['order.paid'],
      isActive: true,
    },
  })

  useEffect(() => {
    if (open) {
      if (endpoint) {
        reset({
          url: endpoint.url,
          description: endpoint.description || '',
          events: endpoint.events,
          isActive: endpoint.isActive,
        })
      } else {
        reset({
          url: '',
          description: '',
          events: ['order.paid'],
          isActive: true,
        })
      }
    }
  }, [open, endpoint, reset])

  const onSubmit = (values: WebhookEndpointFormValues) => {
    if (!selectedStoreId || selectedStoreId === ALL_STORES) {
      toast.error(t('selectStoreError'))
      return
    }

    if (isEditing && endpoint) {
      updateEndpoint(
        {
          endpointId: endpoint.id,
          storeId: selectedStoreId,
          data: values,
        },
        {
          onSuccess: (res) => {
            if (res.success) {
              toast.success(t('updateSuccess'))
              setOpen(false)
            } else {
              toast.error(res.message || t('error'))
            }
          },
          onError: (err) => {
            toast.error(err.message)
          },
        },
      )
    } else {
      createEndpoint(
        {
          storeId: selectedStoreId,
          data: values,
        },
        {
          onSuccess: (res) => {
            if (res.success) {
              toast.success(t('createSuccess'))
              setOpen(false)
            } else {
              toast.error(res.message || t('error'))
            }
          },
          onError: (err) => {
            toast.error(err.message)
          },
        },
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? t('editTitle') : t('addTitle')}
          </DialogTitle>
          <DialogDescription>{t('description')}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <Field>
            <FieldLabel>
              {t('urlLabel')} <span className="text-destructive">*</span>
            </FieldLabel>
            <Controller
              name="url"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder={t('urlPlaceholder')}
                  autoComplete="off"
                />
              )}
            />
            {errors.url && <FieldError>{errors.url.message}</FieldError>}
            <p className="text-muted-foreground text-xs">{t('urlDesc')}</p>
          </Field>

          <Field>
            <FieldLabel>{t('descriptionLabel')}</FieldLabel>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  value={field.value || ''}
                  placeholder={t('descriptionPlaceholder')}
                />
              )}
            />
          </Field>
          <Field>
            <FieldLabel>
              {t('eventsLabel')} <span className="text-destructive">*</span>
            </FieldLabel>
            <Controller
              name="events"
              control={control}
              render={({ field }) => (
                <div className="space-y-2.5 rounded-lg border p-3">
                  {WEBHOOK_EVENTS.map((event) => {
                    const isChecked = field.value?.includes(event.id)
                    const fallback =
                      fallbackEvents.find((e) => e.id === event.id) ?? event
                    const camelKey = event.id.replace(/\.([a-z])/g, (_, l) =>
                      l.toUpperCase(),
                    )
                    const label = tEvents.has(`${event.id}.label` as any)
                      ? tEvents(`${event.id}.label` as any)
                      : tEvents.has(`${camelKey}.label` as any)
                        ? tEvents(`${camelKey}.label` as any)
                        : fallback.label
                    const description = tEvents.has(
                      `${event.id}.description` as any,
                    )
                      ? tEvents(`${event.id}.description` as any)
                      : tEvents.has(`${camelKey}.description` as any)
                        ? tEvents(`${camelKey}.description` as any)
                        : fallback.description
                    return (
                      <div
                        key={event.id}
                        className="hover:bg-muted/50 flex items-start space-x-3 rounded-md p-1.5 transition-colors"
                      >
                        <Checkbox
                          id={`event-${event.id}`}
                          checked={isChecked}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              field.onChange([...(field.value || []), event.id])
                            } else {
                              field.onChange(
                                field.value?.filter((id) => id !== event.id),
                              )
                            }
                          }}
                        />
                        <div className="grid gap-0.5 leading-none">
                          <label
                            htmlFor={`event-${event.id}`}
                            className="cursor-pointer text-sm font-medium"
                          >
                            {label}
                          </label>
                          <p className="text-muted-foreground text-xs">
                            {description}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            />
            {errors.events && <FieldError>{errors.events.message}</FieldError>}
          </Field>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="space-y-0.5">
              <span className="text-sm font-medium">{t('activeLabel')}</span>
              <p className="text-muted-foreground text-xs">{t('activeDesc')}</p>
            </div>
            <Controller
              name="isActive"
              control={control}
              render={({ field }) => (
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
          </div>
          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              {t('cancel')}
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Spinner className="mr-2 h-4 w-4" />}
              {isEditing ? t('saveEdit') : t('create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
