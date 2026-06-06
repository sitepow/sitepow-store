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
    <div className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
      <div className="pr-4">
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
