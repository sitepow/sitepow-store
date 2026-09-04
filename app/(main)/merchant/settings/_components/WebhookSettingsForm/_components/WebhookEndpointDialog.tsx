'use client'

import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

import {
  useCreateWebhookEndpoint,
  useUpdateWebhookEndpoint,
} from '@/actions/hooks/webhook'
import { StoreWebhookEndpointItem } from '@/actions/webhook'
import { WEBHOOK_EVENTS } from '@/constants/webhook'
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
      toast.error('กรุณาเลือกร้านค้าก่อนทำรายการ')
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
              toast.success('อัปเดต Webhook Endpoint สำเร็จ')
              setOpen(false)
            } else {
              toast.error(res.message || 'เกิดข้อผิดพลาด')
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
              toast.success('สร้าง Webhook Endpoint สำเร็จ')
              setOpen(false)
            } else {
              toast.error(res.message || 'เกิดข้อผิดพลาด')
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
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'แก้ไข Webhook Endpoint' : 'เพิ่ม Webhook Endpoint'}
          </DialogTitle>
          <DialogDescription>
            กำหนด URL ปลายทางที่ต้องการให้ระบบส่ง Event
            แจ้งเตือนเมื่อเกิดเหตุการณ์ในร้านค้า
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <Field>
            <FieldLabel>
              Endpoint URL <span className="text-destructive">*</span>
            </FieldLabel>
            <Controller
              name="url"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="https://api.yourshop.com/webhooks/sitepow"
                  autoComplete="off"
                />
              )}
            />
            {errors.url && <FieldError>{errors.url.message}</FieldError>}
            <p className="text-muted-foreground text-xs">
              ระบบจะส่ง HTTP POST พร้อม Header ลายเซ็นดิจิทัล (HMAC-SHA256)
              ไปยัง URL นี้
            </p>
          </Field>

          <Field>
            <FieldLabel>คำอธิบาย / โน้ตกำกับ (ไม่บังคับ)</FieldLabel>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  value={field.value || ''}
                  placeholder="เช่น ระบบเติมเกม RoV / FreeFire อัตโนมัติ"
                />
              )}
            />
          </Field>
          <Field>
            <FieldLabel>
              Events ที่ต้องการดักฟัง{' '}
              <span className="text-destructive">*</span>
            </FieldLabel>
            <Controller
              name="events"
              control={control}
              render={({ field }) => (
                <div className="space-y-2.5 rounded-lg border p-3">
                  {WEBHOOK_EVENTS.map((event) => {
                    const isChecked = field.value?.includes(event.id)
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
                            {event.label}
                          </label>
                          <p className="text-muted-foreground text-xs">
                            {event.description}
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
              <span className="text-sm font-medium">เปิดใช้งาน (Active)</span>
              <p className="text-muted-foreground text-xs">
                หากปิดไว้ ระบบจะไม่ยิงส่ง Event ไปยัง URL นี้
              </p>
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
              ยกเลิก
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Spinner className="mr-2 h-4 w-4" />}
              {isEditing ? 'บันทึกการแก้ไข' : 'สร้าง Endpoint'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
