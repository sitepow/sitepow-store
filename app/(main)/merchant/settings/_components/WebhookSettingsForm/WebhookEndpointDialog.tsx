'use client'

import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'

import {
  useCreateWebhookEndpoint,
  useUpdateWebhookEndpoint,
} from '@/actions/store/webhook/hooks'
import {
  WEBHOOK_AVAILABLE_EVENTS,
  WebhookEndpointFormValues,
  webhookEndpointSchema,
} from '@/zod/store/webhook-settings'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  IconCheck,
  IconPlus,
  IconRefresh,
  IconWebhook,
} from '@tabler/icons-react'

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
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'

interface WebhookEndpointDialogProps {
  storeId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  endpoint?: {
    id: string
    url: string
    secret: string
    description: string | null
    isActive: boolean
    events: string[]
  } | null
}

function generateClientSecret(): string {
  const arr = new Uint8Array(24)
  window.crypto.getRandomValues(arr)
  return `whsec_${Array.from(arr, (b) => b.toString(16).padStart(2, '0')).join('')}`
}

export function WebhookEndpointDialog({
  storeId,
  open,
  onOpenChange,
  endpoint,
}: WebhookEndpointDialogProps) {
  const isEditing = Boolean(endpoint)
  const createMutation = useCreateWebhookEndpoint(storeId)
  const updateMutation = useUpdateWebhookEndpoint(storeId)

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<WebhookEndpointFormValues>({
    resolver: zodResolver(webhookEndpointSchema),
    defaultValues: {
      url: '',
      secret: '',
      description: '',
      isActive: true,
      events: [
        'order.created',
        'order.paid',
        'order.shipped',
        'order.cancelled',
      ],
    },
  })

  useEffect(() => {
    if (open) {
      if (endpoint) {
        reset({
          url: endpoint.url,
          secret: endpoint.secret,
          description: endpoint.description || '',
          isActive: endpoint.isActive,
          events: endpoint.events,
        })
      } else {
        reset({
          url: '',
          secret: generateClientSecret(),
          description: '',
          isActive: true,
          events: [
            'order.created',
            'order.paid',
            'order.shipped',
            'order.cancelled',
          ],
        })
      }
    }
  }, [open, endpoint, reset])

  const selectedEvents = watch('events') || []

  const toggleEvent = (eventVal: string) => {
    if (selectedEvents.includes(eventVal)) {
      setValue(
        'events',
        selectedEvents.filter((e) => e !== eventVal),
        { shouldValidate: true },
      )
    } else {
      setValue('events', [...selectedEvents, eventVal], {
        shouldValidate: true,
      })
    }
  }

  const handleRegenerateSecret = () => {
    setValue('secret', generateClientSecret(), { shouldValidate: true })
  }

  const onSubmit = (values: WebhookEndpointFormValues) => {
    if (isEditing && endpoint) {
      updateMutation.mutate(
        { id: endpoint.id, input: values },
        {
          onSuccess: (res) => {
            if (res.success) {
              onOpenChange(false)
            }
          },
        },
      )
    } else {
      createMutation.mutate(values, {
        onSuccess: (res) => {
          if (res.success) {
            onOpenChange(false)
          }
        },
      })
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <IconWebhook className="text-primary h-5 w-5" />
            <DialogTitle>
              {isEditing
                ? 'แก้ไข Webhook Endpoint'
                : 'เพิ่ม Webhook Endpoint ใหม่'}
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs">
            กำหนด URL
            ปลายทางและเลือกเหตุการณ์ของออเดอร์ที่ต้องการให้ระบบส่งแจ้งเตือน
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-1">
          {/* URL */}
          <Field>
            <FieldLabel htmlFor="webhook-url" className="text-xs">
              Webhook URL <span className="text-destructive">*</span>
            </FieldLabel>
            <Input
              id="webhook-url"
              placeholder="https://api.example.com/webhooks/orders"
              className="font-mono text-xs"
              {...register('url')}
            />
            <FieldDescription className="text-[11px]">
              URL ปลายทางที่รองรับคำขอ HTTP POST (ต้องขึ้นต้นด้วย https://)
            </FieldDescription>
            {errors.url && <FieldError>{errors.url.message}</FieldError>}
          </Field>

          {/* Description */}
          <Field>
            <FieldLabel htmlFor="webhook-desc" className="text-xs">
              คำอธิบาย / ชื่อเรียก (Description)
            </FieldLabel>
            <Input
              id="webhook-desc"
              placeholder="เช่น บอทเติมเกมอัตโนมัติ, Discord Bot, ERP System"
              className="text-xs"
              {...register('description')}
            />
          </Field>

          {/* Secret Key */}
          <Field>
            <div className="flex items-center justify-between">
              <FieldLabel htmlFor="webhook-secret" className="text-xs">
                Secret Key (สำหรับตรวจสอบ HMAC Signature){' '}
                <span className="text-destructive">*</span>
              </FieldLabel>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground h-6 gap-1 text-[11px]"
                onClick={handleRegenerateSecret}
              >
                <IconRefresh className="h-3 w-3" /> สุ่มใหม่
              </Button>
            </div>
            <Input
              id="webhook-secret"
              placeholder="whsec_..."
              className="font-mono text-xs"
              {...register('secret')}
            />
            <FieldDescription className="text-[11px]">
              ใช้สำหรับตรวจสอบ Header{' '}
              <code className="bg-muted rounded px-1">X-Webhook-Signature</code>{' '}
              ว่ามาจาก Sitepow จริง
            </FieldDescription>
            {errors.secret && <FieldError>{errors.secret.message}</FieldError>}
          </Field>

          {/* Active status */}
          <div className="bg-muted/30 flex items-center justify-between rounded-lg border p-3">
            <div className="space-y-0.5">
              <div className="text-xs font-medium">เปิดใช้งาน Webhook นี้</div>
              <div className="text-muted-foreground text-[11px]">
                เมื่อปิดใช้งาน ระบบจะไม่ส่งข้อมูลไปยัง URL นี้ชั่วคราว
              </div>
            </div>
            <Controller
              control={control}
              name="isActive"
              render={({ field }) => (
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
          </div>

          {/* Events selection */}
          <div className="space-y-2">
            <FieldLabel className="text-xs">
              เหตุการณ์ที่ต้องการรับ (Events){' '}
              <span className="text-destructive">*</span>
            </FieldLabel>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {WEBHOOK_AVAILABLE_EVENTS.map((event) => {
                const isChecked = selectedEvents.includes(event.value)
                return (
                  <div
                    key={event.value}
                    onClick={() => toggleEvent(event.value)}
                    className={`flex cursor-pointer items-start gap-2.5 rounded-lg border p-2.5 transition-colors ${
                      isChecked
                        ? 'border-primary/50 bg-primary/5 dark:bg-primary/10'
                        : 'border-border hover:bg-muted/40'
                    }`}
                  >
                    <Checkbox
                      checked={isChecked}
                      onCheckedChange={() => toggleEvent(event.value)}
                      className="mt-0.5"
                    />
                    <div className="space-y-0.5">
                      <div className="text-xs font-semibold">{event.label}</div>
                      <div className="text-muted-foreground text-[11px]">
                        {event.description}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            {errors.events && <FieldError>{errors.events.message}</FieldError>}
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              ยกเลิก
            </Button>
            <Button type="submit" size="sm" disabled={isPending}>
              {isPending
                ? 'กำลังบันทึก...'
                : isEditing
                  ? 'บันทึกการเปลี่ยนแปลง'
                  : 'เพิ่ม Webhook Endpoint'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
