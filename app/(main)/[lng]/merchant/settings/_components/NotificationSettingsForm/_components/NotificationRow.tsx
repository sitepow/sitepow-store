'use client'

import { useFormContext } from 'react-hook-form'

import { NotificationSettingsFormValues } from '@/zod/notification-settings'

import { Switch } from '@/components/ui/switch'

interface NotificationRowProps {
  name: keyof NotificationSettingsFormValues
  title: string
  description: string
}

export function NotificationRow({
  name,
  title,
  description,
}: NotificationRowProps) {
  const { watch, setValue, formState } =
    useFormContext<NotificationSettingsFormValues>()

  return (
    <div className="flex flex-wrap items-center justify-between gap-5 py-5">
      <div>
        <span className="block text-sm font-medium">{title}</span>
        <span className="text-muted-foreground mt-1 block max-w-xl text-xs leading-relaxed">
          {description}
        </span>
      </div>
      <Switch
        checked={watch(name) ?? false}
        disabled={formState.isSubmitting}
        onCheckedChange={(v) =>
          setValue(name, v, { shouldValidate: true, shouldDirty: true })
        }
      />
    </div>
  )
}
